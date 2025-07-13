// src/app/attendance/page.tsx
import { AttendanceView } from '@/components/attendance/attendance-view';
import { Suspense } from 'react';

// Make the page async to align with async child component
export default async function AttendancePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <AttendanceView searchParams={searchParams} />
    </Suspense>
  );
}
