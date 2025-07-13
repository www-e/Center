// lib/actions.ts
'use server'; // Mark this file as containing Server Actions

import { z } from 'zod';
import prisma from './prisma';
import { getNextStudentId } from './data';
import { Grade, Section, GroupDay, PaymentPref } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Receipt } from '@prisma/client'; // Add Receipt to the import

// Define the shape of our form data using Zod for validation
const StudentSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  phone: z.string().min(10, 'Please enter a valid phone number.'),
  parentPhone: z.string().min(10, 'Please enter a valid parent phone number.'),
  grade: z.nativeEnum(Grade),
  section: z.nativeEnum(Section),
  groupDay: z.nativeEnum(GroupDay),
  groupTime: z.string().min(1, 'Please select a group time.'),
  paymentPref: z.nativeEnum(PaymentPref),
});

export type State = {
  errors?: {
    [key: string]: string[] | undefined;
  };
  message?: string | null;
};

// The main server action
export async function createStudent(prevState: State, formData: FormData) {
  // 1. Validate the form data
  const validatedFields = StudentSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please check the fields.',
    };
  }

  const { data } = validatedFields;

  try {
    // 2. Generate the unique student ID
    const studentId = await getNextStudentId(data.grade);

    // 3. Save the new student to the database
    await prisma.student.create({
      data: {
        studentId: studentId,
        name: data.name,
        phone: data.phone,
        parentPhone: data.parentPhone,
        grade: data.grade,
        section: data.section,
        groupDay: data.groupDay,
        groupTime: data.groupTime,
        paymentPref: data.paymentPref,
      },
    });
  } catch (error) {
    return {
      message: 'Database Error: Failed to create student.',
    };
  }

  // 4. Refresh the data on the students page
  revalidatePath('/students');
  // 5. Redirect the user back to the students list
  redirect('/students');
}
// Add this function to the bottom of the file

// A new return type for our attendance action
export type AttendanceState = {
  success?: boolean;
  message: string;
  studentName?: string;
};

export async function markAttendance(
  studentReadableId: string,
  isMakeup: boolean
): Promise<AttendanceState> {
  if (!studentReadableId) {
    return { success: false, message: 'لم يتم استلام كود الطالب.' };
  }

  try {
    // 1. Find the student by their human-readable ID
    const student = await prisma.student.findUnique({
      where: { studentId: studentReadableId },
    });

    if (!student) {
      return { success: false, message: 'الطالب غير موجود.' };
    }

    // 2. Use today's date (at the start of the day to be consistent)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // 3. Check if the student is already marked present today
    const existingRecord = await prisma.attendanceRecord.findUnique({
      where: {
        studentId_date: {
          studentId: student.id,
          date: today,
        },
      },
    });

    if (existingRecord) {
      return {
        success: false,
        studentName: student.name,
        message: 'تم تحضيره بالفعل اليوم.',
      };
    }

    // 4. Create the new attendance record
    await prisma.attendanceRecord.create({
      data: {
        studentId: student.id,
        date: today,
        isMakeup: isMakeup,
      },
    });
    
    // 5. Invalidate the cache for the attendance page so the UI updates
    revalidatePath('/attendance');

    return {
      success: true,
      studentName: student.name,
      message: 'تم التحضير بنجاح.',
    };
  } catch (error) {
    console.error('Attendance Error:', error);
    return { success: false, message: 'خطأ في قاعدة البيانات. فشلت عملية التحضير.' };
  }
}
// Add this code to the bottom of the file

// A Zod schema for validating the payment form data
const PaymentSchema = z.object({
  studentReadableId: z.string().min(1, "Student ID is required."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
});

// A new return type for our payment action
export type PaymentState = {
  success: boolean;
  message: string;
  receipt?: Receipt;
};

export async function recordPayment(
  prevState: PaymentState,
  formData: FormData
): Promise<PaymentState> {
  const validatedFields = PaymentSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed. Please check the fields.",
    };
  }
  const { studentReadableId, amount } = validatedFields.data;
  
  const student = await prisma.student.findUnique({ where: { studentId: studentReadableId }});
  if (!student) {
    return { success: false, message: "الطالب غير موجود." };
  }

  const today = new Date();
  const currentMonth = today.getMonth() + 1; // JS months are 0-11
  const currentYear = today.getFullYear();

  try {
    // Use a transaction to ensure both operations succeed or neither do.
    // This guarantees data integrity.
    const newReceipt = await prisma.$transaction(async (tx) => {
      // 1. Find or create the payment record for the current month/year
      const paymentRecord = await tx.paymentRecord.upsert({
        where: { studentId_month_year: { studentId: student.id, month: currentMonth, year: currentYear }},
        update: { isPaid: true, paidAt: today },
        create: {
          studentId: student.id,
          month: currentMonth,
          year: currentYear,
          isPaid: true,
          paidAt: today,
        },
      });

      // 2. Create a receipt linked to that payment record
      const receipt = await tx.receipt.create({
        data: {
          paymentRecordId: paymentRecord.id,
          studentName: student.name,
          studentReadableId: student.studentId,
          amount: amount,
          month: currentMonth,
          year: currentYear,
        }
      });

      return receipt;
    });

    revalidatePath('/payments');
    return { success: true, message: "تم تسجيل الدفع بنجاح.", receipt: newReceipt };

  } catch (error) {
    console.error('Payment Error:', error);
    return { success: false, message: "خطأ في قاعدة البيانات. فشلت عملية الدفع." };
  }
}