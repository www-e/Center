#!/usr/bin/env tsx
/**
 * Comprehensive Payment Testing Script
 * Tests all payment scenarios and edge cases based on actual schema and logic
 */

import { PrismaClient, Grade, Section } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to determine if student was enrolled for a specific month
function wasStudentEnrolled(enrollmentDate: Date, targetMonth: number, targetYear: number): boolean {
  const enrollmentMonth = enrollmentDate.getMonth() + 1;
  const enrollmentYear = enrollmentDate.getFullYear();
  
  if (targetYear > enrollmentYear) return true;
  if (targetYear === enrollmentYear && targetMonth >= enrollmentMonth) return true;
  
  return false;
}

// Helper to get payment amount for a student based on grade/section
function getPaymentAmount(grade: Grade, section: Section): number {
  const amounts = {
    [Grade.FIRST]: 200,
    [`${Grade.SECOND}_${Section.SCIENTIFIC}`]: 250,
    [`${Grade.SECOND}_${Section.LITERARY}`]: 230,
    [`${Grade.THIRD}_${Section.SCIENTIFIC}`]: 300,
    [`${Grade.THIRD}_${Section.LITERARY}`]: 280,
  };

  if (grade === Grade.FIRST) {
    return amounts[Grade.FIRST];
  }
  
  const key = `${grade}_${section}` as keyof typeof amounts;
  return amounts[key] || 200;
}

// Helper to create payment record with proper error handling
async function createPaymentRecord(
  studentId: string, 
  month: number, 
  year: number, 
  isPaid: boolean = false,
  paidAt?: Date
) {
  try {
    return await prisma.paymentRecord.create({
      data: {
        studentId,
        month,
        year,
        isPaid,
        paidAt,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Unique constraint violation - payment record already exists
      console.log(`⚠️  Payment record already exists for student ${studentId} for ${month}/${year}`);
      return null;
    }
    throw error;
  }
}

// Helper to create receipt
async function createReceipt(
  paymentRecordId: string,
  studentName: string,
  studentReadableId: string,
  amount: number,
  month: number,
  year: number
) {
  try {
    return await prisma.receipt.create({
      data: {
        paymentRecordId,
        studentName,
        studentReadableId,
        amount,
        month,
        year,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log(`⚠️  Receipt already exists for payment record ${paymentRecordId}`);
      return null;
    }
    throw error;
  }
}

async function testComprehensivePaymentScenarios() {
  console.log('💰 Starting comprehensive payment scenario testing...');

  try {
    // Get all students
    const students = await prisma.student.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log(`👥 Found ${students.length} students for payment testing`);

    if (students.length === 0) {
      console.log('⚠️  No students found. Run generate-students.ts first.');
      return;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Test months: previous 3 months, current month, next month
    const testMonths = [];
    for (let i = -3; i <= 1; i++) {
      let month = currentMonth + i;
      let year = currentYear;
      
      if (month <= 0) {
        month += 12;
        year--;
      } else if (month > 12) {
        month -= 12;
        year++;
      }
      
      testMonths.push({ month, year });
    }

    console.log('📅 Testing payment scenarios for months:', testMonths.map(m => `${m.month}/${m.year}`).join(', '));

    // Clear existing payment data for test months
    for (const testMonth of testMonths) {
      await prisma.receipt.deleteMany({
        where: {
          month: testMonth.month,
          year: testMonth.year,
        },
      });
      
      await prisma.paymentRecord.deleteMany({
        where: {
          month: testMonth.month,
          year: testMonth.year,
        },
      });
    }
    console.log('🗑️  Cleared existing payment data for test months');

    // Ensure payment configurations exist
    console.log('\n⚙️  Setting up payment configurations...');
    const paymentConfigs = [
      { grade: Grade.FIRST, section: Section.NONE, amount: 200 },
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
        update: { 
          amount: config.amount,
          isActive: true,
        },
        create: {
          grade: config.grade,
          section: config.section,
          amount: config.amount,
          isActive: true,
        },
      });
    }
    console.log('✅ Payment configurations created/updated');

    let totalPayments = 0;
    let totalRevenue = 0;
    let paidPayments = 0;
    let unpaidPayments = 0;

    // Group students by enrollment patterns for realistic testing
    const studentsByEnrollment = students.reduce((acc, student) => {
      const enrollmentMonth = student.enrollmentDate.getMonth() + 1;
      const enrollmentYear = student.enrollmentDate.getFullYear();
      
      if (enrollmentYear < currentYear || (enrollmentYear === currentYear && enrollmentMonth <= currentMonth - 3)) {
        acc.longTerm.push(student);
      } else if (enrollmentYear === currentYear && enrollmentMonth <= currentMonth) {
        acc.recent.push(student);
      } else {
        acc.future.push(student);
      }
      
      return acc;
    }, { longTerm: [] as typeof students, recent: [] as typeof students, future: [] as typeof students });

    console.log('\n📊 Student Enrollment Distribution:');
    console.log(`- Long-term students (enrolled 3+ months ago): ${studentsByEnrollment.longTerm.length}`);
    console.log(`- Recent students (enrolled within 3 months): ${studentsByEnrollment.recent.length}`);
    console.log(`- Future enrollment students: ${studentsByEnrollment.future.length}`);

    // Scenario 1: Excellent Payment History (20% of long-term students)
    console.log('\n📊 Scenario 1: Excellent Payment History');
    const excellentPayers = studentsByEnrollment.longTerm.slice(0, Math.floor(studentsByEnrollment.longTerm.length * 0.2));
    
    for (const student of excellentPayers) {
      const amount = getPaymentAmount(student.grade, student.section);
      
      for (const testMonth of testMonths) {
        if (wasStudentEnrolled(student.enrollmentDate, testMonth.month, testMonth.year)) {
          // Always pay on time (1st-5th of month)
          const paymentDate = new Date(testMonth.year, testMonth.month - 1, Math.floor(Math.random() * 5) + 1);
          
          const payment = await createPaymentRecord(student.id, testMonth.month, testMonth.year, true, paymentDate);
          if (payment) {
            totalPayments++;
            paidPayments++;
            totalRevenue += amount;
            
            await createReceipt(
              payment.id,
              student.name,
              student.studentId,
              amount,
              testMonth.month,
              testMonth.year
            );
          }
        }
      }
    }
    console.log(`✅ Created excellent payment history for ${excellentPayers.length} students`);

    // Scenario 2: Good Payment History (40% of long-term students, occasional late payments)
    console.log('\n📊 Scenario 2: Good Payment History');
    const goodPayers = studentsByEnrollment.longTerm.slice(
      Math.floor(studentsByEnrollment.longTerm.length * 0.2),
      Math.floor(studentsByEnrollment.longTerm.length * 0.6)
    );
    
    for (const student of goodPayers) {
      const amount = getPaymentAmount(student.grade, student.section);
      
      for (const testMonth of testMonths) {
        if (wasStudentEnrolled(student.enrollmentDate, testMonth.month, testMonth.year)) {
          // 90% chance of payment, sometimes late
          if (Math.random() < 0.9) {
            const paymentDate = new Date(testMonth.year, testMonth.month - 1, Math.floor(Math.random() * 20) + 1);
            
            const payment = await createPaymentRecord(student.id, testMonth.month, testMonth.year, true, paymentDate);
            if (payment) {
              totalPayments++;
              paidPayments++;
              totalRevenue += amount;
              
              await createReceipt(
                payment.id,
                student.name,
                student.studentId,
                amount,
                testMonth.month,
                testMonth.year
              );
            }
          } else {
            // Create unpaid record
            const payment = await createPaymentRecord(student.id, testMonth.month, testMonth.year, false);
            if (payment) {
              totalPayments++;
              unpaidPayments++;
            }
          }
        }
      }
    }
    console.log(`✅ Created good payment history for ${goodPayers.length} students`);

    // Scenario 3: Average Payment History (25% of long-term students)
    console.log('\n📊 Scenario 3: Average Payment History');
    const averagePayers = studentsByEnrollment.longTerm.slice(
      Math.floor(studentsByEnrollment.longTerm.length * 0.6),
      Math.floor(studentsByEnrollment.longTerm.length * 0.85)
    );
    
    for (const student of averagePayers) {
      const amount = getPaymentAmount(student.grade, student.section);
      
      for (const testMonth of testMonths) {
        if (wasStudentEnrolled(student.enrollmentDate, testMonth.month, testMonth.year)) {
          // 70% chance of payment
          if (Math.random() < 0.7) {
            const paymentDate = new Date(testMonth.year, testMonth.month - 1, Math.floor(Math.random() * 25) + 1);
            
            const payment = await createPaymentRecord(student.id, testMonth.month, testMonth.year, true, paymentDate);
            if (payment) {
              totalPayments++;
              paidPayments++;
              totalRevenue += amount;
              
              await createReceipt(
                payment.id,
                student.name,
                student.studentId,
                amount,
                testMonth.month,
                testMonth.year
              );
            }
          } else {
            // Create unpaid record
            const payment = await createPaymentRecord(student.id, testMonth.month, testMonth.year, false);
            if (payment) {
              totalPayments++;
              unpaidPayments++;
            }
          }
        }
      }
    }
    console.log(`✅ Created average payment history for ${averagePayers.length} students`);

    // Scenario 4: Poor Payment History (15% of long-term students)
    console.log('\n📊 Scenario 4: Poor Payment History');
    const poorPayers = studentsByEnrollment.longTerm.slice(Math.floor(studentsByEnrollment.longTerm.length * 0.85));
    
    for (const student of poorPayers) {
      const amount = getPaymentAmount(student.grade, student.section);
      
      for (const testMonth of testMonths) {
        if (wasStudentEnrolled(student.enrollmentDate, testMonth.month, testMonth.year)) {
          // 40% chance of payment
          if (Math.random() < 0.4) {
            const paymentDate = new Date(testMonth.year, testMonth.month - 1, Math.floor(Math.random() * 28) + 1);
            
            const payment = await createPaymentRecord(student.id, testMonth.month, testMonth.year, true, paymentDate);
            if (payment) {
              totalPayments++;
              paidPayments++;
              totalRevenue += amount;
              
              await createReceipt(
                payment.id,
                student.name,
                student.studentId,
                amount,
                testMonth.month,
                testMonth.year
              );
            }
          } else {
            // Create unpaid record
            const payment = await createPaymentRecord(student.id, testMonth.month, testMonth.year, false);
            if (payment) {
              totalPayments++;
              unpaidPayments++;
            }
          }
        }
      }
    }
    console.log(`✅ Created poor payment history for ${poorPayers.length} students`);

    // Scenario 5: Recent Students Payment Patterns
    console.log('\n📊 Scenario 5: Recent Students Payment Patterns');
    for (const student of studentsByEnrollment.recent) {
      const amount = getPaymentAmount(student.grade, student.section);
      
      for (const testMonth of testMonths) {
        if (wasStudentEnrolled(student.enrollmentDate, testMonth.month, testMonth.year)) {
          // New students tend to pay more regularly initially (80% chance)
          if (Math.random() < 0.8) {
            const paymentDate = new Date(testMonth.year, testMonth.month - 1, Math.floor(Math.random() * 15) + 1);
            
            const payment = await createPaymentRecord(student.id, testMonth.month, testMonth.year, true, paymentDate);
            if (payment) {
              totalPayments++;
              paidPayments++;
              totalRevenue += amount;
              
              await createReceipt(
                payment.id,
                student.name,
                student.studentId,
                amount,
                testMonth.month,
                testMonth.year
              );
            }
          } else {
            const payment = await createPaymentRecord(student.id, testMonth.month, testMonth.year, false);
            if (payment) {
              totalPayments++;
              unpaidPayments++;
            }
          }
        }
      }
    }
    console.log(`✅ Created payment patterns for ${studentsByEnrollment.recent.length} recent students`);

    // Scenario 6: Payment Corrections and Adjustments
    console.log('\n📊 Scenario 6: Payment Corrections and Adjustments');
    const correctionStudents = students.slice(0, Math.floor(students.length * 0.1));
    
    for (const student of correctionStudents) {
      const standardAmount = getPaymentAmount(student.grade, student.section);
      
      // Create one payment with adjustment for current month
      if (wasStudentEnrolled(student.enrollmentDate, currentMonth, currentYear)) {
        const paymentDate = new Date(currentYear, currentMonth - 1, Math.floor(Math.random() * 20) + 1);
        
        const payment = await createPaymentRecord(student.id, currentMonth, currentYear, true, paymentDate);
        if (payment) {
          totalPayments++;
          paidPayments++;
          
          // Apply random adjustment (-50 to +50 EGP)
          const adjustment = Math.floor(Math.random() * 101) - 50;
          const adjustedAmount = Math.max(standardAmount + adjustment, 50); // Minimum 50 EGP
          totalRevenue += adjustedAmount;
          
          await createReceipt(
            payment.id,
            student.name,
            student.studentId,
            adjustedAmount,
            currentMonth,
            currentYear
          );
        }
      }
    }
    console.log(`✅ Created payment corrections for ${correctionStudents.length} students`);

    // Scenario 7: Advance Payments
    console.log('\n📊 Scenario 7: Advance Payments');
    const advanceStudents = excellentPayers.slice(0, Math.floor(excellentPayers.length * 0.3));
    
    for (const student of advanceStudents) {
      const amount = getPaymentAmount(student.grade, student.section);
      
      // Pay for next month in advance
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      
      if (wasStudentEnrolled(student.enrollmentDate, nextMonth, nextYear)) {
        const paymentDate = new Date(currentYear, currentMonth - 1, Math.floor(Math.random() * 10) + 20);
        
        const payment = await createPaymentRecord(student.id, nextMonth, nextYear, true, paymentDate);
        if (payment) {
          totalPayments++;
          paidPayments++;
          totalRevenue += amount;
          
          await createReceipt(
            payment.id,
            student.name,
            student.studentId,
            amount,
            nextMonth,
            nextYear
          );
        }
      }
    }
    console.log(`✅ Created advance payments for ${advanceStudents.length} students`);

    // Generate comprehensive statistics
    console.log('\n📈 Comprehensive Payment Test Results:');
    console.log(`- Total payment records created: ${totalPayments}`);
    console.log(`- Paid payments: ${paidPayments}`);
    console.log(`- Unpaid payments: ${unpaidPayments}`);
    console.log(`- Total revenue: ${totalRevenue.toLocaleString('ar-EG')} EGP`);
    console.log(`- Payment rate: ${((paidPayments / totalPayments) * 100).toFixed(1)}%`);

    // Test database constraints and edge cases
    console.log('\n🔍 Testing Database Constraints:');
    
    // Test 1: Duplicate payment prevention
    const testStudent = students[0];
    try {
      await prisma.paymentRecord.create({
        data: {
          studentId: testStudent.id,
          month: currentMonth,
          year: currentYear,
          isPaid: true,
        },
      });
      
      // Try to create duplicate
      await prisma.paymentRecord.create({
        data: {
          studentId: testStudent.id,
          month: currentMonth,
          year: currentYear,
          isPaid: false, // Different payment status
        },
      });
      console.log('❌ Duplicate payment record was allowed (this should be prevented)');
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log('✅ Duplicate payment record properly prevented by unique constraint');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 2: Foreign key constraint
    try {
      await prisma.paymentRecord.create({
        data: {
          studentId: 'non-existent-id',
          month: currentMonth,
          year: currentYear,
          isPaid: false,
        },
      });
      console.log('❌ Invalid student ID was allowed');
    } catch (error: any) {
      if (error.code === 'P2003') {
        console.log('✅ Foreign key constraint working properly');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 3: Receipt constraint
    const existingPayment = await prisma.paymentRecord.findFirst({
      where: { isPaid: true },
    });
    
    if (existingPayment) {
      try {
        await prisma.receipt.create({
          data: {
            paymentRecordId: existingPayment.id,
            studentName: 'Test Student',
            studentReadableId: 'TEST001',
            amount: 200,
            month: existingPayment.month,
            year: existingPayment.year,
          },
        });
        
        // Try to create duplicate receipt
        await prisma.receipt.create({
          data: {
            paymentRecordId: existingPayment.id,
            studentName: 'Test Student 2',
            studentReadableId: 'TEST002',
            amount: 250,
            month: existingPayment.month,
            year: existingPayment.year,
          },
        });
        console.log('❌ Duplicate receipt was allowed');
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log('✅ Duplicate receipt properly prevented by unique constraint');
        } else {
          console.log('❌ Unexpected error:', error.message);
        }
      }
    }

    // Detailed statistics
    console.log('\n📊 Detailed Payment Statistics:');
    
    // Grade-wise analysis
    const gradeStats = await prisma.paymentRecord.findMany({
      where: { isPaid: true },
      include: {
        student: { select: { grade: true, section: true } },
        receipt: { select: { amount: true } },
      },
    });

    const gradeAnalysis = gradeStats.reduce((acc, payment) => {
      const key = `${payment.student.grade}_${payment.student.section}`;
      if (!acc[key]) {
        acc[key] = { count: 0, revenue: 0 };
      }
      acc[key].count++;
      acc[key].revenue += payment.receipt?.amount || 0;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    console.log('Payment Analysis by Grade/Section:');
    Object.entries(gradeAnalysis).forEach(([key, stats]) => {
      const avgAmount = stats.count > 0 ? (stats.revenue / stats.count).toFixed(0) : 0;
      console.log(`- ${key}: ${stats.count} payments, ${stats.revenue.toLocaleString('ar-EG')} EGP (avg: ${avgAmount} EGP)`);
    });

    // Monthly distribution
    const monthlyStats = await prisma.paymentRecord.groupBy({
      by: ['month', 'year', 'isPaid'],
      _count: true,
    });

    console.log('\nMonthly Payment Distribution:');
    const monthNames = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    
    monthlyStats
      .sort((a, b) => a.year - b.year || a.month - b.month)
      .forEach(stat => {
        const status = stat.isPaid ? 'Paid' : 'Unpaid';
        const monthName = monthNames[stat.month - 1];
        console.log(`- ${monthName} ${stat.year} (${status}): ${stat._count} records`);
      });

    // Payment configuration verification
    console.log('\n💡 Payment Configuration Verification:');
    const configs = await prisma.paymentConfig.findMany({
      where: { isActive: true },
      orderBy: [{ grade: 'asc' }, { section: 'asc' }],
    });
    
    console.log(`Found ${configs.length} active payment configurations:`);
    configs.forEach(config => {
      console.log(`- ${config.grade} ${config.section}: ${config.amount} EGP`);
    });

    // Enrollment-based payment eligibility test
    console.log('\n📅 Enrollment-Based Payment Eligibility Test:');
    for (const testMonth of testMonths.slice(-2)) { // Test last 2 months
      const eligibleStudents = students.filter(student => 
        wasStudentEnrolled(student.enrollmentDate, testMonth.month, testMonth.year)
      );
      
      const actualPayments = await prisma.paymentRecord.count({
        where: {
          month: testMonth.month,
          year: testMonth.year,
        },
      });
      
      console.log(`${testMonth.month}/${testMonth.year}: ${eligibleStudents.length} eligible students, ${actualPayments} payment records created`);
    }

    console.log('\n✅ Comprehensive payment scenario testing completed successfully!');

  } catch (error) {
    console.error('❌ Error in comprehensive payment testing:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  testComprehensivePaymentScenarios().catch(console.error);
}

export { testComprehensivePaymentScenarios };