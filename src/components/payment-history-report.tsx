// src/components/payment-history-report.tsx
import { Student, PaymentRecord, Receipt } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  UserX, 
  Clock,
  TrendingUp,
  AlertTriangle,
  Info
} from 'lucide-react';
import { getStudentPaymentStats, generatePaymentHistory, PaymentHistoryEntry } from '@/lib/payment-history';

type StudentWithPayments = Student & {
  payments: (PaymentRecord & { receipt?: Receipt | null })[];
};

interface PaymentHistoryReportProps {
  students: StudentWithPayments[];
  year: number;
}

export function PaymentHistoryReport({ students, year }: PaymentHistoryReportProps) {
  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const getStatusIcon = (status: PaymentHistoryEntry['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'overdue':
        return <XCircle className="h-4 w-4 text-error" />;
      case 'not_enrolled':
        return <UserX className="h-4 w-4 text-muted-foreground" />;
      case 'future':
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: PaymentHistoryEntry['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-success/20 border-success/30';
      case 'overdue':
        return 'bg-error/20 border-error/30';
      case 'not_enrolled':
        return 'bg-muted border-muted-foreground/30';
      case 'future':
        return 'bg-blue/20 border-blue/30';
    }
  };

  if (students.length === 0) {
    return (
      <Card className="shadow-elevated text-center">
        <CardHeader>
          <CardTitle className="text-xl text-muted-foreground">لا توجد بيانات</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">لا توجد بيانات طلاب لعرض تقرير المدفوعات</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            تقرير المدفوعات التفصيلي - {year}
          </CardTitle>
          <div className="bg-info/10 border border-info/20 rounded-lg p-3 mt-4">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-info mt-0.5" />
              <div className="text-sm text-info">
                <p className="font-medium mb-1">ملاحظة مهمة:</p>
                <p>
                  هذا التقرير يراعي تاريخ تسجيل كل طالب. الطلاب لا يُعتبرون متأخرين في الدفع للشهور التي سبقت تسجيلهم في المركز.
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {students.map(student => {
              const stats = getStudentPaymentStats(student, student.payments, year);
              const history = generatePaymentHistory(student, student.payments, 1, year, 12, year);
              
              return (
                <Card key={student.id} className="border-l-4 border-l-primary/50">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Student Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">{student.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            كود: {student.studentId} | تاريخ التسجيل: {stats.enrollmentMonth}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <span className="font-bold text-primary">{stats.paymentRate.toFixed(1)}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">معدل الدفع</p>
                        </div>
                      </div>

                      {/* Payment Statistics */}
                      <div className="grid grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg">
                        <div className="text-center">
                          <div className="text-lg font-bold text-success">{stats.totalPaid}</div>
                          <div className="text-xs text-muted-foreground">مدفوع</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-error">{stats.totalOverdue}</div>
                          <div className="text-xs text-muted-foreground">متأخر</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">{stats.totalMonthsEnrolled}</div>
                          <div className="text-xs text-muted-foreground">إجمالي الشهور</div>
                        </div>
                      </div>

                      {/* Monthly Payment Grid */}
                      <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                        {history.map((entry, index) => (
                          <div
                            key={`${entry.month}-${entry.year}`}
                            className={`
                              relative p-2 rounded-lg border-2 transition-all hover:scale-105
                              ${getStatusColor(entry.status)}
                              ${entry.isCurrentMonth ? 'ring-2 ring-primary/50' : ''}
                            `}
                            title={`${monthNames[entry.month - 1]} ${entry.year} - ${
                              entry.status === 'paid' ? 'مدفوع' :
                              entry.status === 'overdue' ? 'متأخر' :
                              entry.status === 'not_enrolled' ? 'غير مسجل' :
                              'شهر مستقبلي'
                            }`}
                          >
                            <div className="text-center">
                              <div className="flex justify-center mb-1">
                                {getStatusIcon(entry.status)}
                              </div>
                              <div className="text-xs font-medium">
                                {monthNames[entry.month - 1].slice(0, 3)}
                              </div>
                              {entry.paidAt && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {new Date(entry.paidAt).getDate()}
                                </div>
                              )}
                            </div>
                            {entry.isCurrentMonth && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Warnings for overdue payments */}
                      {stats.totalOverdue > 0 && (
                        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-warning" />
                            <span className="text-sm font-medium text-warning">
                              يوجد {stats.totalOverdue} شهر متأخر في الدفع
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">مفتاح الرموز</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-success/20 border-2 border-success/30 rounded flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
              <span className="text-sm">مدفوع</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-error/20 border-2 border-error/30 rounded flex items-center justify-center">
                <XCircle className="h-4 w-4 text-error" />
              </div>
              <span className="text-sm">متأخر</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-muted border-2 border-muted-foreground/30 rounded flex items-center justify-center">
                <UserX className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm">غير مسجل</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue/20 border-2 border-blue/30 rounded flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm">شهر مستقبلي</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}