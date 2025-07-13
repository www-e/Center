// src/app/students/page.tsx
import { getStudents } from '@/lib/data';
import { StudentsTable } from '@/components/students-table';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, GraduationCap, TrendingUp } from 'lucide-react';

export default async function StudentsPage() {
  const students = await getStudents();

  // Calculate statistics
  const totalStudents = students.length;
  const gradeStats = {
    FIRST: students.filter(s => s.grade === 'FIRST').length,
    SECOND: students.filter(s => s.grade === 'SECOND').length,
    THIRD: students.filter(s => s.grade === 'THIRD').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary-light/20 p-4 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl"></div>
          <Card className="shadow-elevated glass-effect relative">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="text-center lg:text-right">
                  <div className="w-20 h-20 mx-auto lg:mx-0 mb-4 bg-gradient-primary rounded-3xl flex items-center justify-center">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                    إدارة الطلاب المتقدمة
                  </CardTitle>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                    نظام شامل لإدارة بيانات الطلاب مع أكواد تلقائية وفلترة متقدمة
                  </p>
                  
                  {/* Status Badges */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-6">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      <Users className="h-3 w-3 mr-1" />
                      {totalStudents} طالب مسجل
                    </Badge>
                    <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      3 صفوف دراسية
                    </Badge>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      نشط ومتطور
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 lg:flex-col">
                  <Button asChild size="lg" className="btn-primary h-14 px-8 text-lg font-semibold rounded-xl hover-lift">
                    <Link href="/students/add" className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                        <UserPlus className="h-4 w-4" />
                      </div>
                      إضافة طالب جديد
                    </Link>
                  </Button>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-2 lg:gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{gradeStats.FIRST}</div>
                      <div className="text-xs text-blue-600">أول ثانوي</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{gradeStats.SECOND}</div>
                      <div className="text-xs text-green-600">ثاني ثانوي</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{gradeStats.THIRD}</div>
                      <div className="text-xs text-purple-600">ثالث ثانوي</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Students Table */}
        <StudentsTable students={students} />
      </div>
    </div>
  );
}
