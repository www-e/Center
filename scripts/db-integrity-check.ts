#!/usr/bin/env tsx
/**
 * Database Integrity Check Script
 * Validates database consistency and fixes common issues
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface IntegrityIssue {
  type: string;
  description: string;
  count: number;
  fixable: boolean;
}

async function checkDatabaseIntegrity(autoFix = false) {
  try {
    console.log('🔍 Starting database integrity check...');
    
    const issues: IntegrityIssue[] = [];
    
    // Check 1: Duplicate student IDs
    const duplicateIds = await prisma.$queryRaw<{studentId: string, count: number}[]>`
      SELECT studentId, COUNT(*) as count 
      FROM Student 
      GROUP BY studentId 
      HAVING COUNT(*) > 1
    `;
    
    if (duplicateIds.length > 0) {
      const totalDuplicates = duplicateIds.reduce((sum, item) => sum + item.count - 1, 0);
      issues.push({
        type: 'DUPLICATE_IDS',
        description: 'Students with duplicate IDs',
        count: totalDuplicates,
        fixable: true
      });
    }
    
    // Check 2: Future attendance records
    const futureAttendance = await prisma.attendanceRecord.findMany({
      where: { date: { gt: new Date() } },
      select: { id: true, date: true }
    });
    
    if (futureAttendance.length > 0) {
      issues.push({
        type: 'FUTURE_ATTENDANCE',
        description: 'Attendance records with future dates',
        count: futureAttendance.length,
        fixable: false
      });
    }
    
    // Check 3: Missing payment configurations
    const requiredConfigs = [
      { grade: 'FIRST', section: 'NONE' },
      { grade: 'SECOND', section: 'SCIENTIFIC' },
      { grade: 'SECOND', section: 'LITERARY' },
      { grade: 'THIRD', section: 'SCIENTIFIC' },
      { grade: 'THIRD', section: 'LITERARY' }
    ];
    
    const existingConfigs = await prisma.paymentConfig.findMany({
      select: { grade: true, section: true }
    });
    
    const missingConfigs = requiredConfigs.filter(required => 
      !existingConfigs.some(existing => 
        existing.grade === required.grade && existing.section === required.section
      )
    );
    
    if (missingConfigs.length > 0) {
      issues.push({
        type: 'MISSING_CONFIGS',
        description: 'Missing payment configurations for grade/section combinations',
        count: missingConfigs.length,
        fixable: true
      });
    }
    
    // Check 4: Invalid payment records (future months)
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    const futurePayments = await prisma.paymentRecord.findMany({
      where: {
        OR: [
          { year: { gt: currentYear } },
          { 
            year: currentYear,
            month: { gt: currentMonth + 1 } // Allow next month
          }
        ]
      },
      select: { id: true, month: true, year: true }
    });
    
    if (futurePayments.length > 0) {
      issues.push({
        type: 'FUTURE_PAYMENTS',
        description: 'Payment records for future months (beyond next month)',
        count: futurePayments.length,
        fixable: false
      });
    }
    
    // Display results
    console.log('\n📊 Integrity Check Results:');
    
    if (issues.length === 0) {
      console.log('✅ No integrity issues found! Database is healthy.');
      return;
    }
    
    console.log(`❌ Found ${issues.length} types of issues:\n`);
    
    for (const issue of issues) {
      const fixStatus = issue.fixable ? '🔧 Fixable' : '⚠️  Manual fix required';
      console.log(`${issue.type}:`);
      console.log(`  Description: ${issue.description}`);
      console.log(`  Count: ${issue.count}`);
      console.log(`  Status: ${fixStatus}\n`);
    }
    
    // Auto-fix if requested
    if (autoFix) {
      console.log('🔧 Attempting to fix issues...\n');
      await fixIssues(issues);
    } else {
      console.log('💡 Run with --fix flag to automatically fix issues where possible');
    }
    
  } catch (error) {
    console.error('❌ Integrity check failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function fixIssues(issues: IntegrityIssue[]) {
  for (const issue of issues) {
    if (!issue.fixable) continue;
    
    console.log(`🔧 Fixing ${issue.type}...`);
    
    try {
      switch (issue.type) {
        case 'DUPLICATE_IDS':
          // Fix by adding suffix to duplicates
          const duplicates = await prisma.$queryRaw<{studentId: string}[]>`
            SELECT studentId 
            FROM Student 
            GROUP BY studentId 
            HAVING COUNT(*) > 1
          `;
          
          for (const dup of duplicates) {
            const students = await prisma.student.findMany({
              where: { studentId: dup.studentId },
              orderBy: { id: 'asc' }
            });
            
            // Keep first one, update others
            for (let i = 1; i < students.length; i++) {
              const newId = `${dup.studentId}-${i}`;
              await prisma.student.update({
                where: { id: students[i].id },
                data: { studentId: newId }
              });
            }
          }
          console.log(`✅ Fixed duplicate student IDs`);
          break;
          
        case 'MISSING_CONFIGS':
          const defaultAmounts = {
            FIRST_NONE: 200,
            SECOND_SCIENTIFIC: 250,
            SECOND_LITERARY: 230,
            THIRD_SCIENTIFIC: 300,
            THIRD_LITERARY: 280
          };
          
          const requiredConfigs = [
            { grade: 'FIRST', section: 'NONE', amount: 200 },
            { grade: 'SECOND', section: 'SCIENTIFIC', amount: 250 },
            { grade: 'SECOND', section: 'LITERARY', amount: 230 },
            { grade: 'THIRD', section: 'SCIENTIFIC', amount: 300 },
            { grade: 'THIRD', section: 'LITERARY', amount: 280 }
          ];
          
          const existing = await prisma.paymentConfig.findMany();
          
          for (const config of requiredConfigs) {
            const exists = existing.some(e => 
              e.grade === config.grade && e.section === config.section
            );
            
            if (!exists) {
              await prisma.paymentConfig.create({
                data: {
                  grade: config.grade as any,
                  section: config.section as any,
                  amount: config.amount
                }
              });
            }
          }
          console.log(`✅ Created missing payment configurations`);
          break;
      }
    } catch (error) {
      console.error(`❌ Failed to fix ${issue.type}:`, error);
    }
  }
}

// Command line usage
if (require.main === module) {
  const autoFix = process.argv.includes('--fix');
  checkDatabaseIntegrity(autoFix).catch(console.error);
}

export { checkDatabaseIntegrity };