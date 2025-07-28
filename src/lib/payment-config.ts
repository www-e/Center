// src/lib/payment-config.ts
import 'server-only';
import prisma from './prisma';
import { Grade, Section } from '@prisma/client';

export interface PaymentConfigData {
  id?: string;
  grade: Grade;
  section: Section;
  amount: number;
  isActive?: boolean;
}

/**
 * Gets the payment amount for a specific grade and section
 */
export async function getPaymentAmount(grade: Grade, section: Section): Promise<number> {
  try {
    const config = await prisma.paymentConfig.findUnique({
      where: {
        grade_section: {
          grade,
          section
        },
        isActive: true
      }
    });
    
    if (!config) {
      // Return default amounts if no configuration exists
      return getDefaultPaymentAmount(grade, section);
    }
    
    return config.amount;
  } catch (error) {
    console.error('Error fetching payment amount:', error);
    // Return default amount on error
    return getDefaultPaymentAmount(grade, section);
  }
}

/**
 * Gets all active payment configurations
 */
export async function getAllPaymentConfigs(): Promise<PaymentConfigData[]> {
  try {
    const configs = await prisma.paymentConfig.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { grade: 'asc' },
        { section: 'asc' }
      ]
    });
    
    return configs;
  } catch (error) {
    console.error('Error fetching payment configs:', error);
    return [];
  }
}

/**
 * Updates payment configurations (admin function)
 */
export async function updatePaymentConfigs(configs: PaymentConfigData[]): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      // First, deactivate all existing configs
      await tx.paymentConfig.updateMany({
        data: { isActive: false }
      });
      
      // Then create or update the new configs
      for (const config of configs) {
        await tx.paymentConfig.upsert({
          where: {
            grade_section: {
              grade: config.grade,
              section: config.section
            }
          },
          update: {
            amount: config.amount,
            isActive: true
          },
          create: {
            grade: config.grade,
            section: config.section,
            amount: config.amount,
            isActive: true
          }
        });
      }
    });
  } catch (error) {
    console.error('Error updating payment configs:', error);
    throw new Error('فشل في تحديث إعدادات الدفع');
  }
}

/**
 * Validates admin password
 */
export function validateAdminPassword(password: string): boolean {
  return password === 'admin000';
}

/**
 * Gets default payment amounts when no configuration exists
 */
function getDefaultPaymentAmount(grade: Grade, section: Section): number {
  // Default payment amounts (can be customized)
  const defaultAmounts = {
    [Grade.FIRST]: {
      [Section.NONE]: 200
    },
    [Grade.SECOND]: {
      [Section.SCIENTIFIC]: 250,
      [Section.LITERARY]: 230
    },
    [Grade.THIRD]: {
      [Section.SCIENTIFIC]: 300,
      [Section.LITERARY]: 280
    }
  };
  
  return (defaultAmounts[grade] as any)?.[section] || 200;
}

/**
 * Gets payment amount for a student based on their grade and section
 */
export async function getStudentPaymentAmount(studentId: string): Promise<number> {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { grade: true, section: true }
    });
    
    if (!student) {
      throw new Error('Student not found');
    }
    
    return getPaymentAmount(student.grade, student.section);
  } catch (error) {
    console.error('Error fetching student payment amount:', error);
    throw new Error('فشل في الحصول على مبلغ الدفع للطالب');
  }
}

/**
 * Gets all possible grade/section combinations for configuration
 */
export function getAllGradeSectionCombinations(): PaymentConfigData[] {
  return [
    { grade: Grade.FIRST, section: Section.NONE, amount: 200 },
    { grade: Grade.SECOND, section: Section.SCIENTIFIC, amount: 250 },
    { grade: Grade.SECOND, section: Section.LITERARY, amount: 230 },
    { grade: Grade.THIRD, section: Section.SCIENTIFIC, amount: 300 },
    { grade: Grade.THIRD, section: Section.LITERARY, amount: 280 }
  ];
}