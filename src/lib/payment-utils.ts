// src/lib/payment-utils.ts
import { Student, PaymentRecord } from '@prisma/client';

export type PaymentStatus = 'paid' | 'overdue' | 'not_enrolled' | 'future';

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