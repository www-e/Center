// src/app/students/page.tsx
import { getStudents } from '@/lib/data';
import { StudentsTable } from '@/components/students-table';
import { StudentControls } from '@/components/student-controls';
import { Suspense } from 'react';

function StudentsLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-32 bg-muted rounded-xl"></div>
      <div className="h-96 bg-muted rounded-xl"></div>
    </div>
  );
}

async function StudentsContent() {
  const students = await getStudents();

  return (
    <>
      <StudentControls totalStudents={students.length} />
      <StudentsTable students={students} />
    </>
  );
}

export default function StudentsPage() {
  return (
    <div className="min-h-screen p-4">
      <div className="container space-y-4">
        <Suspense fallback={<StudentsLoading />}>
          <StudentsContent />
        </Suspense>
      </div>
    </div>
  );
}
