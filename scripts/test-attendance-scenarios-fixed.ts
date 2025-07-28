// scripts/test-attendance-scenarios-fixed.ts
import { PrismaClient, GroupDay } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to get session dates for a month
function getSessionDatesForMonth(year: number, month: number, groupDay: GroupDay): Date[] {
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

async function testAttendanceScenarios() {
  console.log('🧪 Starting attendance scenario testing...');

  try {
    // Get all students
    const students = await prisma.student.findMany();
    console.log(`👥 Found ${students.length} students for testing`);

    if (students.length === 0) {
      console.log('⚠️  No students found. Run generate-students.ts first.');
      return;
    }

    // Test scenarios for current month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    console.log(`📅 Testing scenarios for ${currentMonth}/${currentYear}`);

    // Clear existing attendance for testing
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0);
    
    await prisma.attendanceRecord.deleteMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    let totalRecords = 0;

    // Scenario 1: Perfect attendance (some students attend all sessions)
    console.log('\n📊 Scenario 1: Perfect Attendance');
    const perfectStudents = students.slice(0, 5);
    
    for (const student of perfectStudents) {
      const sessionDates = getSessionDatesForMonth(currentYear, currentMonth, student.groupDay);
      
      for (const sessionDate of sessionDates) {
        // Only create attendance for dates after enrollment
        if (sessionDate >= student.enrollmentDate) {
          await prisma.attendanceRecord.create({
            data: {
              studentId: student.id,
              date: sessionDate,
              isMakeup: false,
            },
          });
          totalRecords++;
        }
      }
    }
    console.log(`✅ Created perfect attendance for ${perfectStudents.length} students`);

    // Scenario 2: Partial attendance (students miss some sessions)
    console.log('\n📊 Scenario 2: Partial Attendance');
    const partialStudents = students.slice(5, 15);
    
    for (const student of partialStudents) {
      const sessionDates = getSessionDatesForMonth(currentYear, currentMonth, student.groupDay);
      
      // Attend 70% of sessions randomly
      const attendanceDates = sessionDates
        .filter(date => date >= student.enrollmentDate)
        .filter(() => Math.random() < 0.7);
      
      for (const sessionDate of attendanceDates) {
        await prisma.attendanceRecord.create({
          data: {
            studentId: student.id,
            date: sessionDate,
            isMakeup: false,
          },
        });
        totalRecords++;
      }
    }
    console.log(`✅ Created partial attendance for ${partialStudents.length} students`);

    // Scenario 3: Makeup sessions
    console.log('\n📊 Scenario 3: Makeup Sessions');
    const makeupStudents = students.slice(15, 20);
    
    for (const student of makeupStudents) {
      const sessionDates = getSessionDatesForMonth(currentYear, currentMonth, student.groupDay);
      
      // Regular attendance for half the sessions
      const regularDates = sessionDates
        .filter(date => date >= student.enrollmentDate)
        .slice(0, Math.floor(sessionDates.length / 2));
      
      for (const sessionDate of regularDates) {
        await prisma.attendanceRecord.create({
          data: {
            studentId: student.id,
            date: sessionDate,
            isMakeup: false,
          },
        });
        totalRecords++;
      }

      // Add some makeup sessions
      const makeupCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < makeupCount; i++) {
        const randomDate = new Date(currentYear, currentMonth - 1, Math.floor(Math.random() * 28) + 1);
        if (randomDate >= student.enrollmentDate) {
          await prisma.attendanceRecord.create({
            data: {
              studentId: student.id,
              date: randomDate,
              isMakeup: true,
            },
          });
          totalRecords++;
        }
      }
    }
    console.log(`✅ Created makeup sessions for ${makeupStudents.length} students`);

    // Generate statistics
    console.log('\n📈 Test Results Summary:');
    console.log(`- Total attendance records created: ${totalRecords}`);
    
    const attendanceStats = await prisma.attendanceRecord.groupBy({
      by: ['isMakeup'],
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _count: true,
    });

    const regularAttendance = attendanceStats.find(stat => !stat.isMakeup)?._count || 0;
    const makeupAttendance = attendanceStats.find(stat => stat.isMakeup)?._count || 0;

    console.log(`- Regular attendance: ${regularAttendance}`);
    console.log(`- Makeup attendance: ${makeupAttendance}`);

    console.log('\n✅ Attendance scenario testing completed successfully!');

  } catch (error) {
    console.error('❌ Error in attendance testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  testAttendanceScenarios();
}

export { testAttendanceScenarios };