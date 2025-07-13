// src/app/attendance/page.tsx
import { AttendanceView } from '@/components/attendance/attendance-view';
import { Suspense } from 'react';
import { Card } from '@/components/ui/card';

// Make the page async to align with async child component
export default async function AttendancePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  return (
    <Card className="shadow-card p-4 md:p-10 mx-auto w-full max-w-screen-2xl transition-smooth">
      <Suspense fallback={<div>جاري التحميل...</div>}>
        <AttendanceView searchParams={searchParams} />
      </Suspense>
    </Card>
  );
}
