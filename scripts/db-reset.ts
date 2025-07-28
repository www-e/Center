#!/usr/bin/env tsx
/**
 * Database Reset Script
 * Clears all data and resets database to initial state
 */

import { PrismaClient } from '@prisma/client';
import { createBackup } from './db-backup';

const prisma = new PrismaClient();

async function resetDatabase(createBackupFirst = true) {
  try {
    console.log('🔄 Starting database reset...');
    
    // Create backup before reset
    if (createBackupFirst) {
      console.log('📦 Creating backup before reset...');
      await createBackup();
    }
    
    console.log('🗑️  Clearing all data...');
    
    // Delete in correct order to avoid foreign key constraints
    await prisma.receipt.deleteMany();
    await prisma.attendanceRecord.deleteMany();
    await prisma.paymentRecord.deleteMany();
    await prisma.paymentConfig.deleteMany();
    await prisma.student.deleteMany();
    await prisma.adminSettings.deleteMany();
    
    console.log('✅ All data cleared successfully');
    
    console.log('🔄 Database cleared (using CUIDs, no auto-increment to reset)');
    
    // Verify database is empty
    const counts = await Promise.all([
      prisma.student.count(),
      prisma.attendanceRecord.count(),
      prisma.paymentRecord.count(),
      prisma.paymentConfig.count(),
      prisma.receipt.count()
    ]);
    
    console.log('📊 Database Reset Summary:');
    console.log(`- Students: ${counts[0]}`);
    console.log(`- Attendance: ${counts[1]}`);
    console.log(`- Payments: ${counts[2]}`);
    console.log(`- Payment Configs: ${counts[3]}`);
    console.log(`- Receipts: ${counts[4]}`);
    
    if (counts.every(count => count === 0)) {
      console.log('✅ Database successfully reset to initial state');
    } else {
      console.log('⚠️  Warning: Some data may still exist');
    }
    
  } catch (error) {
    console.error('❌ Reset failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Command line usage
if (require.main === module) {
  const skipBackup = process.argv.includes('--no-backup');
  resetDatabase(!skipBackup).catch(console.error);
}

export { resetDatabase };