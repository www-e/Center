// src/lib/student-code-utils.ts
import { Grade } from '@prisma/client';
import prisma from './prisma';

/**
 * Generates a new student code in the format std{grade}{sequential_number}
 * Examples: std10001, std20001, std30001
 */
export async function generateNewStudentCode(grade: Grade): Promise<string> {
  // Map grade enum to number
  const gradeNumber = getGradeNumber(grade);
  
  // Count existing students with the new format for this grade
  const existingCount = await prisma.student.count({
    where: {
      grade: grade,
      studentId: {
        startsWith: `std${gradeNumber}`
      }
    }
  });
  
  // Generate next sequential number with 4-digit padding
  const nextNumber = (existingCount + 1).toString().padStart(4, '0');
  
  return `std${gradeNumber}${nextNumber}`;
}

/**
 * Converts legacy student code format to new format
 * Old format: std-g1-0001, std-g2-0001, std-g3-0001
 * New format: std10001, std20001, std30001
 */
export function convertLegacyCode(oldCode: string): string {
  // Match the old format pattern
  const legacyPattern = /^std-g([123])-(\d{4})$/;
  const match = oldCode.match(legacyPattern);
  
  if (!match) {
    // If it doesn't match legacy pattern, assume it's already new format or invalid
    return oldCode;
  }
  
  const gradeNumber = match[1];
  const sequentialNumber = match[2];
  
  return `std${gradeNumber}${sequentialNumber}`;
}

/**
 * Validates if a student code follows the correct format
 * Supports both old and new formats during transition
 */
export function validateStudentCode(code: string): boolean {
  // New format: std{grade}{4digits}
  const newPattern = /^std[123]\d{4}$/;
  
  // Legacy format: std-g{grade}-{4digits}
  const legacyPattern = /^std-g[123]-\d{4}$/;
  
  return newPattern.test(code) || legacyPattern.test(code);
}

/**
 * Checks if a student code is in the new format
 */
export function isNewFormat(code: string): boolean {
  const newPattern = /^std[123]\d{4}$/;
  return newPattern.test(code);
}

/**
 * Checks if a student code is in the legacy format
 */
export function isLegacyFormat(code: string): boolean {
  const legacyPattern = /^std-g[123]-\d{4}$/;
  return legacyPattern.test(code);
}

/**
 * Extracts grade from student code (works with both formats)
 */
export function extractGradeFromCode(code: string): Grade | null {
  // Try new format first
  const newMatch = code.match(/^std([123])\d{4}$/);
  if (newMatch) {
    return getGradeFromNumber(parseInt(newMatch[1]));
  }
  
  // Try legacy format
  const legacyMatch = code.match(/^std-g([123])-\d{4}$/);
  if (legacyMatch) {
    return getGradeFromNumber(parseInt(legacyMatch[1]));
  }
  
  return null;
}

/**
 * Helper function to convert Grade enum to number
 */
export function getGradeNumber(grade: Grade): number {
  switch (grade) {
    case Grade.FIRST:
      return 1;
    case Grade.SECOND:
      return 2;
    case Grade.THIRD:
      return 3;
    default:
      throw new Error(`Invalid grade: ${grade}`);
  }
}

/**
 * Helper function to convert number to Grade enum
 */
export function getGradeFromNumber(gradeNumber: number): Grade {
  switch (gradeNumber) {
    case 1:
      return Grade.FIRST;
    case 2:
      return Grade.SECOND;
    case 3:
      return Grade.THIRD;
    default:
      throw new Error(`Invalid grade number: ${gradeNumber}`);
  }
}

/**
 * Gets the next available student code for backward compatibility
 * This function maintains the existing API while using new format internally
 */
export async function getNextStudentId(grade: Grade): Promise<string> {
  return generateNewStudentCode(grade);
}

/**
 * Finds a student by their code (supports both old and new formats)
 * This provides backward compatibility during the transition period
 */
export async function findStudentByCode(studentCode: string) {
  // First try to find by exact match (handles both formats)
  let student = await prisma.student.findUnique({
    where: { studentId: studentCode }
  });
  
  if (student) {
    return student;
  }
  
  // If not found and it's a legacy format, try converting and searching
  if (isLegacyFormat(studentCode)) {
    const convertedCode = convertLegacyCode(studentCode);
    student = await prisma.student.findUnique({
      where: { studentId: convertedCode }
    });
  }
  
  // If not found and it's a new format, try converting to legacy and searching
  if (!student && isNewFormat(studentCode)) {
    // Convert new format back to legacy for backward compatibility
    const legacyCode = convertNewToLegacy(studentCode);
    student = await prisma.student.findUnique({
      where: { studentId: legacyCode }
    });
  }
  
  return student;
}

/**
 * Converts new format back to legacy format for backward compatibility
 * New format: std10001 -> Legacy format: std-g1-0001
 */
function convertNewToLegacy(newCode: string): string {
  const match = newCode.match(/^std([123])(\d{4})$/);
  if (!match) {
    return newCode; // Return as-is if doesn't match expected format
  }
  
  const gradeNumber = match[1];
  const sequentialNumber = match[2];
  
  return `std-g${gradeNumber}-${sequentialNumber}`;
}