#!/usr/bin/env tsx
/**
 * Tomorrow Preview Script
 * Shows exactly what will happen with auto-absence tomorrow
 */

import { PrismaClient, GroupDay } from "@prisma/client";

const prisma = new PrismaClient();

async function showTomorrowPreview() {
  console.log("📅 Tomorrow's Auto-Absence Preview");
  console.log("==================================");

  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const arabicDayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    
    console.log(`\n📅 Tomorrow is: ${dayNames[tomorrowDay]} (${arabicDayNames[tomorrowDay]})`);
    console.log(`📅 Date: ${tomorrow.toDateString()}`);

    // Map days to group days
    const dayMapping = {
      0: [GroupDay.SUN_WED], // Sunday
      1: [GroupDay.MON_THU], // Monday
      2: [GroupDay.SAT_TUE, GroupDay.SAT_TUE_THU], // Tuesday
      3: [GroupDay.SUN_WED], // Wednesday
      4: [GroupDay.MON_THU, GroupDay.SAT_TUE_THU], // Thursday
      5: [], // Friday (no sessions)
      6: [GroupDay.SAT_TUE, GroupDay.SAT_TUE_THU] // Saturday
    };

    const tomorrowGroupDays = dayMapping[tomorrowDay as keyof typeof dayMapping] || [];
    
    if (tomorrowGroupDays.length === 0) {
      console.log("\n🏖️  Tomorrow is a day off - no sessions scheduled!");
      console.log("🤖 Auto-absence system will not run tomorrow");
      return;
    }

    console.log(`\n👥 Students with sessions tomorrow:`);
    
    const groupDayNames = {
      [GroupDay.SAT_TUE]: 'السبت والثلاثاء',
      [GroupDay.SUN_WED]: 'الأحد والأربعاء',
      [GroupDay.MON_THU]: 'الاثنين والخميس',
      [GroupDay.SAT_TUE_THU]: 'السبت والثلاثاء والخميس'
    };

    let totalStudents = 0;

    for (const groupDay of tomorrowGroupDays) {
      const studentsInGroup = await prisma.student.findMany({
        where: { groupDay },
        orderBy: [
          { groupTime: 'asc' },
          { name: 'asc' }
        ]
      });

      if (studentsInGroup.length > 0) {
        console.log(`\n📚 ${groupDayNames[groupDay]} (${studentsInGroup.length} طالب):`);
        
        // Group by time
        const timeGroups = studentsInGroup.reduce((acc, student) => {
          if (!acc[student.groupTime]) acc[student.groupTime] = [];
          acc[student.groupTime].push(student);
          return acc;
        }, {} as Record<string, typeof studentsInGroup>);

        Object.entries(timeGroups).forEach(([time, students]) => {
          console.log(`\n  🕐 ${time} (${students.length} طالب):`);
          students.forEach((student, index) => {
            console.log(`    ${index + 1}. ${student.name} (${student.studentId}) - ${student.grade} ${student.section}`);
          });
          
          // Calculate auto-absence time
          const [timeStr, period] = time.split(' ');
          const [hours, minutes] = timeStr.split(':').map(Number);
          let sessionHour = hours;
          if (period === 'PM' && hours !== 12) sessionHour += 12;
          if (period === 'AM' && hours === 12) sessionHour = 0;
          
          const sessionTime = new Date(tomorrow);
          sessionTime.setHours(sessionHour, minutes, 0, 0);
          
          const autoAbsenceTime = new Date(sessionTime);
          autoAbsenceTime.setMinutes(autoAbsenceTime.getMinutes() + 15); // 15 minutes grace period
          
          console.log(`    🤖 Auto-absence after: ${autoAbsenceTime.toLocaleTimeString('ar-EG')} (15 min grace period)`);
        });
        
        totalStudents += studentsInGroup.length;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`👥 Total students with sessions tomorrow: ${totalStudents}`);
    console.log(`⏰ Grace period: 15 minutes after session start time`);
    console.log(`🤖 Auto-absence system: ACTIVE`);

    console.log(`\n🔄 How it works:`);
    console.log(`1. 🕐 Each student's session starts at their scheduled time`);
    console.log(`2. ⏳ System waits 15 minutes (grace period)`);
    console.log(`3. 🤖 If not manually marked present, student is auto-marked ABSENT_AUTO`);
    console.log(`4. ✅ You can manually mark them present anytime before auto-absence`);
    console.log(`5. 🔄 You can override auto-absences back to present later`);

    console.log(`\n💡 To test tomorrow:`);
    console.log(`1. 🌐 Open the attendance page in your browser`);
    console.log(`2. 📅 Navigate to tomorrow's date`);
    console.log(`3. 👀 Watch as students get auto-marked absent after their grace period`);
    console.log(`4. ✅ Try manually marking some students present`);
    console.log(`5. 🔄 Try overriding some auto-absences back to present`);

    // Show current time for reference
    const now = new Date();
    console.log(`\n🕐 Current time: ${now.toLocaleString('ar-EG')}`);
    console.log(`📅 Current date: ${now.toDateString()}`);

  } catch (error) {
    console.error("❌ Tomorrow preview failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  showTomorrowPreview().catch(console.error);
}

export { showTomorrowPreview };