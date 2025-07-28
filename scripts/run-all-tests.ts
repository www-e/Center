#!/usr/bin/env tsx
/**
 * Test Runner Script
 * Runs all tests and generates a comprehensive report
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  duration: number;
  output: string;
  error?: string;
}

async function runTest(name: string, command: string): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    console.log(`🧪 Running ${name}...`);
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    const duration = Date.now() - startTime;
    
    console.log(`✅ ${name} - PASSED (${duration}ms)`);
    return {
      name,
      status: 'PASS',
      duration,
      output
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.log(`❌ ${name} - FAILED (${duration}ms)`);
    
    return {
      name,
      status: 'FAIL',
      duration,
      output: error.stdout || '',
      error: error.stderr || error.message
    };
  }
}

async function runAllTests() {
  try {
    console.log('🚀 Starting comprehensive test suite...');
    const startTime = Date.now();
    
    const tests = [
      {
        name: 'Student Generation',
        command: 'npx tsx scripts/generate-students.ts'
      },
      {
        name: 'Comprehensive Attendance Scenarios',
        command: 'npx tsx scripts/test-attendance-scenarios-comprehensive.ts'
      },
      {
        name: 'Comprehensive Payment Scenarios',
        command: 'npx tsx scripts/test-payment-scenarios-comprehensive.ts'
      }
    ];
    
    const results: TestResult[] = [];
    
    for (const test of tests) {
      const result = await runTest(test.name, test.command);
      results.push(result);
    }
    
    // Database integrity check
    console.log('🔍 Running database integrity check...');
    const integrityResult = await checkDatabaseIntegrity();
    results.push(integrityResult);
    
    const totalDuration = Date.now() - startTime;
    const passedTests = results.filter(r => r.status === 'PASS').length;
    const failedTests = results.filter(r => r.status === 'FAIL').length;
    
    // Generate report
    const report = generateReport(results, totalDuration, passedTests, failedTests);
    
    // Save report to file
    const reportPath = join(process.cwd(), 'test-reports', `test-report-${new Date().toISOString().replace(/[:.]/g, '-')}.md`);
    require('fs').mkdirSync(join(process.cwd(), 'test-reports'), { recursive: true });
    writeFileSync(reportPath, report);
    
    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⏱️  Total Duration: ${totalDuration}ms`);
    console.log(`📄 Report saved to: ${reportPath}`);
    
    if (failedTests > 0) {
      console.log('\n❌ Some tests failed. Check the report for details.');
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed!');
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function checkDatabaseIntegrity(): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const checks = [];
    
    // Check for orphaned records
    const orphanedAttendance = await prisma.attendance.count({
      where: { student: null }
    });
    
    const orphanedPayments = await prisma.payment.count({
      where: { student: null }
    });
    
    // Check for duplicate student codes
    const duplicateCodes = await prisma.$queryRaw<{count: number}[]>`
      SELECT COUNT(*) as count FROM (
        SELECT studentCode FROM Student 
        GROUP BY studentCode 
        HAVING COUNT(*) > 1
      )
    `;
    
    // Check payment configurations
    const paymentConfigs = await prisma.paymentConfiguration.count();
    
    checks.push(`Orphaned attendance records: ${orphanedAttendance}`);
    checks.push(`Orphaned payment records: ${orphanedPayments}`);
    checks.push(`Duplicate student codes: ${duplicateCodes[0]?.count || 0}`);
    checks.push(`Payment configurations: ${paymentConfigs}`);
    
    const hasIssues = orphanedAttendance > 0 || orphanedPayments > 0 || (duplicateCodes[0]?.count || 0) > 0;
    
    return {
      name: 'Database Integrity Check',
      status: hasIssues ? 'FAIL' : 'PASS',
      duration: Date.now() - startTime,
      output: checks.join('\n'),
      error: hasIssues ? 'Database integrity issues found' : undefined
    };
    
  } catch (error: any) {
    return {
      name: 'Database Integrity Check',
      status: 'FAIL',
      duration: Date.now() - startTime,
      output: '',
      error: error.message
    };
  }
}

function generateReport(results: TestResult[], totalDuration: number, passed: number, failed: number): string {
  const timestamp = new Date().toISOString();
  
  let report = `# Test Report\n\n`;
  report += `**Generated:** ${timestamp}\n`;
  report += `**Total Duration:** ${totalDuration}ms\n`;
  report += `**Tests Passed:** ${passed}\n`;
  report += `**Tests Failed:** ${failed}\n\n`;
  
  report += `## Test Results\n\n`;
  
  for (const result of results) {
    const status = result.status === 'PASS' ? '✅' : '❌';
    report += `### ${status} ${result.name}\n`;
    report += `**Status:** ${result.status}\n`;
    report += `**Duration:** ${result.duration}ms\n\n`;
    
    if (result.output) {
      report += `**Output:**\n\`\`\`\n${result.output}\n\`\`\`\n\n`;
    }
    
    if (result.error) {
      report += `**Error:**\n\`\`\`\n${result.error}\n\`\`\`\n\n`;
    }
  }
  
  return report;
}

if (require.main === module) {
  runAllTests().catch(console.error);
}

export { runAllTests };