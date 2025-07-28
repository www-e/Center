// scripts/test-payment-scenarios.ts
import { PrismaClient, Grade, Section } from '@prisma/client';

const prisma = new PrismaClient();

async function testPaymentScenarios() {
  console.log('💰 Starting payment scenario testing...');

  try {
    // Get all students
    const students = await prisma.student.findMany();
    console.log(`👥 Found ${students.length} students for payment testing`);

    if (students.length === 0) {
      console.log('⚠️  No students found. Run generate-students.ts first.');
      return;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Clear existing payments and receipts for testing
    await prisma.receipt.deleteMany();
    await prisma.payment.deleteMany();
    console.log('🗑️  Cleared existing payment data for testing');

    // Create payment configurations
    console.log('\n⚙️  Setting up payment configurations...');
    
    const paymentConfigs = [
      { grade: Grade.FIRST, section: null, amount: 200 },
      { grade: Grade.SECOND, section: Section.SCIENTIFIC, amount: 250 },
      { grade: Grade.SECOND, section: Section.LITERARY, amount: 230 },
      { grade: Grade.THIRD, section: Section.SCIENTIFIC, amount: 300 },
      { grade: Grade.THIRD, section: Section.LITERARY, amount: 280 },
    ];

    for (const config of paymentConfigs) {
      await prisma.paymentConfig.upsert({
        where: {
          grade_section: {
            grade: config.grade,
            section: config.section,
          },
        },
        update: { amount: config.amount },
        create: config,
      });
    }
    console.log('✅ Payment configurations created');

    let totalPayments = 0;
    let totalRevenue = 0;

    // Scenario 1: Current month payments (80% of students)
    console.log('\n📊 Scenario 1: Current Month Payments');
    const currentMonthPayers = students.slice(0, Math.floor(students.length * 0.8));
    
    for (const student of currentMonthPayers) {
      // Find payment amount for this student
      const config = paymentConfigs.find(c => 
        c.grade === student.grade && c.section === student.section
      );
      const amount = config?.amount || 200;

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          studentId: student.id,
          month: currentMonth,
          year: currentYear,
          isPaid: true,
        },
      });

      // Create receipt
      await prisma.receipt.create({
        data: {
          paymentId: payment.id,
          amount,
          method: Math.random() > 0.5 ? 'QR' : 'CASH',
        },
      });

      totalPayments++;
      totalRevenue += amount;
    }
    console.log(`✅ Created ${currentMonthPayers.length} current month payments`);

    // Scenario 2: Previous month payments
    console.log('\n📊 Scenario 2: Previous Month Payments');
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    const previousMonthPayers = students.slice(0, Math.floor(students.length * 0.9));
    
    for (const student of previousMonthPayers) {
      // Only create if student was enrolled before this month
      const enrollmentDate = new Date(student.enrollmentDate);
      const targetDate = new Date(previousYear, previousMonth - 1, 1);
      
      if (enrollmentDate <= targetDate) {
        const config = paymentConfigs.find(c => 
          c.grade === student.grade && c.section === student.section
        );
        const amount = config?.amount || 200;

        const payment = await prisma.payment.create({
          data: {
            studentId: student.id,
            month: previousMonth,
            year: previousYear,
            isPaid: true,
          },
        });

        await prisma.receipt.create({
          data: {
            paymentId: payment.id,
            amount,
            method: Math.random() > 0.3 ? 'QR' : 'CASH',
          },
        });

        totalPayments++;
        totalRevenue += amount;
      }
    }
    console.log(`✅ Created previous month payments for eligible students`);

    // Scenario 3: Overdue payments (unpaid records)
    console.log('\n📊 Scenario 3: Overdue Payments');
    const overdueStudents = students.slice(Math.floor(students.length * 0.8));
    
    for (const student of overdueStudents) {
      // Create unpaid payment records for current month
      await prisma.payment.create({
        data: {
          studentId: student.id,
          month: currentMonth,
          year: currentYear,
          isPaid: false,
        },
      });

      // Some students also have overdue from previous month
      if (Math.random() > 0.5) {
        const enrollmentDate = new Date(student.enrollmentDate);
        const targetDate = new Date(previousYear, previousMonth - 1, 1);
        
        if (enrollmentDate <= targetDate) {
          await prisma.payment.create({
            data: {
              studentId: student.id,
              month: previousMonth,
              year: previousYear,
              isPaid: false,
            },
          });
        }
      }
    }
    console.log(`✅ Created overdue payment records for ${overdueStudents.length} students`);

    // Scenario 4: Partial payments and corrections
    console.log('\n📊 Scenario 4: Payment Corrections');
    const correctionStudents = students.slice(0, 5);
    
    for (const student of correctionStudents) {
      const config = paymentConfigs.find(c => 
        c.grade === student.grade && c.section === student.section
      );
      const standardAmount = config?.amount || 200;

      // Create a payment with different amount (discount/correction)
      const payment = await prisma.payment.create({
        data: {
          studentId: student.id,
          month: currentMonth,
          year: currentYear,
          isPaid: true,
        },
      });

      // Create receipt with adjusted amount
      const adjustedAmount = standardAmount - 50; // 50 EGP discount
      await prisma.receipt.create({
        data: {
          paymentId: payment.id,
          amount: adjustedAmount,
          method: 'CASH',
        },
      });

      totalPayments++;
      totalRevenue += adjustedAmount;
    }
    console.log(`✅ Created payment corrections for ${correctionStudents.length} students`);

    // Scenario 5: Future month payments (advance payments)
    console.log('\n📊 Scenario 5: Advance Payments');
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    
    const advanceStudents = students.slice(0, 10);
    
    for (const student of advanceStudents) {
      const config = paymentConfigs.find(c => 
        c.grade === student.grade && c.section === student.section
      );
      const amount = config?.amount || 200;

      const payment = await prisma.payment.create({
        data: {
          studentId: student.id,
          month: nextMonth,
          year: nextYear,
          isPaid: true,
        },
      });

      await prisma.receipt.create({
        data: {
          paymentId: payment.id,
          amount,
          method: 'QR',
        },
      });

      totalPayments++;
      totalRevenue += amount;
    }
    console.log(`✅ Created advance payments for ${advanceStudents.length} students`);

    // Generate comprehensive statistics
    console.log('\n📈 Payment Test Results Summary:');
    console.log(`- Total payments created: ${totalPayments}`);
    console.log(`- Total revenue: ${totalRevenue.toLocaleString('ar-EG')} EGP`);

    // Payment method distribution
    const methodStats = await prisma.receipt.groupBy({
      by: ['method'],
      _count: true,
      _sum: { amount: true },
    });

    console.log('\n💳 Payment Method Distribution:');
    methodStats.forEach(stat => {
      console.log(`- ${stat.method}: ${stat._count} payments, ${stat._sum.amount?.toLocaleString('ar-EG')} EGP`);
    });

    // Grade-wise payment analysis
    console.log('\n📚 Grade-wise Payment Analysis:');
    const gradeStats = await prisma.payment.findMany({
      where: { isPaid: true },
      include: {
        student: { select: { grade: true, section: true } },
        receipt: { select: { amount: true } },
      },
    });

    const gradeAnalysis = gradeStats.reduce((acc, payment) => {
      const key = `${payment.student.grade}${payment.student.section ? `_${payment.student.section}` : ''}`;
      if (!acc[key]) {
        acc[key] = { count: 0, revenue: 0 };
      }
      acc[key].count++;
      acc[key].revenue += payment.receipt?.amount || 0;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    Object.entries(gradeAnalysis).forEach(([key, stats]) => {
      console.log(`- ${key}: ${stats.count} payments, ${stats.revenue.toLocaleString('ar-EG')} EGP`);
    });

    // Monthly payment distribution
    console.log('\n📅 Monthly Payment Distribution:');
    const monthlyStats = await prisma.payment.groupBy({
      by: ['month', 'year', 'isPaid'],
      _count: true,
    });

    monthlyStats.forEach(stat => {
      const status = stat.isPaid ? 'Paid' : 'Unpaid';
      console.log(`- ${stat.month}/${stat.year} (${status}): ${stat._count} payments`);
    });

    // Test edge cases
    console.log('\n🔍 Testing Payment Edge Cases:');
    
    // Test duplicate payment prevention
    const testStudent = students[0];
    try {
      await prisma.payment.create({
        data: {
          studentId: testStudent.id,
          month: currentMonth,
          year: currentYear,
          isPaid: true,
        },
      });
      console.log('❌ Duplicate payment was allowed (this should be prevented)');
    } catch (error) {
      console.log('✅ Duplicate payment properly prevented');
    }

    // Test payment amount validation
    console.log('\n💡 Payment Configuration Test:');
    const configTest = await prisma.paymentConfig.findMany();
    console.log(`- Found ${configTest.length} payment configurations`);
    configTest.forEach(config => {
      console.log(`  ${config.grade}${config.section ? ` ${config.section}` : ''}: ${config.amount} EGP`);
    });

    console.log('\n✅ Payment scenario testing completed successfully!');

  } catch (error) {
    console.error('❌ Error in payment testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  testPaymentScenarios();
}

export { testPaymentScenarios };