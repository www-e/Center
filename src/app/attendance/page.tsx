// src/app/attendance/page.tsx
import { AttendanceView } from '@/components/attendance/attendance-view';
import { Suspense } from 'react';

// This is the Page component for the route /attendance
export default function AttendancePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  return (
    // The Suspense boundary is a good practice for pages that stream in data.
    // It allows Next.js to show a fallback UI if data loading is slow.
    <Suspense fallback={<div>Loading...</div>}>
      <AttendanceView searchParams={searchParams} />
    </Suspense>
  );
}