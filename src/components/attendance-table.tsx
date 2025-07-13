// src/components/attendance-table.tsx
import { Student, AttendanceRecord } from '@prisma/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type StudentWithAttendance = Student & {
  attendance: AttendanceRecord[];
};

type AttendanceTableProps = {
  students: StudentWithAttendance[];
  sessionDates: Date[];
};

// Helper to format dates for the table header
function formatDateHeader(date: Date) {
  return date.toLocaleDateString('ar-EG', { day: 'numeric', weekday: 'short' });
}

export function AttendanceTable({ students, sessionDates }: AttendanceTableProps) {
  // If no group is selected, there are no session dates to show.
  if (sessionDates.length === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">جدول الحضور</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-neutral">
          <p>الرجاء تحديد "الصف الدراسي" و "مجموعة الأيام" من الفلاتر أعلاه لعرض الطلاب وجدول الحضور الخاص بهم.</p>
        </CardContent>
      </Card>
    );
  }

  // Create a quick-lookup map for attendance records
  const attendanceMap = new Map<string, Map<string, AttendanceRecord>>();
  students.forEach(student => {
    const studentRecords = new Map<string, AttendanceRecord>();
    student.attendance.forEach(record => {
      // Use YYYY-MM-DD as a consistent key for dates
      studentRecords.set(record.date.toISOString().split('T')[0], record);
    });
    attendanceMap.set(student.id, studentRecords);
  });

  return (
    <Card className="shadow-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-neutral">
            <TableHead className="px-4 py-3 text-right font-semibold text-foreground sticky right-0 bg-neutral z-10">اسم الطالب</TableHead>
            {sessionDates.map(date => (
              <TableHead key={date.toISOString()} className="px-4 py-3 text-center font-semibold text-foreground w-24">
                {formatDateHeader(date)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map(student => {
            const studentRecords = attendanceMap.get(student.id);
            return (
              <TableRow key={student.id} className="hover:bg-neutral transition-smooth">
                <TableCell className="px-4 py-3 whitespace-nowrap font-semibold text-foreground sticky right-0 bg-background hover:bg-neutral z-10">{student.name}</TableCell>
                {sessionDates.map(date => {
                  const record = studentRecords?.get(date.toISOString().split('T')[0]);
                  return (
                    <TableCell key={date.toISOString()} className="px-4 py-3 text-center">
                      {record ? (
                        record.isMakeup ? (
                          <span className="text-primary font-bold" title="حضور تعويضي">م</span>
                        ) : (
                          <span className="text-success font-bold" title="حاضر">✔</span>
                        )
                      ) : (
                        <span className="text-neutral">-</span>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
