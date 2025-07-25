// src/app/api/payment/amount/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPaymentAmount } from '@/lib/payment-config';
import { findStudentByCode } from '@/lib/student-code-utils';

export async function POST(request: NextRequest) {
  try {
    const { studentCode } = await request.json();
    
    if (!studentCode) {
      return NextResponse.json(
        { error: 'كود الطالب مطلوب' },
        { status: 400 }
      );
    }
    
    // Find student by code (supports both old and new formats)
    const student = await findStudentByCode(studentCode);
    
    if (!student) {
      return NextResponse.json(
        { error: 'الطالب غير موجود' },
        { status: 404 }
      );
    }
    
    // Get payment amount based on student's grade and section
    const amount = await getPaymentAmount(student.grade, student.section);
    
    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        studentId: student.studentId,
        grade: student.grade,
        section: student.section
      },
      amount
    });
  } catch (error) {
    console.error('Error fetching payment amount:', error);
    return NextResponse.json(
      { error: 'فشل في الحصول على مبلغ الدفع' },
      { status: 500 }
    );
  }
}