// src/components/students-table.tsx
'use client';

import { Student } from '@prisma/client';
import { translations } from '@/lib/constants';
import { generateWhatsAppUrl } from '@/lib/phone-validation';

import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Phone, 
  GraduationCap, 
  Calendar, 
  Clock, 
  QrCode,
  MessageCircle,
  ExternalLink
} from 'lucide-react';

type StudentsTableProps = {
  students: Student[];
};

// Helper to get grade color
function getGradeColor(grade: string) {
  switch (grade) {
    case 'FIRST':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'SECOND':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'THIRD':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

// Helper to get section color
function getSectionColor(section: string) {
  switch (section) {
    case 'SCIENTIFIC':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'LITERARY':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function StudentsTable({ students }: StudentsTableProps) {
  const router = useRouter();

  const handleRowClick = (studentId: string) => {
    router.push(`/students/add?edit=${studentId}`);
  };
  if (students.length === 0) {
    return (
      <Card className="shadow-elevated glass-effect text-center">
        <CardHeader className="pb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-3xl flex items-center justify-center mb-6">
            <Users className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">لا يوجد طلاب مسجلين</CardTitle>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            ابدأ رحلتك التعليمية بإضافة أول طالب. سيظهر هنا جميع الطلاب المسجلين مع بياناتهم الكاملة
          </p>
        </CardHeader>
        <CardContent>
          <Button className="btn-primary">
            <Users className="h-4 w-4 mr-2" />
            إضافة أول طالب
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Calculate statistics
  const stats = {
    total: students.length,
    gradeStats: {
      FIRST: students.filter(s => s.grade === 'FIRST').length,
      SECOND: students.filter(s => s.grade === 'SECOND').length,
      THIRD: students.filter(s => s.grade === 'THIRD').length,
    }
  };

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
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">إجمالي الطلاب</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover-lift transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.gradeStats.FIRST}</p>
                <p className="text-sm text-muted-foreground">الصف الأول</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover-lift transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.gradeStats.SECOND}</p>
                <p className="text-sm text-muted-foreground">الصف الثاني</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover-lift transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.gradeStats.THIRD}</p>
                <p className="text-sm text-muted-foreground">الصف الثالث</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Main Students Table */}
      <Card className="shadow-elevated overflow-hidden">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Users className="h-5 w-5 text-primary" />
            قائمة الطلاب المسجلين
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            إدارة شاملة لبيانات {students.length} طالب مسجل
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="px-6 py-4 text-right font-semibold text-foreground min-w-[200px]">
                    بيانات الطالب
                  </TableHead>
                  <TableHead className="px-4 py-4 text-center font-semibold text-foreground min-w-[120px]">
                    كود الطالب
                  </TableHead>
                  <TableHead className="px-4 py-4 text-center font-semibold text-foreground min-w-[100px]">
                    الصف الدراسي
                  </TableHead>
                  <TableHead className="px-4 py-4 text-center font-semibold text-foreground min-w-[120px]">
                    الشعبة
                  </TableHead>
                  <TableHead className="px-4 py-4 text-center font-semibold text-foreground min-w-[140px]">
                    مجموعة الأيام
                  </TableHead>
                  <TableHead className="px-4 py-4 text-center font-semibold text-foreground min-w-[100px]">
                    الميعاد
                  </TableHead>
                  <TableHead className="px-4 py-4 text-center font-semibold text-foreground min-w-[140px]">
                    هاتف الطالب
                  </TableHead>
                  <TableHead className="px-4 py-4 text-center font-semibold text-foreground min-w-[140px]">
                    هاتف ولي الأمر
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow 
                    key={student.id} 
                    className="hover:bg-muted/50 transition-colors group cursor-pointer hover:bg-primary/5"
                    onClick={() => handleRowClick(student.id)}
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-white font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-lg">{student.name}</div>
                          <div className="text-sm text-muted-foreground">
                            تاريخ التسجيل: {new Date(student.createdAt).toLocaleDateString('ar-EG')}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <QrCode className="h-4 w-4 text-muted-foreground" />
                        <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                          {student.studentId}
                        </code>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center">
                      <Badge variant="outline" className={getGradeColor(student.grade)}>
                        <GraduationCap className="h-3 w-3 mr-1" />
                        {translations[student.grade]}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center">
                      {student.section !== 'NONE' ? (
                        <Badge variant="outline" className={getSectionColor(student.section)}>
                          {translations[student.section]}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {translations[student.groupDay]}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {student.groupTime}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 hover:bg-success/10 text-success hover:text-success"
                        onClick={(e) => {
                          e.stopPropagation();
                          const whatsappUrl = generateWhatsAppUrl(student.phone, `مرحباً ${student.name}`);
                          window.open(whatsappUrl, '_blank');
                        }}
                        title={`فتح واتساب مع ${student.name}`}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        <span className="font-mono text-xs">{student.phone}</span>
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 hover:bg-primary/10 text-primary hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          const whatsappUrl = generateWhatsAppUrl(student.parentPhone, `مرحباً، أنا من المركز التعليمي بخصوص الطالب ${student.name}`);
                          window.open(whatsappUrl, '_blank');
                        }}
                        title="فتح واتساب مع ولي الأمر"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        <span className="font-mono text-xs">{student.parentPhone}</span>
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
