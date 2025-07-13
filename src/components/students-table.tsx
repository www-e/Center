// src/components/students-table.tsx
import { Student } from '@prisma/client';
import { translations } from '@/lib/constants';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type StudentsTableProps = {
  students: Student[];
};

export function StudentsTable({ students }: StudentsTableProps) {
  if (students.length === 0) {
    return (
      <Card className="shadow-card text-center">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">لا يوجد طلاب بعد</CardTitle>
        </CardHeader>
        <CardContent className="text-neutral">
          <p>ابدأ بإضافة أول طالب لعرض بياناته هنا.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card overflow-hidden">
      <Table>
        <TableHeader className="bg-neutral">
          <TableRow>
            <TableHead className="px-6 py-3 text-right font-semibold text-foreground">كود الطالب</TableHead>
            <TableHead className="px-6 py-3 text-right font-semibold text-foreground">الاسم</TableHead>
            <TableHead className="px-6 py-3 text-right font-semibold text-foreground">الهاتف</TableHead>
            <TableHead className="px-6 py-3 text-right font-semibold text-foreground">الصف</TableHead>
            <TableHead className="px-6 py-3 text-right font-semibold text-foreground">المجموعة</TableHead>
            <TableHead className="px-6 py-3 text-right font-semibold text-foreground">الميعاد</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-neutral">
          {students.map((student) => (
            <TableRow key={student.id} className="hover:bg-neutral transition-smooth">
              <TableCell className="px-6 py-4 whitespace-nowrap font-mono text-foreground">{student.studentId}</TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap font-semibold text-foreground">{student.name}</TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">{student.phone}</TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">{translations[student.grade]}</TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">
                {translations[student.groupDay]}
                {student.section !== 'NONE' && <span className="text-xs text-neutral mr-2">({translations[student.section]})</span>}
              </TableCell>
              <TableCell className="px-6 py-4 whitespace-nowrap">{student.groupTime}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
