// src/lib/auto-absence.ts
import prisma from './prisma';
import { AttendanceStatus, GroupDay } from '@prisma/client';

// Helper function to get session dates for a month (same as utils.ts)
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

// Helper function to parse time string (e.g., "02:00 PM") to minutes since midnight
function parseTimeToMinutes(timeString: string): number {
  const [time, period] = timeString.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  
  let totalMinutes = hours * 60 + minutes;
  
  if (period === 'PM' && hours !== 12) {
    totalMinutes += 12 * 60;
  } else if (period === 'AM' && hours === 12) {
    totalMinutes = minutes;
  }
  
  return totalMinutes;
}

// Get the auto-absence grace period from admin settings
async function getGracePeriod(): Promise<number> {
  try {
    const setting = await prisma.adminSettings.findUnique({
      where: { settingKey: 'AUTO_ABSENCE_GRACE_PERIOD' }
    });
    
    if (setting) {
      const gracePeriod = parseInt(setting.settingValue);
      return isNaN(gracePeriod) ? 15 : Math.max(5, Math.min(60, gracePeriod));
    }
    
    // Default to 15 minutes if not set
    return 15;
  } catch (error) {
    console.error('Error getting grace period:', error);
    return 15;
  }
}

// Set the auto-absence grace period
export async function setGracePeriod(minutes: number): Promise<boolean> {
  try {
    const validMinutes = Math.max(5, Math.min(60, minutes));
    
    await prisma.adminSettings.upsert({
      where: { settingKey: 'AUTO_ABSENCE_GRACE_PERIOD' },
      update: { 
        settingValue: validMinutes.toString(),
        updatedAt: new Date()
      },
      create: {
        settingKey: 'AUTO_ABSENCE_GRACE_PERIOD',
        settingValue: validMinutes.toString()
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error setting grace period:', error);
    return false;
  }
}

// Main auto-absence processing function
export async function processAutoAbsences(): Promise<{
  processed: number;
  marked: number;
  errors: string[];
}> {
  const results = {
    processed: 0,
    marked: 0,
    errors: [] as string[]
  };

  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
    const gracePeriod = await getGracePeriod();

    console.log(`🔄 Processing auto-absences at ${now.toISOString()}, grace period: ${gracePeriod} minutes`);

    // Get all students
    const students = await prisma.student.findMany({
      include: {
        attendance: {
          where: {
            date: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        }
      }
    });

    for (const student of students) {
      try {
        results.processed++;

        // Check if student has a session today
        const todayDay = today.getDay();
        const dayMap: Record<GroupDay, number[]> = {
          [GroupDay.SAT_TUE]: [6, 2],
          [GroupDay.SUN_WED]: [0, 3],
          [GroupDay.MON_THU]: [1, 4],
          [GroupDay.SAT_TUE_THU]: [6, 2, 4],
        };

        const studentScheduledDays = dayMap[student.groupDay];
        if (!studentScheduledDays.includes(todayDay)) {
          continue; // No session today
        }

        // Check if student is enrolled for today
        if (student.enrollmentDate > today) {
          continue; // Not enrolled yet
        }

        // Check if already has an attendance record for today
        const existingRecord = student.attendance.find(record => 
          record.date.getTime() === today.getTime()
        );

        if (existingRecord) {
          continue; // Already marked (present or absent)
        }

        // Parse student's session time
        const sessionTimeMinutes = parseTimeToMinutes(student.groupTime);
        const graceEndTime = sessionTimeMinutes + gracePeriod;

        // Check if grace period has passed
        if (currentTimeMinutes >= graceEndTime) {
          // Mark as auto-absent
          await prisma.attendanceRecord.create({
            data: {
              studentId: student.id,
              date: today,
              status: AttendanceStatus.ABSENT_AUTO,
              isMakeup: false,
              markedAt: now,
              markedBy: 'SYSTEM',
              notes: `Auto-marked absent after ${gracePeriod} minute grace period`
            }
          });

          results.marked++;
          console.log(`📝 Auto-marked ${student.name} (${student.studentId}) as absent`);
        }

      } catch (error) {
        const errorMsg = `Error processing student ${student.studentId}: ${error}`;
        results.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    console.log(`✅ Auto-absence processing complete: ${results.marked} students marked absent out of ${results.processed} processed`);

  } catch (error) {
    const errorMsg = `Fatal error in auto-absence processing: ${error}`;
    results.errors.push(errorMsg);
    console.error(errorMsg);
  }

  return results;
}

// Background job scheduler
let autoAbsenceInterval: NodeJS.Timeout | null = null;

export function startAutoAbsenceScheduler(): void {
  if (autoAbsenceInterval) {
    console.log('⚠️  Auto-absence scheduler already running');
    return;
  }

  console.log('🚀 Starting auto-absence scheduler (runs every 5 minutes)');
  
  // Run immediately on start
  processAutoAbsences();
  
  // Then run every 5 minutes
  autoAbsenceInterval = setInterval(() => {
    processAutoAbsences();
  }, 5 * 60 * 1000); // 5 minutes
}

export function stopAutoAbsenceScheduler(): void {
  if (autoAbsenceInterval) {
    clearInterval(autoAbsenceInterval);
    autoAbsenceInterval = null;
    console.log('🛑 Auto-absence scheduler stopped');
  }
}

// Get scheduler status
export function getSchedulerStatus(): {
  isRunning: boolean;
  nextRun?: Date;
} {
  return {
    isRunning: autoAbsenceInterval !== null,
    nextRun: autoAbsenceInterval ? new Date(Date.now() + 5 * 60 * 1000) : undefined
  };
}

// Override an auto-absence to present
export async function overrideAutoAbsence(
  studentId: string,
  date: Date,
  overriddenBy: string
): Promise<boolean> {
  try {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const updated = await prisma.attendanceRecord.updateMany({
      where: {
        studentId,
        date: dateOnly,
        status: AttendanceStatus.ABSENT_AUTO
      },
      data: {
        status: AttendanceStatus.PRESENT,
        overriddenAt: new Date(),
        overriddenBy,
        notes: 'Auto-absence overridden to present'
      }
    });

    return updated.count > 0;
  } catch (error) {
    console.error('Error overriding auto-absence:', error);
    return false;
  }
}