// src/lib/payment-actions.ts
'use server';

import { z } from 'zod';
import prisma from './prisma';
import { findStudentByCode } from './student-code-utils';
import { getPaymentAmount } from './payment-config';
import { revalidatePath } from 'next/cache';
import { Receipt } from '@prisma/client';

// Schema for QR code payment (no amount needed - determined automatically)
const QRPaymentSchema = z.object({
  studentReadableId: z.string().min(1, "كود الطالب مطلوب"),
  month: z.number().min(1).max(12).optional(), // Optional for non-current month payments
  year: z.number().min(2020).optional(), // Optional for non-current month payments
});

export type QRPaymentState = {
  success: boolean;
  message: string;
  receipt?: Receipt;
  studentName?: string;
  amount?: number;
};

/**
 * Records payment using QR code with automatic amount calculation
 */
export async function recordQRPayment(
  studentReadableId: string,
  targetMonth?: number,
  targetYear?: number
): Promise<QRPaymentState> {
  try {
    // Validate input
    const validatedFields = QRPaymentSchema.safeParse({
      studentReadableId,
      month: targetMonth,
      year: targetYear
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "بيانات غير صحيحة"
      };
    }

    // Find student using backward compatibility function
    const student = await findStudentByCode(studentReadableId);
    if (!student) {
      return { 
        success: false, 
        message: "الطالب غير موجود" 
      };
    }

    // Get automatic payment amount based on student's grade and section
    const amount = await getPaymentAmount(student.grade, student.section);

    // Determine target month/year (default to current if not specified)
    const today = new Date();
    const paymentMonth = targetMonth || (today.getMonth() + 1);
    const paymentYear = targetYear || today.getFullYear();
    
    // Check if this is for a non-current month
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const isNonCurrentMonth = paymentMonth !== currentMonth || paymentYear !== currentYear;

    // Use a transaction to ensure both operations succeed or neither do
    const newReceipt = await prisma.$transaction(async (tx) => {
      // Check if payment already exists for this month/year
      const existingPayment = await tx.paymentRecord.findUnique({
        where: { 
          studentId_month_year: { 
            studentId: student.id, 
            month: paymentMonth, 
            year: paymentYear 
          }
        }
      });

      if (existingPayment && existingPayment.isPaid) {
        throw new Error(`تم دفع هذا الشهر بالفعل (${paymentMonth}/${paymentYear})`);
      }

      // Create or update the payment record
      const paymentRecord = await tx.paymentRecord.upsert({
        where: { 
          studentId_month_year: { 
            studentId: student.id, 
            month: paymentMonth, 
            year: paymentYear 
          }
        },
        update: { 
          isPaid: true, 
          paidAt: today 
        },
        create: {
          studentId: student.id,
          month: paymentMonth,
          year: paymentYear,
          isPaid: true,
          paidAt: today,
        },
      });

      // Create a receipt
      const receipt = await tx.receipt.create({
        data: {
          paymentRecordId: paymentRecord.id,
          studentName: student.name,
          studentReadableId: student.studentId,
          amount: amount,
          month: paymentMonth,
          year: paymentYear,
        }
      });

      return receipt;
    });

    revalidatePath('/payments');
    
    const monthYearText = isNonCurrentMonth ? ` لشهر ${paymentMonth}/${paymentYear}` : '';
    
    return { 
      success: true, 
      message: `تم تسجيل الدفع بنجاح${monthYearText}`, 
      receipt: newReceipt,
      studentName: student.name,
      amount: amount
    };

  } catch (error) {
    console.error('QR Payment Error:', error);
    
    if (error instanceof Error && error.message.includes('تم دفع هذا الشهر بالفعل')) {
      return { 
        success: false, 
        message: error.message 
      };
    }
    
    return { 
      success: false, 
      message: "خطأ في قاعدة البيانات. فشلت عملية الدفع." 
    };
  }
}

/**
 * Gets payment information for a student (for preview before payment)
 */
export async function getPaymentInfo(studentReadableId: string): Promise<{
  success: boolean;
  message: string;
  student?: {
    id: string;
    name: string;
    studentId: string;
    grade: string;
    section: string;
  };
  amount?: number;
}> {
  try {
    const student = await findStudentByCode(studentReadableId);
    if (!student) {
      return { 
        success: false, 
        message: "الطالب غير موجود" 
      };
    }

    const amount = await getPaymentAmount(student.grade, student.section);

    return {
      success: true,
      message: "تم العثور على الطالب",
      student: {
        id: student.id,
        name: student.name,
        studentId: student.studentId,
        grade: student.grade,
        section: student.section
      },
      amount
    };
  } catch (error) {
    console.error('Error getting payment info:', error);
    return { 
      success: false, 
      message: "خطأ في الحصول على بيانات الطالب" 
    };
  }
}