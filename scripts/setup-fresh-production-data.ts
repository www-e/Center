#!/usr/bin/env tsx
/**
 * Fresh Production Data Setup Script
 * Creates 50 students with realistic schedules for auto-absence testing
 */

import { PrismaClient, Grade, Section, GroupDay, PaymentPref } from "@prisma/client";

const prisma = new PrismaClient();

// Arabic names for realistic data
const arabicNames = [
  "أحمد محمد", "فاطمة علي", "محمد حسن", "عائشة إبراهيم", "علي أحمد",
  "زينب محمود", "حسن عبدالله", "مريم سعد", "يوسف علي", "سارة حسن",
  "عبدالله محمد", "هدى أحمد", "إبراهيم حسن", "نور فاطمة", "خالد علي",
  "أمل محمد", "سعد إبراهيم", "ليلى حسن", "عمر عبدالله", "رقية محمود",
  "طارق أحمد", "سلمى علي", "ماجد حسن", "دعاء محمد", "وليد إبراهيم",
  "شيماء عبدالله", "كريم محمود", "إسراء أحمد", "بشار علي", "منى حسن",
  "جمال محمد", "ريم إبراهيم", "نادر عبدالله", "سمية محمود", "فيصل أحمد",
  "لبنى علي", "صالح حسن", "غادة محمد", "حاتم إبراهيم", "نهى عبدالله",
  "رامي محمود", "سناء أحمد", "عادل علي", "وفاء حسن", "مصطفى محمد",
  "رانيا إبراهيم", "حسام عبدالله", "نجلاء محمود", "باسم أحمد", "هالة علي"
];

// Phone number generator for Egyptian numbers
function generateEgyptianPhone(): string {
  const prefixes = ['010', '011', '012', '015'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 90000000) + 10000000; // 8 digits
  return prefix + number.toString();
}

// Grade distribution (realistic for a tutoring center)
const gradeDistribution = [
  { grade: Grade.FIRST, section: Section.NONE, count: 20 },      // 40% - First year
  { grade: Grade.SECOND, section: Section.SCIENTIFIC, count: 12 }, // 24% - Second Scientific
  { grade: Grade.SECOND, section: Section.LITERARY, count: 8 },    // 16% - Second Literary  
  { grade: Grade.THIRD, section: Section.SCIENTIFIC, count: 7 },   // 14% - Third Scientific
  { grade: Grade.THIRD, section: Section.LITERARY, count: 3 }      // 6% - Third Literary
];

// Schedule configuration based on your constants.ts
const scheduleConfig = {
  [Grade.FIRST]: {
    sections: [Section.NONE],
    groupDays: [GroupDay.SAT_TUE, GroupDay.SUN_WED, GroupDay.MON_THU],
    times: ['02:00 PM', '03:15 PM', '04:30 PM']
  },
  [Grade.SECOND]: {
    sections: [Section.SCIENTIFIC, Section.LITERARY],
    groupDays: [GroupDay.SAT_TUE, GroupDay.SUN_WED, GroupDay.MON_THU],
    times: ['02:00 PM', '03:15 PM']
  },
  [Grade.THIRD]: {
    sections: [Section.SCIENTIFIC, Section.LITERARY],
    groupDays: [GroupDay.SAT_TUE_THU, GroupDay.SUN_WED], // Scientific gets SAT_TUE_THU, Literary gets SUN_WED
    times: ['12:00 PM', '04:30 PM']
  }
};

async function setupFreshProductionData() {
  console.log("🚀 Setting up fresh production data with 50 students...");

  try {
    // Step 1: Clear all existing data (respecting foreign key constraints)
    console.log("\n🧹 Step 1: Clearing existing data...");
    
    // Delete in correct order to respect foreign key constraints
    await prisma.receipt.deleteMany({});
    await prisma.paymentRecord.deleteMany({});
    await prisma.attendanceRecord.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.paymentConfig.deleteMany({});
    await prisma.adminSettings.deleteMany({});
    
    console.log("✅ All existing data cleared");

    // Step 2: Set up payment configurations
    console.log("\n💰 Step 2: Setting up payment configurations...");
    
    const paymentConfigs = [
      { grade: Grade.FIRST, section: Section.NONE, amount: 200 },
      { grade: Grade.SECOND, section: Section.SCIENTIFIC, amount: 250 },
      { grade: Grade.SECOND, section: Section.LITERARY, amount: 230 },
      { grade: Grade.THIRD, section: Section.SCIENTIFIC, amount: 300 },
      { grade: Grade.THIRD, section: Section.LITERARY, amount: 280 }
    ];

    for (const config of paymentConfigs) {
      await prisma.paymentConfig.create({
        data: config
      });
    }
    
    console.log("✅ Payment configurations created");

    // Step 3: Set up admin settings for auto-absence
    console.log("\n⚙️  Step 3: Configuring auto-absence system...");
    
    await prisma.adminSettings.create({
      data: {
        settingKey: 'AUTO_ABSENCE_GRACE_PERIOD',
        settingValue: '15' // 15 minutes grace period
      }
    });
    
    console.log("✅ Auto-absence grace period set to 15 minutes");

    // Step 4: Create 50 students with realistic distribution
    console.log("\n👥 Step 4: Creating 50 students...");
    
    let studentIndex = 0;
    let createdStudents = 0;

    for (const dist of gradeDistribution) {
      console.log(`\n📚 Creating ${dist.count} students for ${dist.grade} ${dist.section}...`);
      
      const config = scheduleConfig[dist.grade];
      
      for (let i = 0; i < dist.count; i++) {
        const name = arabicNames[studentIndex];
        const phone = generateEgyptianPhone();
        const parentPhone = generateEgyptianPhone();
        
        // Assign group day based on grade
        let groupDay: GroupDay;
        if (dist.grade === Grade.THIRD) {
          // Third grade: Scientific gets SAT_TUE_THU, Literary gets SUN_WED
          groupDay = dist.section === Section.SCIENTIFIC ? GroupDay.SAT_TUE_THU : GroupDay.SUN_WED;
        } else {
          // First and Second grades: distribute evenly across available days
          const availableDays = config.groupDays;
          groupDay = availableDays[i % availableDays.length];
        }
        
        // Assign time based on grade and distribute evenly
        const availableTimes = config.times;
        const groupTime = availableTimes[i % availableTimes.length];
        
        // Random payment preference
        const paymentPref = Math.random() > 0.5 ? PaymentPref.PREPAID : PaymentPref.POSTPAID;
        
        // Enrollment date - most students enrolled 1-3 months ago
        const enrollmentDate = new Date();
        enrollmentDate.setMonth(enrollmentDate.getMonth() - Math.floor(Math.random() * 3) - 1);
        
        // Generate student ID in new format
        const gradeNumber = dist.grade === Grade.FIRST ? 1 : dist.grade === Grade.SECOND ? 2 : 3;
        const studentNumber = (createdStudents + 1).toString().padStart(4, '0');
        const studentId = `std${gradeNumber}${studentNumber}`;

        await prisma.student.create({
          data: {
            studentId,
            name,
            phone,
            parentPhone,
            grade: dist.grade,
            section: dist.section,
            groupDay,
            groupTime,
            paymentPref,
            enrollmentDate
          }
        });

        console.log(`✅ Created: ${name} (${studentId}) - ${groupDay} at ${groupTime}`);
        
        studentIndex++;
        createdStudents++;
      }
    }

    console.log(`\n✅ Successfully created ${createdStudents} students`);

    // Step 5: Display schedule summary
    console.log("\n📅 Step 5: Schedule Summary:");
    
    const scheduleStats = await prisma.student.groupBy({
      by: ['groupDay', 'groupTime'],
      _count: {
        groupDay: true
      },
      orderBy: [
        { groupDay: 'asc' },
        { groupTime: 'asc' }
      ]
    });

    const dayNames = {
      [GroupDay.SAT_TUE]: 'السبت والثلاثاء',
      [GroupDay.SUN_WED]: 'الأحد والأربعاء', 
      [GroupDay.MON_THU]: 'الاثنين والخميس',
      [GroupDay.SAT_TUE_THU]: 'السبت والثلاثاء والخميس'
    };

    scheduleStats.forEach(stat => {
      console.log(`${dayNames[stat.groupDay]} - ${stat.groupTime}: ${stat._count.groupDay} طالب`);
    });

    // Step 6: Configure auto-absence for tomorrow's testing
    console.log("\n🤖 Step 6: Auto-absence system configuration:");
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
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
    
    if (tomorrowGroupDays.length > 0) {
      const studentsWithTomorrowSessions = await prisma.student.count({
        where: {
          groupDay: {
            in: tomorrowGroupDays
          }
        }
      });
      
      console.log(`📅 Tomorrow (${tomorrow.toDateString()}) sessions:`);
      console.log(`👥 ${studentsWithTomorrowSessions} students have sessions scheduled`);
      console.log(`🤖 Students not manually marked present will be auto-marked absent after 15 minutes grace period`);
      
      // Show which groups have sessions tomorrow
      for (const groupDay of tomorrowGroupDays) {
        const studentsInGroup = await prisma.student.findMany({
          where: { groupDay },
          select: { name: true, groupTime: true }
        });
        
        console.log(`\n${dayNames[groupDay]}:`);
        const timeGroups = studentsInGroup.reduce((acc, student) => {
          if (!acc[student.groupTime]) acc[student.groupTime] = [];
          acc[student.groupTime].push(student.name);
          return acc;
        }, {} as Record<string, string[]>);
        
        Object.entries(timeGroups).forEach(([time, students]) => {
          console.log(`  ${time}: ${students.length} طالب`);
        });
      }
    } else {
      console.log(`📅 Tomorrow (${tomorrow.toDateString()}) is a day off - no sessions scheduled`);
      console.log(`🤖 Auto-absence system will not mark anyone absent tomorrow`);
    }

    // Step 7: Final verification
    console.log("\n✅ Step 7: Final verification:");
    
    const totalStudents = await prisma.student.count();
    const gradeBreakdown = await prisma.student.groupBy({
      by: ['grade', 'section'],
      _count: { grade: true }
    });
    
    console.log(`📊 Total students created: ${totalStudents}`);
    console.log("📊 Grade breakdown:");
    gradeBreakdown.forEach(stat => {
      const sectionText = stat.section === Section.NONE ? '' : ` ${stat.section}`;
      console.log(`  ${stat.grade}${sectionText}: ${stat._count.grade} طالب`);
    });

    console.log("\n🎉 Fresh production data setup completed successfully!");
    console.log("\n📋 What happens next:");
    console.log("1. 🕐 Students with sessions tomorrow will appear in the attendance system");
    console.log("2. 🤖 After their session time + 15 minutes grace period, they'll be auto-marked absent");
    console.log("3. ✅ You can manually mark them present before the grace period expires");
    console.log("4. 🔄 You can override auto-absences back to present if needed");
    console.log("5. 📊 The attendance table will show realistic absence patterns");

  } catch (error) {
    console.error("❌ Fresh production data setup failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  setupFreshProductionData().catch(console.error);
}

export { setupFreshProductionData };