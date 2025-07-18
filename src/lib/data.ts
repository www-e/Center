// src/lib/data.ts
import 'server-only'; // Ensures this code only runs on the server
import prisma from './prisma';
import { GroupDay, Grade } from '@prisma/client'; // Add GroupTime and Grade to the import

// A function to get all students from the database
export async function getStudents() {
  try {
    const students = await prisma.student.findMany({
      orderBy: {
        createdAt: 'desc',
      }
    });
    return students;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch students.');
  }
}

// A function to get the next student's readable ID
export async function getNextStudentId(grade: Grade) {
  // 1. Count how many students are already in that grade
  const count = await prisma.student.count({
    where: { grade: grade },
  });

  // 2. Format the number with leading zeros (e.g., 1 -> 0001, 12 -> 0012)
  const nextNumber = (count + 1).toString().padStart(4, '0');

  // 3. Create the ID string
  const gradeNumber = grade === Grade.FIRST ? 1 : grade === Grade.SECOND ? 2 : 3;
  return `std-g${gradeNumber}-${nextNumber}`;
}
// A type for our filters for cleaner code
export type StudentFilters = {
  grade?: Grade;
  groupDay?: GroupDay;
  groupTime?: string;
};

export async function getFilteredStudentsWithAttendance(
  year: number,
  month: number,
  filters: StudentFilters
) {
  // Define the date range for the selected month
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0)); // Day 0 of next month is last day of current

  try {
    const students = await prisma.student.findMany({
      where: {
        // Apply filters only if they are provided
        ...(filters.grade && { grade: filters.grade }),
        ...(filters.groupDay && { groupDay: filters.groupDay }),
        ...(filters.groupTime && { groupTime: filters.groupTime }),
      },
      // Include their attendance records, but ONLY for the selected month
      include: {
        attendance: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
      orderBy: {
        name: 'asc', // Order students alphabetically by name
      },
    });
    return students;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch filtered students with attendance.');
  }
}
// Add this function to the bottom of the file

export async function getStudentsWithPayments(
  year: number,
  filters: StudentFilters
) {
  try {
    const students = await prisma.student.findMany({
      where: {
        // Apply filters only if they are provided
        ...(filters.grade && { grade: filters.grade }),
        ...(filters.groupDay && { groupDay: filters.groupDay }),
        ...(filters.groupTime && { groupTime: filters.groupTime }),
      },
      // Include their payment records, but ONLY for the selected year
      include: {
        payments: {
          where: {
            year: year,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return students;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch students with payments.');
  }
}