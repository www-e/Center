// scripts/migrate-student-codes.ts
import { PrismaClient } from '@prisma/client';
import { convertLegacyCode, isLegacyFormat } from '../src/lib/student-code-utils';

const prisma = new PrismaClient();

async function migrateStudentCodes() {
  console.log('🔄 Starting student code migration...');
  
  try {
    // Find all students with legacy format codes
    const studentsWithLegacyCodes = await prisma.student.findMany({
      where: {
        studentId: {
          contains: 'std-g'
        }
      }
    });
    
    console.log(`📊 Found ${studentsWithLegacyCodes.length} students with legacy codes`);
    
    if (studentsWithLegacyCodes.length === 0) {
      console.log('✅ No legacy codes found. Migration not needed.');
      return;
    }
    
    // Convert each legacy code
    const migrations = studentsWithLegacyCodes.map(student => {
      const newCode = convertLegacyCode(student.studentId);
      return {
        id: student.id,
        oldCode: student.studentId,
        newCode: newCode,
        name: student.name
      };
    });
    
    console.log('🔄 Converting codes:');
    migrations.forEach(migration => {
      console.log(`  ${migration.name}: ${migration.oldCode} → ${migration.newCode}`);
    });
    
    // Check for potential conflicts
    const newCodes = migrations.map(m => m.newCode);
    const duplicates = newCodes.filter((code, index) => newCodes.indexOf(code) !== index);
    
    if (duplicates.length > 0) {
      console.error('❌ Error: Duplicate codes detected after conversion:', duplicates);
      console.error('Please resolve conflicts manually before running migration.');
      return;
    }
    
    // Check if any new codes already exist in database
    const existingCodes = await prisma.student.findMany({
      where: {
        studentId: {
          in: newCodes
        }
      },
      select: {
        studentId: true
      }
    });
    
    if (existingCodes.length > 0) {
      console.error('❌ Error: Some converted codes already exist in database:');
      existingCodes.forEach(existing => {
        console.error(`  ${existing.studentId}`);
      });
      console.error('Please resolve conflicts manually before running migration.');
      return;
    }
    
    // Perform the migration in a transaction
    await prisma.$transaction(async (tx) => {
      for (const migration of migrations) {
        await tx.student.update({
          where: { id: migration.id },
          data: { studentId: migration.newCode }
        });
      }
    });
    
    console.log('✅ Migration completed successfully!');
    console.log(`📊 Updated ${migrations.length} student codes`);
    
    // Verify migration
    const remainingLegacyCodes = await prisma.student.count({
      where: {
        studentId: {
          contains: 'std-g'
        }
      }
    });
    
    if (remainingLegacyCodes === 0) {
      console.log('✅ Verification passed: No legacy codes remaining');
    } else {
      console.warn(`⚠️  Warning: ${remainingLegacyCodes} legacy codes still remain`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateStudentCodes()
    .then(() => {
      console.log('🎉 Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateStudentCodes };