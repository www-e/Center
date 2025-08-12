// src/lib/payment-history.ts
import 'server-only';
import { Student, PaymentRecord , Receipt } from '@prisma/client';

export type PaymentStatus = 'paid' | 'overdue' | 'not_enrolled' | 'future';

export interface PaymentHistoryEntry {
  month: number;
  year: number;
  status: PaymentStatus;
  paidAt?: Date;
  amount?: number;
  isCurrentMonth: boolean;
}

/**
 * Determines if a student was enrolled for a specific month/year
 */
export function wasStudentEnrolled(enrollmentDate: Date, targetMonth: number, targetYear: number): boolean {
  const enrollmentMonth = enrollmentDate.getMonth() + 1; // JS months are 0-based
  const enrollmentYear = enrollmentDate.getFullYear();
  
  // Student is enrolled if the target date is on or after enrollment date
  if (targetYear > enrollmentYear) return true;
  if (targetYear === enrollmentYear && targetMonth >= enrollmentMonth) return true;
  
  return false;
}

/**
 * Gets payment status for a student for a specific month/year
 */
export function getPaymentStatusForMonth(
  student: Student,
  targetMonth: number,
  targetYear: number,
  paymentRecord?: PaymentRecord
): PaymentStatus {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  // Check if this is a future month
  if (targetYear > currentYear || (targetYear === currentYear && targetMonth > currentMonth)) {
    return 'future';
  }
  
  // Check if student was enrolled for this month
  if (!wasStudentEnrolled(student.enrollmentDate, targetMonth, targetYear)) {
    return 'not_enrolled';
  }
  
  // Check payment status
  if (paymentRecord?.isPaid) {
    return 'paid';
  }
  
  // If we reach here, student was enrolled but hasn't paid
  return 'overdue';
}

/**
 * Generates payment history for a student for a range of months
 */
export function generatePaymentHistory(
  student: Student,
  payments: (PaymentRecord & { receipt?: Receipt | null })[],
  startMonth: number,
  startYear: number,
  endMonth: number,
  endYear: number
): PaymentHistoryEntry[] {
  const history: PaymentHistoryEntry[] = [];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  let month = startMonth;
  let year = startYear;
  
  while (year < endYear || (year === endYear && month <= endMonth)) {
    const paymentRecord = payments.find(p => p.month === month && p.year === year);
    const status = getPaymentStatusForMonth(student, month, year, paymentRecord);
    const isCurrentMonth = month === currentMonth && year === currentYear;
    
    history.push({
      month,
      year,
      status,
      paidAt: paymentRecord?.paidAt || undefined,
      amount: paymentRecord?.receipt?.amount, // Default amount, should be from receipt
      isCurrentMonth
    });
    
    // Move to next month
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }
  
  return history;
}

/**
 * Gets payment statistics for a student
 */
export function getStudentPaymentStats(
  student: Student,
  payments: (PaymentRecord & { receipt?: Receipt | null })[],
  targetYear?: number
): {
  totalMonthsEnrolled: number;
  totalPaid: number;
  totalOverdue: number;
  paymentRate: number;
  enrollmentMonth: string;
} {
  const currentDate = new Date();
  const year = targetYear || currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  const enrollmentDate = new Date(student.enrollmentDate);
  const enrollmentMonth = enrollmentDate.toLocaleDateString('ar-EG', { 
    month: 'long', 
    year: 'numeric' 
  });
  
  let totalMonthsEnrolled = 0;
  let totalPaid = 0;
  let totalOverdue = 0;
  
  // Count months from enrollment to current month (or end of year)
  for (let month = 1; month <= 12; month++) {
    // Don't count future months
    if (year === currentDate.getFullYear() && month > currentMonth) {
      break;
    }
    
    if (wasStudentEnrolled(enrollmentDate, month, year)) {
      totalMonthsEnrolled++;
      
      const paymentRecord = payments.find(p => p.month === month && p.year === year);
      if (paymentRecord?.isPaid) {
        totalPaid++;
      } else {
        totalOverdue++;
      }
    }
  }
  
  const paymentRate = totalMonthsEnrolled > 0 ? (totalPaid / totalMonthsEnrolled) * 100 : 0;
  
  return {
    totalMonthsEnrolled,
    totalPaid,
    totalOverdue,
    paymentRate,
    enrollmentMonth
  };
}

/**
 * Filters students who should have payment records for a specific month
 */
export function getEligibleStudentsForMonth(
  students: Student[],
  targetMonth: number,
  targetYear: number
): Student[] {
  return students.filter(student => 
    wasStudentEnrolled(student.enrollmentDate, targetMonth, targetYear)
  );
}

/**
 * Gets months a student should have paid for (excluding future and pre-enrollment)
 */
export function getPayableMonthsForStudent(
  student: Student,
  targetYear?: number
): { month: number; year: number; monthName: string }[] {
  const currentDate = new Date();
  const year = targetYear || currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  
  const payableMonths: { month: number; year: number; monthName: string }[] = [];
  
  for (let month = 1; month <= 12; month++) {
    // Don't include future months
    if (year === currentDate.getFullYear() && month > currentMonth) {
      break;
    }
    
    if (wasStudentEnrolled(student.enrollmentDate, month, year)) {
      payableMonths.push({
        month,
        year,
        monthName: monthNames[month - 1]
      });
    }
  }
  
  return payableMonths;
}