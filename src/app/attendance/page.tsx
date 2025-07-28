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
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <div className="min-h-screen p-4">
      <div className="container">
        <Suspense fallback={<AttendanceLoading />}>
          <AttendanceView searchParams={resolvedSearchParams} />
        </Suspense>
      </div>
    </div>
  );
}
