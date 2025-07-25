// lib/actions.ts
'use server'; // Mark this file as containing Server Actions

import { z } from 'zod';
import prisma from './prisma';
import { getNextStudentId } from './data';
import { findStudentByCode } from './student-code-utils';
import { EgyptianPhoneSchema } from './phone-validation';
import { Grade, Section, GroupDay, PaymentPref } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Receipt } from '@prisma/client'; // Add Receipt to the import

// Enhanced student validation schema with comprehensive error messages
const StudentSchema = z.object({
  name: z.string()
    .min(1, 'اسم الطالب مطلوب')
    .min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل')
    .max(100, 'الاسم طويل جداً (الحد الأقصى 100 حرف)')
    .regex(/^[\u0600-\u06FF\s]+$/, 'الاسم يجب أن يحتوي على أحرف عربية فقط'),
  phone: EgyptianPhoneSchema,
  parentPhone: EgyptianPhoneSchema,
  grade: z.nativeEnum(Grade, {
    errorMap: () => ({ message: 'يرجى اختيار الصف الدراسي' })
  }),
  section: z.nativeEnum(Section, {
    errorMap: () => ({ message: 'يرجى اختيار الشعبة' })
  }),
  groupDay: z.nativeEnum(GroupDay, {
    errorMap: () => ({ message: 'يرجى اختيار أيام المجموعة' })
  }),
  groupTime: z.string()
    .min(1, 'يرجى اختيار ميعاد المجموعة')
    .regex(/^\d{2}:\d{2}\s(AM|PM)$/, 'صيغة الميعاد غير صحيحة'),
  paymentPref: z.nativeEnum(PaymentPref, {
    errorMap: () => ({ message: 'يرجى اختيار طريقة الدفع' })
  }),
});

export type State = {
  errors?: {
    [key: string]: string[] | undefined;
  };
  message?: string | null;
};

// The main server action with enhanced error handling
export async function createStudent(prevState: State, formData: FormData) {
  try {
    // 1. Validate the form data
    const validatedFields = StudentSchema.safeParse(
      Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
      const fieldErrors = validatedFields.error.flatten().fieldErrors;
      const errorCount = Object.keys(fieldErrors).length;
      
      return {
        errors: fieldErrors,
        message: `تم العثور على ${errorCount} خطأ في البيانات. يرجى تصحيح الأخطاء والمحاولة مرة أخرى.`,
      };
    }

    const { data } = validatedFields;

    // 2. Additional business logic validation
    // Check for duplicate phone numbers
    const existingStudentWithPhone = await prisma.student.findFirst({
      where: {
        OR: [
          { phone: data.phone },
          { parentPhone: data.phone },
          { phone: data.parentPhone },
          { parentPhone: data.parentPhone }
        ]
      }
    });

    if (existingStudentWithPhone) {
      return {
        errors: {
          phone: ['رقم الهاتف مستخدم بالفعل'],
          parentPhone: ['رقم هاتف ولي الأمر مستخدم بالفعل']
        },
        message: 'رقم الهاتف مستخدم بالفعل من قبل طالب آخر.',
      };
    }

    // 3. Generate the unique student ID
    const studentId = await getNextStudentId(data.grade);

    // 4. Save the new student to the database
    const newStudent = await prisma.student.create({
      data: {
        studentId: studentId,
        name: data.name.trim(),
        phone: data.phone,
        parentPhone: data.parentPhone,
        grade: data.grade,
        section: data.section,
        groupDay: data.groupDay,
        groupTime: data.groupTime,
        paymentPref: data.paymentPref,
      },
    });

    // 5. Refresh the data on the students page
    revalidatePath('/students');
    
    // 6. Redirect the user back to the students list with success message
    redirect(`/students?success=تم إضافة الطالب ${newStudent.name} بنجاح`);
    
  } catch (error) {
    console.error('Database Error:', error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return {
          message: 'البيانات المدخلة مكررة. يرجى التحقق من البيانات.',
        };
      }
      
      if (error.message.includes('Foreign key constraint')) {
        return {
          message: 'خطأ في ربط البيانات. يرجى المحاولة مرة أخرى.',
        };
      }
    }
    
    return {
      message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني.',
    };
  }
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
    // 1. Find the student by their human-readable ID (supports both old and new formats)
    const student = await findStudentByCode(studentReadableId);

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
  
  // Find student using backward compatibility function
  const student = await findStudentByCode(studentReadableId);
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