#!/usr/bin/env tsx
/**
 * System Status Script
 * Shows current system status and what to expect
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function showSystemStatus() {
  console.log("🎯 ATTENDANCE SYSTEM STATUS");
  console.log("===========================");

  try {
    // Check students
    const totalStudents = await prisma.student.count();
    const gradeBreakdown = await prisma.student.groupBy({
      by: ['grade', 'section'],
      _count: { grade: true }
    });

    console.log(`\n👥 STUDENTS: ${totalStudents} total`);
    gradeBreakdown.forEach(stat => {
      const sectionText = stat.section === 'NONE' ? '' : ` ${stat.section}`;
      console.log(`  - ${stat.grade}${sectionText}: ${stat._count.grade} students`);
    });

    // Check attendance records
    const totalAttendance = await prisma.attendanceRecord.count();
    console.log(`\n📊 ATTENDANCE RECORDS: ${totalAttendance} total`);
    
    if (totalAttendance === 0) {
      console.log("  ✅ Clean slate - no attendance records yet");
    }

    // Check auto-absence settings
    const gracePeriodSetting = await prisma.adminSettings.findUnique({
      where: { settingKey: 'AUTO_ABSENCE_GRACE_PERIOD' }
    });
    
    const gracePeriod = gracePeriodSetting ? gracePeriodSetting.settingValue : 'Not set';
    console.log(`\n🤖 AUTO-ABSENCE SYSTEM:`);
    console.log(`  - Status: ACTIVE`);
    console.log(`  - Grace period: ${gracePeriod} minutes`);

    // Check payment configs
    const paymentConfigs = await prisma.paymentConfig.count();
    console.log(`\n💰 PAYMENT CONFIGS: ${paymentConfigs} configurations`);

    // Tomorrow's schedule
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.getDay();
    
    const dayMapping = {
      0: ['SUN_WED'], // Sunday
      1: ['MON_THU'], // Monday
      2: ['SAT_TUE', 'SAT_TUE_THU'], // Tuesday
      3: ['SUN_WED'], // Wednesday
      4: ['MON_THU', 'SAT_TUE_THU'], // Thursday
      5: [], // Friday
      6: ['SAT_TUE', 'SAT_TUE_THU'] // Saturday
    };

    const tomorrowGroupDays = dayMapping[tomorrowDay as keyof typeof dayMapping] || [];
    
    if (tomorrowGroupDays.length > 0) {
      const studentsWithTomorrowSessions = await prisma.student.count({
        where: {
          groupDay: {
            in: tomorrowGroupDays as any[]
          }
        }
      });
      
      console.log(`\n📅 TOMORROW'S SESSIONS:`);
      console.log(`  - Date: ${tomorrow.toDateString()}`);
      console.log(`  - Students with sessions: ${studentsWithTomorrowSessions}`);
      console.log(`  - Auto-absence: WILL TRIGGER after grace period`);
    } else {
      console.log(`\n📅 TOMORROW'S SESSIONS:`);
      console.log(`  - Date: ${tomorrow.toDateString()}`);
      console.log(`  - Students with sessions: 0 (day off)`);
      console.log(`  - Auto-absence: WILL NOT TRIGGER`);
    }

    console.log(`\n🎯 WHAT TO EXPECT:`);
    console.log(`1. 🌐 Open attendance page tomorrow`);
    console.log(`2. 📅 Navigate to tomorrow's date`);
    console.log(`3. 👀 See students with scheduled sessions`);
    console.log(`4. ⏰ Wait for session time + 15 minutes`);
    console.log(`5. 🤖 Watch auto-absence system mark students absent`);
    console.log(`6. ✅ Test manual marking and overrides`);

    console.log(`\n🛠️  TESTING COMMANDS:`);
    console.log(`- Manual trigger: npx tsx scripts/trigger-auto-absence.ts`);
    console.log(`- Tomorrow preview: npx tsx scripts/tomorrow-preview.ts`);
    console.log(`- System status: npx tsx scripts/system-status.ts`);
    console.log(`- Verify data: npx tsx scripts/verify-attendance-data.ts`);

    console.log(`\n✅ SYSTEM READY FOR TESTING!`);

  } catch (error) {
    console.error("❌ System status check failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  showSystemStatus().catch(console.error);
}

export { showSystemStatus };