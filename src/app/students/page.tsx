// src/app/students/page.tsx
import { getStudents } from '@/lib/data';
import { StudentsTable } from '@/components/students-table';
import Link from 'next/link';

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <main className="p-4 md:p-10 mx-auto w-full max-w-7xl">
      <div className="flex items-center justify-between mb-8" dir="rtl">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">إدارة الطلاب</h1>
          <p className="text-gray-500 mt-1">عرض وإضافة الطلاب الجدد</p>
        </div>
        <Link 
          href="/students/add" 
          className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
        >
          + إضافة طالب جديد
        </Link>
      </div>
      <StudentsTable students={students} />
    </main>
  );
}