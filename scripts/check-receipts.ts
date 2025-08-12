#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkReceipts() {
  const receipts = await prisma.receipt.count();
  const payments = await prisma.paymentRecord.count();
  console.log('📊 Database Status:');
  console.log('- Receipts:', receipts);
  console.log('- Payment records:', payments);
  
  if (receipts === 0) {
    console.log('❌ No receipts found - this is why receipts page is empty');
  } else {
    console.log('✅ Receipts exist');
  }
  
  await prisma.$disconnect();
}

checkReceipts();