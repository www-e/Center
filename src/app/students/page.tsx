// src/app/students/page.tsx
import { getStudents } from '@/lib/data';
import { StudentsTable } from '@/components/students-table';
import { StudentControls } from '@/components/student-controls';
import { Card, CardContent } from '@/components/ui/card';

export default async function StudentsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const students = await getStudents();

  return (
    <div className="min-h-screen p-4">
      <div className="container space-y-4">
        {/* Student Controls */}
        <StudentControls totalStudents={students.length} />
        
        {/* Students Table */}
        <StudentsTable students={students} />
      </div>
    </div>
  );
}
