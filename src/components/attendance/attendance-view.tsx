// src/components/attendance/attendance-view.tsx
import { AttendanceControls } from "@/components/attendance-controls";
import { getFilteredStudentsWithAttendance, StudentFilters } from "@/lib/data";
import { getSessionDatesForMonth } from "@/lib/utils";
import { Grade, GroupDay } from '@prisma/client';
import { AttendanceTable } from '@/components/attendance-table';

export async function AttendanceView({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Await searchParams to handle async nature in Next.js 15
  const params = await searchParams;

  const year = Number(params.year) || new Date().getFullYear();
  const month = Number(params.month) || new Date().getMonth() + 1;

  const filters: StudentFilters = {
    grade: params.grade as Grade | undefined,
    groupDay: params.groupDay as GroupDay | undefined,
    groupTime: params.groupTime as string | undefined,
  };

  const studentsWithAttendance = await getFilteredStudentsWithAttendance(year, month, filters);
  
  const sessionDates = filters.groupDay
    ? getSessionDatesForMonth(year, month, filters.groupDay)
    : [];

  const currentMonthName = new Date(year, month - 1).toLocaleString('ar-EG', { month: 'long', year: 'numeric' });

  return (
    <main className="p-4 md:p-10 mx-auto w-full max-w-screen-2xl">
      <div className="flex items-center justify-between mb-6" dir="rtl">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">متابعة الحضور للشهر: {currentMonthName}</h1>
          <p className="text-gray-500 mt-1">قم بتصفية الطلاب وابدأ في تسجيل الحضور.</p>
        </div>
      </div>
      <AttendanceControls />
      <AttendanceTable students={studentsWithAttendance} sessionDates={sessionDates} />
    </main>
  );
}
