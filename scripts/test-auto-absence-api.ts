#!/usr/bin/env tsx
/**
 * Auto-Absence API Testing Script
 * Tests all auto-absence related API endpoints
 */

async function testAutoAbsenceAPI() {
  console.log("🌐 Testing auto-absence API endpoints...");

  const baseUrl = 'http://localhost:3000';

  try {
    // Test 1: Get auto-absence stats
    console.log("\n📊 Testing auto-absence stats endpoint...");
    
    const statsResponse = await fetch(`${baseUrl}/api/admin/auto-absence/stats`);
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log("✅ Stats endpoint working:");
      console.log(`- Today marked: ${statsData.data.todayMarked}`);
      console.log(`- Week marked: ${statsData.data.weekMarked}`);
      console.log(`- Month marked: ${statsData.data.monthMarked}`);
      console.log(`- Overrides: ${statsData.data.overrides}`);
    } else {
      console.log(`❌ Stats endpoint failed: ${statsResponse.status}`);
    }

    // Test 2: Update grace period settings
    console.log("\n⚙️  Testing grace period settings endpoint...");
    
    const settingsResponse = await fetch(`${baseUrl}/api/admin/auto-absence/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gracePeriod: 10 })
    });

    if (settingsResponse.ok) {
      const settingsData = await settingsResponse.json();
      console.log("✅ Settings endpoint working:");
      console.log(`- Message: ${settingsData.message}`);
    } else {
      console.log(`❌ Settings endpoint failed: ${settingsResponse.status}`);
    }

    // Test 3: Manual auto-absence run
    console.log("\n🤖 Testing manual auto-absence run endpoint...");
    
    const runResponse = await fetch(`${baseUrl}/api/admin/auto-absence/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (runResponse.ok) {
      const runData = await runResponse.json();
      console.log("✅ Manual run endpoint working:");
      console.log(`- Message: ${runData.message}`);
      console.log(`- Processed: ${runData.data.processed}`);
      console.log(`- Marked: ${runData.data.marked}`);
      console.log(`- Errors: ${runData.data.errors.length}`);
    } else {
      console.log(`❌ Manual run endpoint failed: ${runResponse.status}`);
    }

    // Test 4: Invalid grace period (should fail)
    console.log("\n❌ Testing invalid grace period (should fail)...");
    
    const invalidResponse = await fetch(`${baseUrl}/api/admin/auto-absence/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gracePeriod: 100 }) // Invalid (too high)
    });

    if (!invalidResponse.ok) {
      console.log("✅ Invalid grace period correctly rejected");
    } else {
      console.log("❌ Invalid grace period was accepted (should be rejected)");
    }

    console.log("\n✅ Auto-absence API testing completed!");

  } catch (error) {
    console.error("❌ API testing failed:", error);
    console.log("ℹ️  Make sure the development server is running (npm run dev)");
  }
}

if (require.main === module) {
  testAutoAbsenceAPI().catch(console.error);
}

export { testAutoAbsenceAPI };