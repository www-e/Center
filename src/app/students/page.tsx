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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary-light/20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Student Controls */}
        <StudentControls totalStudents={students.length} />
        
        {/* Students Table */}
        <Card className="shadow-card">
          <CardContent className="p-0">
            <StudentsTable students={students} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
