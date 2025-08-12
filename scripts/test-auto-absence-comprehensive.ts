#!/usr/bin/env tsx
/**
 * Comprehensive Auto-Absence Testing Script
 * Tests auto-absence functionality and creates explicit absent records
 */

import { PrismaClient, AttendanceStatus, GroupDay } from "@prisma/client";

const prisma = new PrismaClient();

// Helper to get session dates for a month
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
  status: AttendanceStatus = AttendanceStatus.PRESENT,
  isMakeup: boolean = false,
  markedBy: string = "TEST_SCRIPT"
) {
  try {
    return await prisma.attendanceRecord.create({
      data: {
        studentId,
        date,
        status,
        isMakeup,
        markedBy,
        notes:
          status === AttendanceStatus.ABSENT_AUTO
            ? "Auto-marked absent by test script"
            : status === AttendanceStatus.ABSENT_MANUAL
            ? "Manually marked absent by test script"
            : "Test attendance record",
      },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
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

async function testAutoAbsenceComprehensive() {
  console.log("🧪 Starting comprehensive auto-absence testing...");

  try {
    // Get all students
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
      `📅 Testing auto-absence for ${currentMonth}/${currentYear} and ${previousMonth}/${previousYear}`
    );

    let totalRecords = 0;
    let presentRecords = 0;
    let absentAutoRecords = 0;
    let absentManualRecords = 0;
    let makeupRecords = 0;

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

    console.log("🗑️  Cleared existing attendance records for test months");

    // Scenario 1: Perfect Attendance (15% of students)
    console.log("\n📊 Scenario 1: Perfect Attendance Students");
    const perfectStudents = students.slice(
      0,
      Math.floor(students.length * 0.15)
    );

    for (const student of perfectStudents) {
      for (const testMonth of testMonths) {
        const sessionDates = getSessionDatesForMonth(
          testMonth.year,
          testMonth.month,
          student.groupDay
        );

        for (const sessionDate of sessionDates) {
          if (sessionDate >= student.enrollmentDate) {
            const record = await createAttendanceRecord(
              student.id,
              sessionDate,
              AttendanceStatus.PRESENT,
              false,
              "PERFECT_STUDENT"
            );
            if (record) {
              totalRecords++;
              presentRecords++;
            }
          }
        }
      }
    }
    console.log(
      `✅ Created perfect attendance for ${perfectStudents.length} students`
    );

    // Scenario 2: Good Attendance with Some Auto-Absences (25% of students)
    console.log("\n📊 Scenario 2: Good Attendance with Auto-Absences");
    const goodStudents = students.slice(
      Math.floor(students.length * 0.15),
      Math.floor(students.length * 0.4)
    );

    for (const student of goodStudents) {
      for (const testMonth of testMonths) {
        const sessionDates = getSessionDatesForMonth(
          testMonth.year,
          testMonth.month,
          student.groupDay
        );

        for (const sessionDate of sessionDates) {
          if (sessionDate >= student.enrollmentDate) {
            const random = Math.random();
            if (random < 0.8) {
              // 80% present
              const record = await createAttendanceRecord(
                student.id,
                sessionDate,
                AttendanceStatus.PRESENT,
                false,
                "GOOD_STUDENT"
              );
              if (record) {
                totalRecords++;
                presentRecords++;
              }
            } else {
              // 20% auto-absent
              const record = await createAttendanceRecord(
                student.id,
                sessionDate,
                AttendanceStatus.ABSENT_AUTO,
                false,
                "SYSTEM"
              );
              if (record) {
                totalRecords++;
                absentAutoRecords++;
              }
            }
          }
        }
      }
    }
    console.log(
      `✅ Created good attendance with auto-absences for ${goodStudents.length} students`
    );

    // Scenario 3: Average Attendance with Mixed Absences (30% of students)
    console.log("\n📊 Scenario 3: Average Attendance with Mixed Absences");
    const averageStudents = students.slice(
      Math.floor(students.length * 0.4),
      Math.floor(students.length * 0.7)
    );

    for (const student of averageStudents) {
      for (const testMonth of testMonths) {
        const sessionDates = getSessionDatesForMonth(
          testMonth.year,
          testMonth.month,
          student.groupDay
        );

        for (const sessionDate of sessionDates) {
          if (sessionDate >= student.enrollmentDate) {
            const random = Math.random();
            if (random < 0.65) {
              // 65% present
              const record = await createAttendanceRecord(
                student.id,
                sessionDate,
                AttendanceStatus.PRESENT,
                false,
                "AVERAGE_STUDENT"
              );
              if (record) {
                totalRecords++;
                presentRecords++;
              }
            } else if (random < 0.85) {
              // 20% auto-absent
              const record = await createAttendanceRecord(
                student.id,
                sessionDate,
                AttendanceStatus.ABSENT_AUTO,
                false,
                "SYSTEM"
              );
              if (record) {
                totalRecords++;
                absentAutoRecords++;
              }
            } else {
              // 15% manually marked absent
              const record = await createAttendanceRecord(
                student.id,
                sessionDate,
                AttendanceStatus.ABSENT_MANUAL,
                false,
                "TEACHER"
              );
              if (record) {
                totalRecords++;
                absentManualRecords++;
              }
            }
          }
        }
      }
    }
    console.log(
      `✅ Created average attendance with mixed absences for ${averageStudents.length} students`
    );

    // Scenario 4: Poor Attendance with Many Absences (20% of students)
    console.log("\n📊 Scenario 4: Poor Attendance with Many Absences");
    const poorStudents = students.slice(
      Math.floor(students.length * 0.7),
      Math.floor(students.length * 0.9)
    );

    for (const student of poorStudents) {
      for (const testMonth of testMonths) {
        const sessionDates = getSessionDatesForMonth(
          testMonth.year,
          testMonth.month,
          student.groupDay
        );

        for (const sessionDate of sessionDates) {
          if (sessionDate >= student.enrollmentDate) {
            const random = Math.random();
            if (random < 0.4) {
              // 40% present
              const record = await createAttendanceRecord(
                student.id,
                sessionDate,
                AttendanceStatus.PRESENT,
                false,
                "POOR_STUDENT"
              );
              if (record) {
                totalRecords++;
                presentRecords++;
              }
            } else if (random < 0.7) {
              // 30% auto-absent
              const record = await createAttendanceRecord(
                student.id,
                sessionDate,
                AttendanceStatus.ABSENT_AUTO,
                false,
                "SYSTEM"
              );
              if (record) {
                totalRecords++;
                absentAutoRecords++;
              }
            } else {
              // 30% manually marked absent
              const record = await createAttendanceRecord(
                student.id,
                sessionDate,
                AttendanceStatus.ABSENT_MANUAL,
                false,
                "TEACHER"
              );
              if (record) {
                totalRecords++;
                absentManualRecords++;
              }
            }
          }
        }
      }
    }
    console.log(
      `✅ Created poor attendance with many absences for ${poorStudents.length} students`
    );

    // Scenario 5: Completely Absent Students (10% of students)
    console.log("\n📊 Scenario 5: Completely Absent Students");
    const absentStudents = students.slice(Math.floor(students.length * 0.9));

    for (const student of absentStudents) {
      for (const testMonth of testMonths) {
        const sessionDates = getSessionDatesForMonth(
          testMonth.year,
          testMonth.month,
          student.groupDay
        );

        for (const sessionDate of sessionDates) {
          if (sessionDate >= student.enrollmentDate) {
            // All sessions marked as auto-absent
            const record = await createAttendanceRecord(
              student.id,
              sessionDate,
              AttendanceStatus.ABSENT_AUTO,
              false,
              "SYSTEM"
            );
            if (record) {
              totalRecords++;
              absentAutoRecords++;
            }
          }
        }
      }
    }
    console.log(
      `✅ Created complete absence records for ${absentStudents.length} students`
    );

    // Scenario 6: Makeup Sessions for Poor Attendance Students
    console.log("\n📊 Scenario 6: Makeup Sessions");
    const makeupCandidates = [...averageStudents, ...poorStudents];

    for (const student of makeupCandidates.slice(
      0,
      Math.floor(makeupCandidates.length * 0.3)
    )) {
      for (const testMonth of testMonths) {
        // Create 1-2 makeup sessions per month
        const makeupCount = Math.floor(Math.random() * 2) + 1;

        for (let i = 0; i < makeupCount; i++) {
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
              AttendanceStatus.PRESENT,
              true,
              "MAKEUP_SESSION"
            );
            if (record) {
              totalRecords++;
              presentRecords++;
              makeupRecords++;
            }
          }
        }
      }
    }
    console.log(
      `✅ Created makeup sessions for ${Math.floor(
        makeupCandidates.length * 0.3
      )} students`
    );

    // Generate comprehensive statistics
    console.log("\n📈 Comprehensive Auto-Absence Test Results:");
    console.log(`- Total attendance records created: ${totalRecords}`);
    console.log(`- Present records: ${presentRecords}`);
    console.log(`- Auto-absent records: ${absentAutoRecords}`);
    console.log(`- Manual-absent records: ${absentManualRecords}`);
    console.log(`- Makeup records: ${makeupRecords}`);
    console.log(
      `- Absence rate: ${(
        ((absentAutoRecords + absentManualRecords) / totalRecords) *
        100
      ).toFixed(1)}%`
    );

    // Test auto-absence system functionality
    console.log("\n🔍 Testing Auto-Absence System:");

    // Import and test the auto-absence function
    const { processAutoAbsences } = await import("../src/lib/auto-absence");

    console.log("🤖 Running auto-absence process...");
    const autoAbsenceResult = await processAutoAbsences();

    console.log(`✅ Auto-absence process completed:`);
    console.log(`- Students processed: ${autoAbsenceResult.processed}`);
    console.log(`- Students marked absent: ${autoAbsenceResult.marked}`);
    console.log(`- Errors: ${autoAbsenceResult.errors.length}`);

    if (autoAbsenceResult.errors.length > 0) {
      console.log("❌ Errors encountered:");
      autoAbsenceResult.errors.forEach((error) => console.log(`  - ${error}`));
    }

    // Verify database consistency
    console.log("\n🔍 Database Consistency Check:");

    const attendanceStats = await prisma.attendanceRecord.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    console.log("📊 Attendance Status Distribution:");
    attendanceStats.forEach((stat) => {
      console.log(`- ${stat.status}: ${stat._count.status} records`);
    });

    // Check for students with no attendance records
    const studentsWithoutAttendance = await prisma.student.findMany({
      where: {
        attendance: {
          none: {},
        },
      },
    });

    console.log(
      `📊 Students with no attendance records: ${studentsWithoutAttendance.length}`
    );
    if (studentsWithoutAttendance.length > 0) {
      studentsWithoutAttendance.forEach((student) => {
        console.log(`  - ${student.name} (${student.studentId})`);
      });
    }

    console.log(
      "\n✅ Comprehensive auto-absence testing completed successfully!"
    );
  } catch (error) {
    console.error("❌ Auto-absence testing failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testAutoAbsenceComprehensive().catch(console.error);
}

export { testAutoAbsenceComprehensive };
