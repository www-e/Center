// src/app/attendance/page.tsx
import { AttendanceView } from '@/components/attendance/attendance-view';
import { Suspense } from 'react';

// Loading component for better UX
function AttendanceLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary-light/20 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="animate-pulse">
          <div className="h-64 bg-muted rounded-2xl mb-8"></div>
          <div className="h-32 bg-muted rounded-xl mb-8"></div>
          <div className="h-96 bg-muted rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary-light/20 p-4">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<AttendanceLoading />}>
          <AttendanceView searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
