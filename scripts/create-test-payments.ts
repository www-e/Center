#!/usr/bin/env tsx
/**
 * Create Test Payments Script
 * Creates some test payments and receipts so you can see the receipts page working
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTestPayments() {
  console.log("💰 Creating test payments and receipts...");

  try {
    // Get some students
    const students = await prisma.student.findMany({ take: 10 });
    
    if (students.length === 0) {
      console.log("❌ No students found. Run setup-fresh-production-data.ts first.");
      return;
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    let paymentsCreated = 0;
    let receiptsCreated = 0;

    // Create payments for current month (some students)
    for (let i = 0; i < 5; i++) {
      const student = students[i];
      
      // Get payment amount based on grade/section
      const paymentConfig = await prisma.paymentConfig.findUnique({
        where: {
          grade_section: {
            grade: student.grade,
            section: student.section
          }
        }
      });
      
      const amount = paymentConfig?.amount || 200;
      
      // Create payment record
      const paymentRecord = await prisma.paymentRecord.create({
        data: {
          studentId: student.id,
          month: currentMonth,
          year: currentYear,
          isPaid: true,
          paidAt: new Date()
        }
      });
      
      // Create receipt
      await prisma.receipt.create({
        data: {
          paymentRecordId: paymentRecord.id,
          studentName: student.name,
          studentReadableId: student.studentId,
          amount: amount,
          month: currentMonth,
          year: currentYear
        }
      });
      
      paymentsCreated++;
      receiptsCreated++;
      
      console.log(`✅ Created payment for ${student.name} - ${amount} EGP`);
    }

    // Create payments for last month (more students)
    for (let i = 5; i < 8; i++) {
      const student = students[i];
      
      // Get payment amount based on grade/section
      const paymentConfig = await prisma.paymentConfig.findUnique({
        where: {
          grade_section: {
            grade: student.grade,
            section: student.section
          }
        }
      });
      
      const amount = paymentConfig?.amount || 200;
      
      // Create payment record for last month
      const paymentRecord = await prisma.paymentRecord.create({
        data: {
          studentId: student.id,
          month: lastMonth,
          year: lastMonthYear,
          isPaid: true,
          paidAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        }
      });
      
      // Create receipt
      await prisma.receipt.create({
        data: {
          paymentRecordId: paymentRecord.id,
          studentName: student.name,
          studentReadableId: student.studentId,
          amount: amount,
          month: lastMonth,
          year: lastMonthYear
        }
      });
      
      paymentsCreated++;
      receiptsCreated++;
      
      console.log(`✅ Created payment for ${student.name} - ${amount} EGP (last month)`);
    }

    console.log(`\n📊 Summary:`);
    console.log(`- Payments created: ${paymentsCreated}`);
    console.log(`- Receipts created: ${receiptsCreated}`);
    console.log(`- Current month payments: 5`);
    console.log(`- Last month payments: 3`);
    
    console.log(`\n✅ Test payments created successfully!`);
    console.log(`💡 Now you can:`);
    console.log(`1. Visit the receipts page to see the receipts`);
    console.log(`2. Visit the payments page to see payment status`);
    console.log(`3. Use the QR scanner buttons to add more payments`);

  } catch (error) {
    console.error("❌ Failed to create test payments:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  createTestPayments().catch(console.error);
}

export { createTestPayments };