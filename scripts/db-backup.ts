#!/usr/bin/env tsx
/**
 * Database Backup Script
 * Creates a backup of the SQLite database with timestamp
 */

import { PrismaClient } from '@prisma/client';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function createBackup() {
  try {
    console.log('🔄 Starting database backup...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = join(process.cwd(), 'backups');
    const sourceDb = join(process.cwd(), 'prisma', 'dev.db');
    const backupFile = join(backupDir, `backup-${timestamp}.db`);
    
    // Create backups directory if it doesn't exist
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }
    
    // Check if source database exists
    if (!existsSync(sourceDb)) {
      throw new Error('Source database not found');
    }
    
    // Copy database file
    copyFileSync(sourceDb, backupFile);
    
    console.log(`✅ Backup created successfully: ${backupFile}`);
    console.log(`📊 Backup size: ${(require('fs').statSync(backupFile).size / 1024).toFixed(2)} KB`);
    
    return backupFile;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  createBackup().catch(console.error);
}

export { createBackup };