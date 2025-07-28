#!/usr/bin/env tsx
/**
 * Database Manager - Master Script
 * Provides a unified interface for all database operations
 */

import { execSync } from 'child_process';

const commands = {
  backup: {
    description: 'Create a backup of the database',
    script: 'npx tsx scripts/db-backup.ts'
  },
  restore: {
    description: 'Restore database from backup (latest or specify file)',
    script: 'npx tsx scripts/db-restore.ts',
    usage: 'restore [backup-file]'
  },
  reset: {
    description: 'Reset database to empty state (creates backup first)',
    script: 'npx tsx scripts/db-reset.ts',
    usage: 'reset [--no-backup]'
  },
  seed: {
    description: 'Seed database with test data',
    script: 'npx tsx scripts/db-seed.ts'
  },
  test: {
    description: 'Run all tests and generate report',
    script: 'npx tsx scripts/run-all-tests.ts'
  },
  check: {
    description: 'Check database integrity',
    script: 'npx tsx scripts/db-integrity-check.ts',
    usage: 'check [--fix]'
  },
  'full-reset': {
    description: 'Complete reset: backup → reset → seed → test',
    script: 'full-reset'
  }
};

function showHelp() {
  console.log('🗄️  Database Manager\n');
  console.log('Available commands:\n');
  
  for (const [cmd, info] of Object.entries(commands)) {
    console.log(`  ${cmd.padEnd(12)} - ${info.description}`);
    if (info.usage) {
      console.log(`  ${' '.repeat(12)}   Usage: ${info.usage}`);
    }
  }
  
  console.log('\nExamples:');
  console.log('  npm run db backup');
  console.log('  npm run db restore');
  console.log('  npm run db reset --no-backup');
  console.log('  npm run db seed');
  console.log('  npm run db check --fix');
  console.log('  npm run db full-reset');
}

async function runCommand(command: string, args: string[]) {
  const cmd = commands[command as keyof typeof commands];
  
  if (!cmd) {
    console.error(`❌ Unknown command: ${command}`);
    showHelp();
    process.exit(1);
  }
  
  try {
    if (command === 'full-reset') {
      console.log('🔄 Starting full database reset...\n');
      
      console.log('1️⃣ Creating backup...');
      execSync('npx tsx scripts/db-backup.ts', { stdio: 'inherit' });
      
      console.log('\n2️⃣ Resetting database...');
      execSync('npx tsx scripts/db-reset.ts --no-backup', { stdio: 'inherit' });
      
      console.log('\n3️⃣ Seeding with test data...');
      execSync('npx tsx scripts/db-seed.ts', { stdio: 'inherit' });
      
      console.log('\n4️⃣ Running tests...');
      execSync('npx tsx scripts/run-all-tests.ts', { stdio: 'inherit' });
      
      console.log('\n✅ Full reset completed successfully!');
    } else {
      const fullCommand = `${cmd.script} ${args.join(' ')}`.trim();
      execSync(fullCommand, { stdio: 'inherit' });
    }
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  const [command, ...args] = process.argv.slice(2);
  
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    process.exit(0);
  }
  
  runCommand(command, args);
}