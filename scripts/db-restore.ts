#!/usr/bin/env tsx
/**
 * Database Restore Script
 * Restores database from a backup file
 */

import { PrismaClient } from '@prisma/client';
import { copyFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function restoreFromBackup(backupFile?: string) {
  try {
    console.log('🔄 Starting database restore...');
    
    const backupDir = join(process.cwd(), 'backups');
    const targetDb = join(process.cwd(), 'prisma', 'dev.db');
    
    let sourceFile: string;
    
    if (backupFile) {
      sourceFile = backupFile;
    } else {
      // Find the latest backup
      if (!existsSync(backupDir)) {
        throw new Error('No backups directory found');
      }
      
      const backups = readdirSync(backupDir)
        .filter(file => file.startsWith('backup-') && file.endsWith('.db'))
        .sort()
        .reverse();
      
      if (backups.length === 0) {
        throw new Error('No backup files found');
      }
      
      sourceFile = join(backupDir, backups[0]);
      console.log(`📁 Using latest backup: ${backups[0]}`);
    }
    
    // Check if backup file exists
    if (!existsSync(sourceFile)) {
      throw new Error(`Backup file not found: ${sourceFile}`);
    }
    
    // Create backup of current database before restore
    if (existsSync(targetDb)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const currentBackup = join(backupDir, `pre-restore-${timestamp}.db`);
      copyFileSync(targetDb, currentBackup);
      console.log(`💾 Current database backed up to: ${currentBackup}`);
    }
    
    // Restore from backup
    copyFileSync(sourceFile, targetDb);
    
    console.log(`✅ Database restored successfully from: ${sourceFile}`);
    console.log(`📊 Restored database size: ${(require('fs').statSync(targetDb).size / 1024).toFixed(2)} KB`);
    
    return targetDb;
  } catch (error) {
    console.error('❌ Restore failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Command line usage
if (require.main === module) {
  const backupFile = process.argv[2];
  restoreFromBackup(backupFile).catch(console.error);
}

export { restoreFromBackup };