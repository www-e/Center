// src/lib/auto-absence.ts
import prisma from './prisma';
import { AttendanceStatus, GroupDay } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

// --- NEW RESILIENT SCHEDULER LOGIC ---

const LOCK_FILE_PATH = path.join(process.cwd(), '.scheduler.lock.json');
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

interface LockFile {
  lastRun: string;
}

/**
 * Checks if the auto-absence process should run based on the last run time.
 * This is the core of our resilient, offline scheduler.
 * This function will be called from a frequently used API route.
 */
export async function triggerAutoAbsenceCheck(): Promise<void> {
  try {
    let lastRun = 0;
    try {
      const lockFileContent = await fs.readFile(LOCK_FILE_PATH, 'utf-8');
      const lockFileData: LockFile = JSON.parse(lockFileContent);
      lastRun = new Date(lockFileData.lastRun).getTime();
    } catch (error) {
      // If the file doesn't exist or is invalid, we'll run the process.
      console.log('Scheduler lock file not found. Assuming first run.');
    }

    const now = Date.now();
    if (now - lastRun > CHECK_INTERVAL_MS) {
      console.log('SCHEDULER: Interval passed. Running auto-absence process...');
      const result = await processAutoAbsences();
      
      // After a successful run, update the lock file.
      const newLockFileContent: LockFile = { lastRun: new Date(now).toISOString() };
      await fs.writeFile(LOCK_FILE_PATH, JSON.stringify(newLockFileContent, null, 2));
      
      console.log(`SCHEDULER: Process finished. Marked ${result.marked} students. Next check in 5 minutes.`);
    }
  } catch (error) {
    console.error('SCHEDULER: Failed to trigger auto-absence check.', error);
  }
}

// --- CORE AUTO-ABSENCE LOGIC (Unchanged, but kept) ---

// Helper function to get session dates for a month
function getSessionDatesForMonth(year: number, month: number, groupDay: GroupDay): Date[] {
  const dates: Date[] = [];
  const date = new Date(Date.UTC(year, month - 1, 1));

  const dayMap: Record<GroupDay, number[]> = {
    [GroupDay.SAT_TUE]: [6, 2],
    [GroupDay.SUN_WED]: [0, 3],
    [GroupDay.MON_THU]: [1, 4],
    [GroupDay.SAT_TUE_THU]: [6, 2, 4],
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
    
    return 15; // Default to 15 minutes if not set
  } catch (error) {
    console.error('Error getting grace period:', error);
    return 15;
  }
}

// Set the auto-absence grace period (Exported for use in the API)
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

// Main auto-absence processing function (Exported for use by the scheduler and API)
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

    console.log(`AUTO-ABSENCE: Processing at ${now.toISOString()}, grace period: ${gracePeriod} minutes`);

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
        const todayDay = today.getDay();
        const dayMap: Record<GroupDay, number[]> = {
          [GroupDay.SAT_TUE]: [6, 2],
          [GroupDay.SUN_WED]: [0, 3],
          [GroupDay.MON_THU]: [1, 4],
          [GroupDay.SAT_TUE_THU]: [6, 2, 4],
        };
        const studentScheduledDays = dayMap[student.groupDay];

        if (!studentScheduledDays.includes(todayDay) || student.enrollmentDate > today) {
          continue;
        }

        const existingRecord = student.attendance.find(record => 
          record.date.getTime() === today.getTime()
        );

        if (existingRecord) {
          continue;
        }

        const sessionTimeMinutes = parseTimeToMinutes(student.groupTime);
        const graceEndTime = sessionTimeMinutes + gracePeriod;

        if (currentTimeMinutes >= graceEndTime) {
          await prisma.attendanceRecord.create({
            data: {
              studentId: student.id,
              date: today,
              status: AttendanceStatus.ABSENT_AUTO,
              markedBy: 'SYSTEM',
              notes: `Auto-marked absent after ${gracePeriod} minute grace period`
            }
          });
          results.marked++;
          console.log(`AUTO-ABSENCE: Marked ${student.name} as absent.`);
        }
      } catch (error) {
        const errorMsg = `Error processing student ${student.studentId}: ${error}`;
        results.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }
    console.log(`AUTO-ABSENCE: Complete. ${results.marked} marked / ${results.processed} processed.`);
  } catch (error) {
    const errorMsg = `Fatal error in auto-absence processing: ${error}`;
    results.errors.push(errorMsg);
    console.error(errorMsg);
  }

  return results;
}

// Override an auto-absence to present (Exported for potential future use)
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