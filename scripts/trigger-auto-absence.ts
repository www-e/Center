#!/usr/bin/env tsx
/**
 * Manual Auto-Absence Trigger Script
 * Manually triggers the auto-absence system for testing
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function triggerAutoAbsence() {
  console.log("🤖 Manually triggering auto-absence system...");

  try {
    // Import the auto-absence function
    const { processAutoAbsences } = await import('../src/lib/auto-absence');
    
    console.log("🕐 Current time:", new Date().toLocaleString('ar-EG'));
    
    // Run the auto-absence process
    const result = await processAutoAbsences();
    
    console.log("\n📊 Auto-Absence Results:");
    console.log(`- Students processed: ${result.processed}`);
    console.log(`- Students marked absent: ${result.marked}`);
    console.log(`- Errors: ${result.errors.length}`);
    
    if (result.errors.length > 0) {
      console.log("\n❌ Errors encountered:");
      result.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (result.marked > 0) {
      console.log(`\n✅ Successfully marked ${result.marked} students as absent`);
      
      // Show the newly marked absent students
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const newAbsences = await prisma.attendanceRecord.findMany({
        where: {
          status: 'ABSENT_AUTO',
          date: todayStart,
          markedAt: {
            gte: new Date(Date.now() - 60000) // Last minute
          }
        },
        include: {
          student: {
            select: {
              name: true,
              studentId: true,
              groupTime: true
            }
          }
        }
      });
      
      if (newAbsences.length > 0) {
        console.log("\n🤖 Newly marked absent students:");
        newAbsences.forEach((record, index) => {
          console.log(`${index + 1}. ${record.student.name} (${record.student.studentId}) - ${record.student.groupTime}`);
        });
      }
    } else {
      console.log("\n💡 No students were marked absent. This could mean:");
      console.log("  - No students have sessions today");
      console.log("  - All students are already marked (present or absent)");
      console.log("  - Current time is still within grace period for all sessions");
    }

  } catch (error) {
    console.error("❌ Auto-absence trigger failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  triggerAutoAbsence().catch(console.error);
}

export { triggerAutoAbsence };