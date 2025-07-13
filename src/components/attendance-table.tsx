// src/components/attendance-table.tsx
import { Student, AttendanceRecord } from '@prisma/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, Clock, Users, TrendingUp } from 'lucide-react';

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

// Helper to calculate attendance statistics
function calculateAttendanceStats(students: StudentWithAttendance[], sessionDates: Date[]) {
  const totalSessions = sessionDates.length;
  const totalStudents = students.length;
  const totalPossibleAttendance = totalSessions * totalStudents;
  
  let totalAttended = 0;
  let totalMakeup = 0;
  
  students.forEach(student => {
    student.attendance.forEach(record => {
      totalAttended++;
      if (record.isMakeup) totalMakeup++;
    });
  });
  
  const attendanceRate = totalPossibleAttendance > 0 ? (totalAttended / totalPossibleAttendance) * 100 : 0;
  
  return {
    totalSessions,
    totalStudents,
    totalAttended,
    totalMakeup,
    attendanceRate,
    presentToday: totalAttended - totalMakeup
  };
}

export function AttendanceTable({ students, sessionDates }: AttendanceTableProps) {
  // If no group is selected, there are no session dates to show.
  if (sessionDates.length === 0) {
    return (
      <Card className="shadow-elevated glass-effect">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">اختر المجموعة لعرض الحضور</CardTitle>
          <p className="text-muted-foreground mt-2">الرجاء تحديد "الصف الدراسي" و "مجموعة الأيام" من الفلاتر أعلاه لعرض جدول الحضور التفصيلي</p>
        </CardHeader>
      </Card>
    );
  }

  // Calculate statistics
  const stats = calculateAttendanceStats(students, sessionDates);

  // Create a quick-lookup map for attendance records
  const attendanceMap = new Map<string, Map<string, AttendanceRecord>>();
  students.forEach(student => {
    const studentRecords = new Map<string, AttendanceRecord>();
    student.attendance.forEach(record => {
      studentRecords.set(record.date.toISOString().split('T')[0], record);
    });
    attendanceMap.set(student.id, studentRecords);
  });

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card hover-lift transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalStudents}</p>
                <p className="text-sm text-muted-foreground">إجمالي الطلاب</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover-lift transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.presentToday}</p>
                <p className="text-sm text-muted-foreground">حضور اليوم</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover-lift transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalMakeup}</p>
                <p className="text-sm text-muted-foreground">حضور تعويضي</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover-lift transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.attendanceRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">معدل الحضور</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Attendance Table */}
      <Card className="shadow-elevated overflow-hidden">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Calendar className="h-5 w-5 text-primary" />
            جدول الحضور التفصيلي
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {sessionDates.length} جلسة • {students.length} طالب
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="px-6 py-4 text-right font-semibold text-foreground sticky right-0 bg-muted/50 z-10 min-w-[200px]">
                    اسم الطالب
                  </TableHead>
                  {sessionDates.map(date => (
                    <TableHead key={date.toISOString()} className="px-4 py-4 text-center font-semibold text-foreground min-w-[80px]">
                      <div className="space-y-1">
                        <div className="text-sm font-bold">{formatDateHeader(date)}</div>
                        <div className="text-xs text-muted-foreground">
                          {date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="px-4 py-4 text-center font-semibold text-foreground min-w-[100px]">
                    الإجمالي
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(student => {
                  const studentRecords = attendanceMap.get(student.id);
                  let totalAttendance = 0;
                  let totalMakeup = 0;
                  
                  sessionDates.forEach(date => {
                    const record = studentRecords?.get(date.toISOString().split('T')[0]);
                    if (record) {
                      totalAttendance++;
                      if (record.isMakeup) totalMakeup++;
                    }
                  });
                  
                  const attendancePercentage = sessionDates.length > 0 ? (totalAttendance / sessionDates.length) * 100 : 0;
                  
                  return (
                    <TableRow key={student.id} className="hover:bg-muted/50 transition-colors group">
                      <TableCell className="px-6 py-4 whitespace-nowrap sticky right-0 bg-background group-hover:bg-muted/50 z-10 border-l border-border/50">
                        <div className="space-y-1">
                          <div className="font-semibold text-foreground">{student.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {student.studentId}
                          </div>
                        </div>
                      </TableCell>
                      {sessionDates.map(date => {
                        const record = studentRecords?.get(date.toISOString().split('T')[0]);
                        return (
                          <TableCell key={date.toISOString()} className="px-4 py-4 text-center">
                            {record ? (
                              record.isMakeup ? (
                                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/20">
                                  <Clock className="h-3 w-3 mr-1" />
                                  تعويضي
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-success/10 text-success border-success/20 hover:bg-success/20">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  حاضر
                                </Badge>
                              )
                            ) : (
                              <div className="w-8 h-8 mx-auto bg-neutral/20 rounded-full flex items-center justify-center">
                                <span className="text-neutral text-xs">-</span>
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="px-4 py-4 text-center">
                        <div className="space-y-1">
                          <div className="font-semibold text-foreground">
                            {totalAttendance}/{sessionDates.length}
                          </div>
                          <div className={`text-xs font-medium ${
                            attendancePercentage >= 80 ? 'text-success' :
                            attendancePercentage >= 60 ? 'text-warning' : 'text-error'
                          }`}>
                            {attendancePercentage.toFixed(0)}%
                          </div>
                          {totalMakeup > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {totalMakeup} تعويضي
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
