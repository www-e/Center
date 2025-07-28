// scripts/generate-students.ts
import { PrismaClient, Grade, Section, GroupDay, PaymentPref } from '@prisma/client';

const prisma = new PrismaClient();

// Egyptian names for realistic data
const firstNames = [
  'أحمد', 'محمد', 'علي', 'حسن', 'عمر', 'يوسف', 'إبراهيم', 'عبدالله', 'خالد', 'سعد',
  'فاطمة', 'عائشة', 'زينب', 'مريم', 'سارة', 'نور', 'هدى', 'أمل', 'رقية', 'خديجة'
];

const lastNames = [
  'محمد', 'أحمد', 'علي', 'حسن', 'إبراهيم', 'عبدالرحمن', 'عبدالله', 'محمود', 'سعد', 'عمر',
  'الشريف', 'المصري', 'السيد', 'عبدالعزيز', 'الدين', 'فاروق', 'رضا', 'طه', 'زكي', 'فهمي'
];

// Phone number generator (Egyptian format)
function generatePhone(): string {
  const prefixes = ['010', '011', '012', '015'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `${prefix}${number}`;
}

// Generate random enrollment date (last 6 months)
function generateEnrollmentDate(): Date {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  const randomTime = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
  return new Date(randomTime);
}

// Get random name
function getRandomName(): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

// Schedule data matching the constants
const scheduleData = {
  [Grade.FIRST]: {
    sections: [Section.NONE],
    groupDays: {
      [GroupDay.SAT_TUE]: ['4:00 PM - 6:00 PM', '6:00 PM - 8:00 PM'],
      [GroupDay.SUN_WED]: ['4:00 PM - 6:00 PM', '6:00 PM - 8:00 PM'],
      [GroupDay.MON_THU]: ['4:00 PM - 6:00 PM', '6:00 PM - 8:00 PM'],
    }
  },
  [Grade.SECOND]: {
    sections: [Section.SCIENTIFIC, Section.LITERARY],
    groupDays: {
      [GroupDay.SAT_TUE]: ['4:00 PM - 6:00 PM', '6:00 PM - 8:00 PM'],
      [GroupDay.SUN_WED]: ['4:00 PM - 6:00 PM', '6:00 PM - 8:00 PM'],
      [GroupDay.MON_THU]: ['4:00 PM - 6:00 PM', '6:00 PM - 8:00 PM'],
      [GroupDay.SAT_TUE_THU]: ['2:00 PM - 4:00 PM'],
    }
  },
  [Grade.THIRD]: {
    sections: [Section.SCIENTIFIC, Section.LITERARY],
    groupDays: {
      [GroupDay.SAT_TUE]: ['4:00 PM - 6:00 PM', '6:00 PM - 8:00 PM'],
      [GroupDay.SUN_WED]: ['4:00 PM - 6:00 PM', '6:00 PM - 8:00 PM'],
      [GroupDay.MON_THU]: ['4:00 PM - 6:00 PM', '6:00 PM - 8:00 PM'],
      [GroupDay.SAT_TUE_THU]: ['2:00 PM - 4:00 PM'],
    }
  }
};

async function generateStudents() {
  console.log('🚀 Starting student generation...');

  try {
    // Clear existing students (optional - comment out if you want to keep existing data)
    // await prisma.student.deleteMany();
    // console.log('🗑️  Cleared existing students');

    const students = [];
    let studentCounter = 1;

    // Generate students for each grade
    for (const grade of [Grade.FIRST, Grade.SECOND, Grade.THIRD]) {
      const gradeConfig = scheduleData[grade];
      const studentsPerGrade = 10;

      console.log(`📚 Generating ${studentsPerGrade} students for ${grade}...`);

      const sections = gradeConfig.sections;
      const studentsPerSection = studentsPerGrade / sections.length;

      for (const section of sections) {
        for (let i = 0; i < studentsPerSection; i++) {
          const groupDays = Object.keys(gradeConfig.groupDays) as GroupDay[];
          const randomGroupDay = groupDays[Math.floor(Math.random() * groupDays.length)];
          const availableTimes = gradeConfig.groupDays[randomGroupDay as keyof typeof gradeConfig.groupDays];
          const randomTime = availableTimes[Math.floor(Math.random() * availableTimes.length)];

          const student = {
            name: getRandomName(),
            phone: generatePhone(),
            parentPhone: generatePhone(),
            grade,
            section,
            groupDay: randomGroupDay,
            groupTime: randomTime,
            enrollmentDate: generateEnrollmentDate(),
            studentId: `std${studentCounter.toString().padStart(5, '0')}`,
            paymentPref: Math.random() > 0.5 ? PaymentPref.PREPAID : PaymentPref.POSTPAID,
          };

          students.push(student);
          studentCounter++;
        }
      }
    }

    // Insert students into database
    console.log('💾 Inserting students into database...');
    
    for (const student of students) {
      await prisma.student.create({
        data: student,
      });
    }

    console.log(`✅ Successfully generated ${students.length} students!`);
    
    // Print summary
    console.log('\n📊 Generation Summary:');
    console.log(`- First Grade: ${students.filter(s => s.grade === Grade.FIRST).length} students`);
    console.log(`- Second Grade Scientific: ${students.filter(s => s.grade === Grade.SECOND && s.section === Section.SCIENTIFIC).length} students`);
    console.log(`- Second Grade Literary: ${students.filter(s => s.grade === Grade.SECOND && s.section === Section.LITERARY).length} students`);
    console.log(`- Third Grade Scientific: ${students.filter(s => s.grade === Grade.THIRD && s.section === Section.SCIENTIFIC).length} students`);
    console.log(`- Third Grade Literary: ${students.filter(s => s.grade === Grade.THIRD && s.section === Section.LITERARY).length} students`);

    // Print group distribution
    console.log('\n🗓️  Group Day Distribution:');
    const groupDayCount = students.reduce((acc, student) => {
      acc[student.groupDay] = (acc[student.groupDay] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(groupDayCount).forEach(([groupDay, count]) => {
      console.log(`- ${groupDay}: ${count} students`);
    });

  } catch (error) {
    console.error('❌ Error generating students:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  generateStudents();
}

export { generateStudents };