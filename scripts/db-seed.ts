#!/usr/bin/env tsx
/**
 * Database Seeding Script
 * Seeds database with test data using existing generation scripts
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Check if database is empty
    const studentCount = await prisma.student.count();
    if (studentCount > 0) {
      console.log(`⚠️  Database already contains ${studentCount} students`);
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise<string>((resolve) => {
        readline.question('Do you want to continue and add more data? (y/N): ', resolve);
      });
      
      readline.close();
      
      if (answer.toLowerCase() !== 'y') {
        console.log('❌ Seeding cancelled');
        return;
      }
    }
    
    console.log('👥 Generating students...');
    execSync('npx tsx scripts/generate-students.ts', { stdio: 'inherit' });
    
    console.log('📅 Creating comprehensive attendance scenarios...');
    execSync('npx tsx scripts/test-attendance-scenarios-comprehensive.ts', { stdio: 'inherit' });
    
    console.log('💰 Creating comprehensive payment scenarios...');
    execSync('npx tsx scripts/test-payment-scenarios-comprehensive.ts', { stdio: 'inherit' });
    
    // Final summary
    const finalCounts = await Promise.all([
      prisma.student.count(),
      prisma.attendanceRecord.count(),
      prisma.paymentRecord.count(),
      prisma.paymentConfig.count(),
      prisma.receipt.count()
    ]);
    
    console.log('🎉 Database seeding completed!');
    console.log('📊 Final Database Summary:');
    console.log(`- Students: ${finalCounts[0]}`);
    console.log(`- Attendance Records: ${finalCounts[1]}`);
    console.log(`- Payment Records: ${finalCounts[2]}`);
    console.log(`- Payment Configurations: ${finalCounts[3]}`);
    console.log(`- Receipts: ${finalCounts[4]}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedDatabase().catch(console.error);
}

export { seedDatabase };