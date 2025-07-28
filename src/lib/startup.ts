// src/lib/startup.ts
import { startAutoAbsenceScheduler } from './auto-absence';

let isInitialized = false;

export function initializeApp() {
  if (isInitialized) {
    return;
  }

  console.log('🚀 Initializing attendance management system...');
  
  // Start the auto-absence scheduler
  startAutoAbsenceScheduler();
  
  isInitialized = true;
  console.log('✅ System initialization complete');
}

// Auto-initialize when this module is imported
if (typeof window === 'undefined') { // Only run on server
  initializeApp();
}