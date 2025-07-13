// src/components/payment-table.tsx
import { Student, PaymentRecord } from '@prisma/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

type StudentWithPayments = Student & {
  payments: PaymentRecord[];
};

type PaymentTableProps = {
  students: StudentWithPayments[];
  year: number;
};

const months = Array.from({ length: 12 }, (_, i) => i + 1);

// Helper to calculate payment statistics
function calculatePaymentStats(students: StudentWithPayments[], year: number) {
  const totalStudents = students.length;
  const totalPossiblePayments = totalStudents * 12;
  
  let totalPaid = 0;
  let totalOverdue = 0;
  let totalRevenue = 0;
  
  students.forEach(student => {
    student.payments.forEach(payment => {
      if (payment.isPaid) {
        totalPaid++;
        // Assuming average payment of 500 EGP per month
        totalRevenue += 500;
      } else {
        totalOverdue++;
      }
    });
  });
  
  const paymentRate = totalPossiblePayments > 0 ? (totalPaid / totalPossiblePayments) * 100 : 0;
  
  return {
    totalStudents,
    totalPaid,
    totalOverdue,
    totalRevenue,
    paymentRate
  };
}

export function PaymentTable({ students, year }: PaymentTableProps) {
  const stats = calculatePaymentStats(students, year);
  
  // Create a quick-lookup map for payment records: Map<studentId, Map<month, PaymentRecord>>
  const paymentMap = new Map<string, Map<number, PaymentRecord>>();
  students.forEach(student => {
    const studentPayments = new Map<number, PaymentRecord>();
    student.payments.forEach(record => {
      studentPayments.set(record.month, record);
    });
    paymentMap.set(student.id, studentPayments);
  });

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
                <p className="text-2xl font-bold text-foreground">{stats.totalPaid}</p>
                <p className="text-sm text-muted-foreground">المدفوعات المكتملة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover-lift transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-error" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalOverdue}</p>
                <p className="text-sm text-muted-foreground">المدفوعات المتأخرة</p>
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
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalRevenue.toLocaleString('ar-EG')} ج.م
                </p>
                <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
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
                <p className="text-2xl font-bold text-foreground">{stats.paymentRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">معدل الدفع</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Payment Table */}
      <Card className="shadow-elevated overflow-hidden">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
            <CreditCard className="h-5 w-5 text-primary" />
            جدول المدفوعات الشهرية - {year}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            متابعة دقيقة لحالة المدفوعات لجميع الطلاب
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
                  {months.map(month => (
                    <TableHead key={month} className="px-3 py-4 text-center font-semibold text-foreground min-w-[100px]">
                      <div className="space-y-1">
                        <div className="text-sm font-bold">
                          {new Date(year, month - 1).toLocaleString('ar-EG', { month: 'short' })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {month}
                        </div>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="px-4 py-4 text-center font-semibold text-foreground min-w-[120px]">
                    الإجمالي
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(student => {
                  const studentPayments = paymentMap.get(student.id);
                  let totalPaid = 0;
                  let totalAmount = 0;
                  
                  months.forEach(month => {
                    const record = studentPayments?.get(month);
                    if (record?.isPaid) {
                      totalPaid++;
                      totalAmount += 500; // Assuming 500 EGP per month
                    }
                  });
                  
                  const paymentPercentage = (totalPaid / 12) * 100;
                  
                  return (
                    <TableRow key={student.id} className="hover:bg-muted/50 transition-colors group">
                      <TableCell className="px-6 py-4 whitespace-nowrap sticky right-0 bg-background group-hover:bg-muted/50 z-10 border-l border-border/50">
                        <div className="space-y-1">
                          <div className="font-semibold text-foreground">{student.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {student.studentId}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {student.phone}
                          </div>
                        </div>
                      </TableCell>
                      {months.map(month => {
                        const record = studentPayments?.get(month);
                        const currentMonth = new Date().getMonth() + 1;
                        const currentYear = new Date().getFullYear();
                        const isCurrentOrPastMonth = year < currentYear || (year === currentYear && month <= currentMonth);
                        
                        return (
                          <TableCell key={month} className="px-3 py-4 text-center">
                            {record?.isPaid ? (
                              <Badge variant="outline" className="bg-success/10 text-success border-success/20 hover:bg-success/20">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                مدفوع
                              </Badge>
                            ) : isCurrentOrPastMonth ? (
                              <Badge variant="outline" className="bg-error/10 text-error border-error/20 hover:bg-error/20">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                متأخر
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-neutral/10 text-neutral-foreground border-neutral/20">
                                لم يحن وقته
                              </Badge>
                            )}
                            {record?.isPaid && record.paidAt && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(record.paidAt).toLocaleDateString('ar-EG', { 
                                  day: 'numeric', 
                                  month: 'short' 
                                })}
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="px-4 py-4 text-center">
                        <div className="space-y-1">
                          <div className="font-semibold text-foreground">
                            {totalPaid}/12
                          </div>
                          <div className={`text-xs font-medium ${
                            paymentPercentage >= 80 ? 'text-success' :
                            paymentPercentage >= 60 ? 'text-warning' : 'text-error'
                          }`}>
                            {paymentPercentage.toFixed(0)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {totalAmount.toLocaleString('ar-EG')} ج.م
                          </div>
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
