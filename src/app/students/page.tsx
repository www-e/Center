// src/app/students/page.tsx
import { getStudents } from '@/lib/data';
import { StudentsTable } from '@/components/students-table';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <Card className="shadow-card p-4 md:p-10 mx-auto w-full max-w-screen-2xl transition-smooth" dir="rtl">
      <CardHeader className="flex items-center justify-between mb-6">
        <div>
          <CardTitle className="text-3xl font-bold text-foreground">إدارة الطلاب</CardTitle>
          <p className="text-neutral mt-1">عرض وإضافة الطلاب الجدد</p>
        </div>
        <Button asChild variant="default" className="bg-primary text-background hover:bg-primary/90">
          <Link href="/students/add">+ إضافة طالب جديد</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <StudentsTable students={students} />
      </CardContent>
    </Card>
  );
}
