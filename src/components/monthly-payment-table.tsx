// src/components/monthly-payment-table.tsx
import { Student, PaymentRecord, Receipt } from '@prisma/client';
import { translations } from '@/lib/constants';
import { getPaymentStatusForMonth } from '@/lib/payment-history';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users,
  DollarSign,
  Calendar,
  UserX
} from 'lucide-react';

type StudentWithPayments = Student & {
  payments: (PaymentRecord & { receipt?: Receipt | null })[];
};

type MonthlyPaymentTableProps = {
  students: StudentWithPayments[];
  month: number;
  year: number;
};

export function MonthlyPaymentTable({ students, month, year }: MonthlyPaymentTableProps) {
  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  // Calculate statistics
  let paidCount = 0;
  let overdueCount = 0;
  let notEnrolledCount = 0;
  let totalRevenue = 0;

  const studentsWithStatus = students.map(student => {
    const monthlyPayment = student.payments.find(p => p.month === month && p.year === year);
    const status = getPaymentStatusForMonth(student, month, year, monthlyPayment);
    let amount = 0;
    
    // Update counters based on status
    if (status === 'paid') {
      amount = monthlyPayment?.receipt?.amount || 200;
      paidCount++;
      totalRevenue += amount;
    } else if (status === 'overdue') {
      overdueCount++;
    } else if (status === 'not_enrolled') {
      notEnrolledCount++;
    }

    return {
      ...student,
      monthlyPayment,
      status,
      amount
    };
  });

  const getStatusBadge = (status: 'paid' | 'overdue' | 'not_enrolled' | 'future') => {
    switch (status) {
      case 'paid':
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            مدفوع
          </Badge>
        );
      case 'overdue':
        return (
          <Badge variant="outline" className="bg-error/10 text-error border-error/20">
            <XCircle className="h-3 w-3 mr-1" />
            متأخر
          </Badge>
        );
      case 'not_enrolled':
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            <UserX className="h-3 w-3 mr-1" />
            غير مسجل
          </Badge>
        );
      case 'future':
        return (
          <Badge variant="outline" className="bg-blue/10 text-blue-600 border-blue/20">
            <Clock className="h-3 w-3 mr-1" />
            شهر مستقبلي
          </Badge>
        );
    }
  };

  const getGradeColor = (grade: string) => {
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
  };

  if (students.length === 0) {
    return (
      <Card className="shadow-elevated text-center">
        <CardHeader className="pb-6">
          <div className="w-20 h-20 mx-auto bg-muted rounded-3xl flex items-center justify-center mb-6">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">لا يوجد طلاب</CardTitle>
          <p className="text-muted-foreground mt-2">
            لا توجد بيانات طلاب لعرضها في {monthNames[month - 1]} {year}
          </p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card hover-lift transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{paidCount}</p>
                <p className="text-sm text-muted-foreground">مدفوع</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover-lift transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center">
                <XCircle className="h-6 w-6 text-error" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{overdueCount}</p>
                <p className="text-sm text-muted-foreground">متأخر</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover-lift transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalRevenue.toLocaleString('ar-EG')}</p>
                <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover-lift transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                <UserX className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{notEnrolledCount}</p>
                <p className="text-sm text-muted-foreground">غير مسجل</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Payment Table */}
      <Card className="shadow-elevated overflow-hidden">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Calendar className="h-5 w-5 text-primary" />
            مدفوعات {monthNames[month - 1]} {year}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            عرض حالة الدفع لجميع الطلاب في الشهر المحدد
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
                    الصف
                  </TableHead>
                  <TableHead className="px-4 py-4 text-center font-semibold text-foreground min-w-[120px]">
                    المبلغ
                  </TableHead>
                  <TableHead className="px-4 py-4 text-center font-semibold text-foreground min-w-[120px]">
                    حالة الدفع
                  </TableHead>
                  <TableHead className="px-4 py-4 text-center font-semibold text-foreground min-w-[140px]">
                    تاريخ الدفع
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsWithStatus.map((student) => (
                  <TableRow key={student.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-white font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-lg">{student.name}</div>
                          <div className="text-sm text-muted-foreground">
                            تاريخ التسجيل: {new Date(student.enrollmentDate).toLocaleDateString('ar-EG')}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center">
                      <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                        {student.studentId}
                      </code>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center">
                      <Badge variant="outline" className={getGradeColor(student.grade)}>
                        {translations[student.grade]}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center">
                      {student.status === 'paid' ? (
                        <span className="font-bold text-success">
                          {student.amount.toLocaleString('ar-EG')} ج.م
                        </span>
                      ) : student.status === 'not_enrolled' ? (
                        <span className="text-muted-foreground">-</span>
                      ) : (
                        <span className="text-error">غير مدفوع</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center">
                      {getStatusBadge(student.status)}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center">
                      {student.monthlyPayment?.paidAt ? (
                        <div className="text-sm">
                          <div className="font-medium text-foreground">
                            {new Date(student.monthlyPayment.paidAt).toLocaleDateString('ar-EG')}
                          </div>
                          <div className="text-muted-foreground">
                            {new Date(student.monthlyPayment.paidAt).toLocaleTimeString('ar-EG', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
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
