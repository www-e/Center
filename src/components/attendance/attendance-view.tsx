// src/components/attendance/attendance-view.tsx
import { AttendanceControls } from "@/components/attendance-controls";
import { getFilteredStudentsWithAttendance, StudentFilters } from "@/lib/data";
import { getSessionDatesForMonth } from "@/lib/utils";
import { Grade, GroupDay } from '@prisma/client';
import { AttendanceTable } from '@/components/attendance-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, TrendingUp, Clock } from 'lucide-react';

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

  const currentMonthName = new Date(year, month - 1).toLocaleString('ar-EG', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Calculate attendance statistics
  const totalStudents = studentsWithAttendance.length;
  const totalSessions = sessionDates.length;
  let totalAttendance = 0;
  let totalMakeup = 0;

  studentsWithAttendance.forEach(student => {
    student.attendance.forEach(record => {
      totalAttendance++;
      if (record.isMakeup) totalMakeup++;
    });
  });

  const attendanceRate = totalSessions > 0 && totalStudents > 0 
    ? ((totalAttendance / (totalSessions * totalStudents)) * 100)
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl"></div>
        <Card className="shadow-elevated glass-effect relative">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-3xl flex items-center justify-center">
              <Calendar className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              متابعة الحضور - {currentMonthName}
            </CardTitle>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              قم بتصفية الطلاب حسب الصف والمجموعة، ثم ابدأ في تسجيل الحضور باستخدام ماسح الكود المدمج
            </p>
            
            {/* Status Badges */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Users className="h-3 w-3 mr-1" />
                {totalStudents} طالب
              </Badge>
              <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                <Calendar className="h-3 w-3 mr-1" />
                {totalSessions} جلسة
              </Badge>
              {attendanceRate > 0 && (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {attendanceRate.toFixed(1)}% حضور
                </Badge>
              )}
              {totalMakeup > 0 && (
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                  <Clock className="h-3 w-3 mr-1" />
                  {totalMakeup} تعويضي
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Controls Section */}
      <AttendanceControls />

      {/* Table Section */}
      <AttendanceTable students={studentsWithAttendance} sessionDates={sessionDates} />
    </div>
  );
}
