#!/usr/bin/env tsx
/**
 * Comprehensive Attendance Testing Script
 * Tests all attendance scenarios and edge cases based on actual schema and logic
 */

import { PrismaClient, GroupDay, Grade, Section } from "@prisma/client";

const prisma = new PrismaClient();

// Helper to get session dates for a month (matches utils.ts logic)
function getSessionDatesForMonth(
  year: number,
  month: number,
  groupDay: GroupDay
): Date[] {
  const dates: Date[] = [];
  const date = new Date(Date.UTC(year, month - 1, 1));

  const dayMap: Record<GroupDay, number[]> = {
    [GroupDay.SAT_TUE]: [6, 2], // Saturday, Tuesday
    [GroupDay.SUN_WED]: [0, 3], // Sunday, Wednesday
    [GroupDay.MON_THU]: [1, 4], // Monday, Thursday
    [GroupDay.SAT_TUE_THU]: [6, 2, 4], // Saturday, Tuesday, Thursday
  };

  const targetDays = dayMap[groupDay];
  if (!targetDays) return [];

  while (date.getUTCMonth() === month - 1) {
    if (targetDays.includes(date.getUTCDay())) {
      dates.push(new Date(date));
    }
    date.setUTCDate(date.getUTCDate() + 1);
  }

  return dates;
}

// Helper to create attendance record with proper error handling
async function createAttendanceRecord(
  studentId: string,
  date: Date,
  isMakeup: boolean = false
) {
  try {
    return await prisma.attendanceRecord.create({
      data: {
        studentId,
        date,
        isMakeup,
      },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      // Unique constraint violation - student already marked for this date
      console.log(
        `⚠️  Student ${studentId} already marked for ${
          date.toISOString().split("T")[0]
        }`
      );
      return null;
    }
    throw error;
  }
}

async function testComprehensiveAttendanceScenarios() {
  console.log("🧪 Starting comprehensive attendance scenario testing...");

  try {
    // Get all students with their details
    const students = await prisma.student.findMany({
      orderBy: { name: "asc" },
    });

    console.log(`👥 Found ${students.length} students for testing`);

    if (students.length === 0) {
      console.log("⚠️  No students found. Run generate-students.ts first.");
      return;
    }

    // Test for current month and previous month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    console.log(
      `📅 Testing scenarios for ${currentMonth}/${currentYear} and ${previousMonth}/${previousYear}`
    );

    // Clear existing attendance for testing months
    const testMonths = [
      { year: currentYear, month: currentMonth },
      { year: previousYear, month: previousMonth },
    ];

    for (const testMonth of testMonths) {
      const startOfMonth = new Date(testMonth.year, testMonth.month - 1, 1);
      const endOfMonth = new Date(testMonth.year, testMonth.month, 0);

      await prisma.attendanceRecord.deleteMany({
        where: {
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });
    }

    let totalRecords = 0;
    let regularRecords = 0;
    let makeupRecords = 0;

    // Group students by grade and group day for realistic testing
    const studentsByGrade = students.reduce((acc, student) => {
      const key = `${student.grade}_${student.section}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(student);
      return acc;
    }, {} as Record<string, typeof students>);

    console.log("\n📊 Student Distribution:");
    Object.entries(studentsByGrade).forEach(([key, students]) => {
      console.log(`- ${key}: ${students.length} students`);
    });

    // Scenario 1: Perfect Attendance (20% of students)
    console.log("\n📊 Scenario 1: Perfect Attendance Students");
    const perfectStudents = students.slice(
      0,
      Math.floor(students.length * 0.2)
    );

    for (const student of perfectStudents) {
      for (const testMonth of testMonths) {
        const sessionDates = getSessionDatesForMonth(
          testMonth.year,
          testMonth.month,
          student.groupDay
        );

        for (const sessionDate of sessionDates) {
          // Only create attendance for dates after enrollment
          if (sessionDate >= student.enrollmentDate) {
            const record = await createAttendanceRecord(
              student.id,
              sessionDate,
              false
            );
            if (record) {
              totalRecords++;
              regularRecords++;
            }
          }
        }
      }
    }
    console.log(
      `✅ Created perfect attendance for ${perfectStudents.length} students`
    );

    // Scenario 2: Good Attendance (40% of students, 80-90% attendance rate)
    console.log("\n📊 Scenario 2: Good Attendance Students");
    const goodStudents = students.slice(
      Math.floor(students.length * 0.2),
      Math.floor(students.length * 0.6)
    );

    for (const student of goodStudents) {
      for (const testMonth of testMonths) {
        const sessionDates = getSessionDatesForMonth(
          testMonth.year,
          testMonth.month,
          student.groupDay
        );

        // Attend 80-90% of sessions
        const attendanceRate = 0.8 + Math.random() * 0.1;
        const attendanceDates = sessionDates
          .filter((date) => date >= student.enrollmentDate)
          .filter(() => Math.random() < attendanceRate);

        for (const sessionDate of attendanceDates) {
          const record = await createAttendanceRecord(
            student.id,
            sessionDate,
            false
          );
          if (record) {
            totalRecords++;
            regularRecords++;
          }
        }
      }
    }
    console.log(
      `✅ Created good attendance for ${goodStudents.length} students`
    );

    // Scenario 3: Average Attendance (25% of students, 60-80% attendance rate)
    console.log("\n📊 Scenario 3: Average Attendance Students");
    const averageStudents = students.slice(
      Math.floor(students.length * 0.6),
      Math.floor(students.length * 0.85)
    );

    for (const student of averageStudents) {
      for (const testMonth of testMonths) {
        const sessionDates = getSessionDatesForMonth(
          testMonth.year,
          testMonth.month,
          student.groupDay
        );

        // Attend 60-80% of sessions
        const attendanceRate = 0.6 + Math.random() * 0.2;
        const attendanceDates = sessionDates
          .filter((date) => date >= student.enrollmentDate)
          .filter(() => Math.random() < attendanceRate);

        for (const sessionDate of attendanceDates) {
          const record = await createAttendanceRecord(
            student.id,
            sessionDate,
            false
          );
          if (record) {
            totalRecords++;
            regularRecords++;
          }
        }
      }
    }
    console.log(
      `✅ Created average attendance for ${averageStudents.length} students`
    );

    // Scenario 4: Poor Attendance (10% of students, 30-60% attendance rate)
    console.log("\n📊 Scenario 4: Poor Attendance Students");
    const poorStudents = students.slice(
      Math.floor(students.length * 0.85),
      Math.floor(students.length * 0.95)
    );

    for (const student of poorStudents) {
      for (const testMonth of testMonths) {
        const sessionDates = getSessionDatesForMonth(
          testMonth.year,
          testMonth.month,
          student.groupDay
        );

        // Attend 30-60% of sessions
        const attendanceRate = 0.3 + Math.random() * 0.3;
        const attendanceDates = sessionDates
          .filter((date) => date >= student.enrollmentDate)
          .filter(() => Math.random() < attendanceRate);

        for (const sessionDate of attendanceDates) {
          const record = await createAttendanceRecord(
            student.id,
            sessionDate,
            false
          );
          if (record) {
            totalRecords++;
            regularRecords++;
          }
        }
      }
    }
    console.log(
      `✅ Created poor attendance for ${poorStudents.length} students`
    );

    // Scenario 5: Absent Students (5% of students, no attendance)
    console.log("\n📊 Scenario 5: Absent Students");
    const absentStudents = students.slice(Math.floor(students.length * 0.95));
    console.log(
      `✅ ${absentStudents.length} students with no attendance records (testing absence handling)`
    );

    // Scenario 6: Makeup Sessions (for students with poor/average attendance)
    console.log("\n📊 Scenario 6: Makeup Sessions");
    const makeupCandidates = [...averageStudents, ...poorStudents];

    for (const student of makeupCandidates.slice(
      0,
      Math.floor(makeupCandidates.length * 0.4)
    )) {
      for (const testMonth of testMonths) {
        // Create 1-3 makeup sessions per month
        const makeupCount = Math.floor(Math.random() * 3) + 1;

        for (let i = 0; i < makeupCount; i++) {
          // Random date in the month, but after enrollment
          const randomDay = Math.floor(Math.random() * 28) + 1;
          const makeupDate = new Date(
            testMonth.year,
            testMonth.month - 1,
            randomDay
          );

          if (makeupDate >= student.enrollmentDate) {
            const record = await createAttendanceRecord(
              student.id,
              makeupDate,
              true
            );
            if (record) {
              totalRecords++;
              makeupRecords++;
            }
          }
        }
      }
    }
    console.log(
      `✅ Created makeup sessions for ${Math.floor(
        makeupCandidates.length * 0.4
      )} students`
    );

    // Scenario 7: Late Enrollment Testing
    console.log("\n📊 Scenario 7: Late Enrollment Students");
    const lateEnrollmentStudents = students.slice(0, 5);

    for (const student of lateEnrollmentStudents) {
      // Update enrollment date to mid-month for current month
      const midMonth = new Date(currentYear, currentMonth - 1, 15);
      await prisma.student.update({
        where: { id: student.id },
        data: { enrollmentDate: midMonth },
      });

      // Create attendance only after enrollment date
      const sessionDates = getSessionDatesForMonth(
        currentYear,
        currentMonth,
        student.groupDay
      );
      const validDates = sessionDates.filter((date) => date >= midMonth);

      for (const sessionDate of validDates) {
        if (Math.random() < 0.9) {
          // 90% attendance after enrollment
          const record = await createAttendanceRecord(
            student.id,
            sessionDate,
            false
          );
          if (record) {
            totalRecords++;
            regularRecords++;
          }
        }
      }
    }
    console.log(
      `✅ Updated enrollment dates and created attendance for ${lateEnrollmentStudents.length} late enrollment students`
    );

    // Generate comprehensive statistics
    console.log("\n📈 Comprehensive Test Results:");
    console.log(`- Total attendance records created: ${totalRecords}`);
    console.log(`- Regular attendance: ${regularRecords}`);
    console.log(`- Makeup attendance: ${makeupRecords}`);

    // Test database constraints and edge cases
    console.log("\n🔍 Testing Database Constraints:");

    // Test 1: Duplicate attendance prevention
    const testStudent = students[0];
    const testDate = new Date(currentYear, currentMonth - 1, 1);

    try {
      await prisma.attendanceRecord.create({
        data: {
          studentId: testStudent.id,
          date: testDate,
          isMakeup: false,
        },
      });

      // Try to create duplicate
      await prisma.attendanceRecord.create({
        data: {
          studentId: testStudent.id,
          date: testDate,
          isMakeup: true, // Different makeup status
        },
      });
      console.log(
        "❌ Duplicate attendance was allowed (this should be prevented)"
      );
    } catch (error: any) {
      if (error.code === "P2002") {
        console.log(
          "✅ Duplicate attendance properly prevented by unique constraint"
        );
      } else {
        console.log("❌ Unexpected error:", error.message);
      }
    }

    // Test 2: Foreign key constraint
    try {
      await prisma.attendanceRecord.create({
        data: {
          studentId: "non-existent-id",
          date: testDate,
          isMakeup: false,
        },
      });
      console.log("❌ Invalid student ID was allowed");
    } catch (error: any) {
      if (error.code === "P2003") {
        console.log("✅ Foreign key constraint working properly");
      } else {
        console.log("❌ Unexpected error:", error.message);
      }
    }

    // Detailed statistics by group day and grade
    console.log("\n📊 Detailed Statistics:");

    const attendanceByGroupDay = await prisma.attendanceRecord.findMany({
      include: {
        student: {
          select: { groupDay: true, grade: true, section: true, name: true },
        },
      },
    });

    const groupDayStats = attendanceByGroupDay.reduce((acc, record) => {
      const key = record.student.groupDay;
      if (!acc[key]) acc[key] = { total: 0, regular: 0, makeup: 0 };
      acc[key].total++;
      if (record.isMakeup) {
        acc[key].makeup++;
      } else {
        acc[key].regular++;
      }
      return acc;
    }, {} as Record<string, { total: number; regular: number; makeup: number }>);

    console.log("Attendance by Group Day:");
    Object.entries(groupDayStats).forEach(([groupDay, stats]) => {
      console.log(
        `- ${groupDay}: ${stats.total} total (${stats.regular} regular, ${stats.makeup} makeup)`
      );
    });

    const gradeStats = attendanceByGroupDay.reduce((acc, record) => {
      const key = `${record.student.grade}_${record.student.section || "NONE"}`;
      if (!acc[key]) acc[key] = { total: 0, regular: 0, makeup: 0 };
      acc[key].total++;
      if (record.isMakeup) {
        acc[key].makeup++;
      } else {
        acc[key].regular++;
      }
      return acc;
    }, {} as Record<string, { total: number; regular: number; makeup: number }>);

    console.log("\nAttendance by Grade/Section:");
    Object.entries(gradeStats).forEach(([grade, stats]) => {
      console.log(
        `- ${grade}: ${stats.total} total (${stats.regular} regular, ${stats.makeup} makeup)`
      );
    });

    // Test attendance rate calculations
    console.log("\n📊 Attendance Rate Analysis:");
    for (const testMonth of testMonths) {
      const monthAttendance = await prisma.attendanceRecord.findMany({
        where: {
          date: {
            gte: new Date(testMonth.year, testMonth.month - 1, 1),
            lte: new Date(testMonth.year, testMonth.month, 0),
          },
        },
        include: {
          student: true,
        },
      });

      const studentAttendanceMap = monthAttendance.reduce((acc, record) => {
        if (!acc[record.studentId]) {
          acc[record.studentId] = {
            student: record.student,
            regular: 0,
            makeup: 0,
            total: 0,
          };
        }
        acc[record.studentId].total++;
        if (record.isMakeup) {
          acc[record.studentId].makeup++;
        } else {
          acc[record.studentId].regular++;
        }
        return acc;
      }, {} as Record<string, { student: any; regular: number; makeup: number; total: number }>);

      console.log(`\n${testMonth.month}/${testMonth.year} Attendance Summary:`);
      console.log(
        `- Students with attendance: ${
          Object.keys(studentAttendanceMap).length
        }`
      );
      console.log(`- Total attendance records: ${monthAttendance.length}`);
      console.log(
        `- Regular attendance: ${
          monthAttendance.filter((r) => !r.isMakeup).length
        }`
      );
      console.log(
        `- Makeup attendance: ${
          monthAttendance.filter((r) => r.isMakeup).length
        }`
      );
    }

    console.log(
      "\n✅ Comprehensive attendance scenario testing completed successfully!"
    );
  } catch (error) {
    console.error("❌ Error in comprehensive attendance testing:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  testComprehensiveAttendanceScenarios().catch(console.error);
}

export { testComprehensiveAttendanceScenarios };
