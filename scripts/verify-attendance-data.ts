#!/usr/bin/env tsx
/**
 * Verify Attendance Data Script
 * Checks the current state of attendance records in the database
 */

import { PrismaClient, AttendanceStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyAttendanceData() {
  console.log("🔍 Verifying attendance data in database...");

  try {
    // Get overall statistics
    const totalRecords = await prisma.attendanceRecord.count();
    console.log(`📊 Total attendance records: ${totalRecords}`);

    // Get status breakdown
    const statusBreakdown = await prisma.attendanceRecord.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    console.log("\n📊 Attendance Status Breakdown:");
    statusBreakdown.forEach(stat => {
      const percentage = ((stat._count.status / totalRecords) * 100).toFixed(1);
      console.log(`- ${stat.status}: ${stat._count.status} records (${percentage}%)`);
    });

    // Get makeup session breakdown
    const makeupBreakdown = await prisma.attendanceRecord.groupBy({
      by: ['isMakeup'],
      _count: {
        isMakeup: true
      }
    });

    console.log("\n📊 Makeup Session Breakdown:");
    makeupBreakdown.forEach(stat => {
      const type = stat.isMakeup ? 'Makeup Sessions' : 'Regular Sessions';
      const percentage = ((stat._count.isMakeup / totalRecords) * 100).toFixed(1);
      console.log(`- ${type}: ${stat._count.isMakeup} records (${percentage}%)`);
    });

    // Get recent records sample
    const recentRecords = await prisma.attendanceRecord.findMany({
      take: 10,
      orderBy: { markedAt: 'desc' },
      include: {
        student: {
          select: {
            name: true,
            studentId: true
          }
        }
      }
    });

    console.log("\n📋 Recent Attendance Records (Sample):");
    recentRecords.forEach((record, index) => {
      const statusIcon = record.status === AttendanceStatus.PRESENT ? '✅' : 
                        record.status === AttendanceStatus.ABSENT_AUTO ? '🤖❌' : '👤❌';
      const makeupIcon = record.isMakeup ? '🔄' : '';
      console.log(`${index + 1}. ${statusIcon} ${makeupIcon} ${record.student.name} (${record.student.studentId}) - ${record.date.toISOString().split('T')[0]} - ${record.status}`);
    });

    // Check for students with different attendance patterns
    const studentsWithAttendance = await prisma.student.findMany({
      include: {
        attendance: {
          orderBy: { date: 'desc' },
          take: 5
        }
      },
      take: 5
    });

    console.log("\n👥 Sample Students with Their Recent Attendance:");
    studentsWithAttendance.forEach((student, index) => {
      console.log(`\n${index + 1}. ${student.name} (${student.studentId}):`);
      if (student.attendance.length === 0) {
        console.log("   No attendance records");
      } else {
        student.attendance.forEach(record => {
          const statusIcon = record.status === AttendanceStatus.PRESENT ? '✅' : 
                            record.status === AttendanceStatus.ABSENT_AUTO ? '🤖❌' : '👤❌';
          const makeupIcon = record.isMakeup ? '🔄' : '';
          console.log(`   ${statusIcon} ${makeupIcon} ${record.date.toISOString().split('T')[0]} - ${record.status}`);
        });
      }
    });

    // Check current month statistics
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0);

    const currentMonthStats = await prisma.attendanceRecord.groupBy({
      by: ['status'],
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      _count: {
        status: true
      }
    });

    console.log(`\n📅 Current Month (${currentMonth}/${currentYear}) Statistics:`);
    const currentMonthTotal = currentMonthStats.reduce((sum, stat) => sum + stat._count.status, 0);
    currentMonthStats.forEach(stat => {
      const percentage = currentMonthTotal > 0 ? ((stat._count.status / currentMonthTotal) * 100).toFixed(1) : '0';
      console.log(`- ${stat.status}: ${stat._count.status} records (${percentage}%)`);
    });

    console.log("\n✅ Attendance data verification completed!");

  } catch (error) {
    console.error("❌ Verification failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  verifyAttendanceData().catch(console.error);
}

export { verifyAttendanceData };