// src/components/receipts-view.tsx
'use client';

import { getReceiptsForPeriod } from '@/lib/data';
import { Receipt } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Hash, User, Printer } from 'lucide-react';
import { MonthlyPaymentNavigation } from '@/components/monthly-payment-navigation';
import { Button } from '@/components/ui/button';
// Define the props for the component
type ReceiptsViewProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(amount);
};

// Helper to format dates
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export async function ReceiptsView({ searchParams }: ReceiptsViewProps) {
  const year = Number(searchParams.year) || new Date().getFullYear();
  const month = Number(searchParams.month) || new Date().getMonth() + 1;

  const receipts: Receipt[] = await getReceiptsForPeriod(year, month);

  const totalRevenue = receipts.reduce((acc, receipt) => acc + receipt.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">سجل الإيصالات</h1>
        <p className="text-muted-foreground">عرض وطباعة جميع إيصالات الدفع المسجلة</p>
      </header>

      <MonthlyPaymentNavigation
        year={year}
        month={month}
        basePath="/receipts"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيصالات</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{receipts.length}</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">الشهر المحدد</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Date(year, month - 1).toLocaleString('ar-EG', { month: 'long', year: 'numeric' })}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle>قائمة الإيصالات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>اسم الطالب</TableHead>
                  <TableHead>كود الطالب</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>تاريخ الإصدار</TableHead>
                  <TableHead className="text-center">طباعة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.length > 0 ? (
                  receipts.map((receipt, index) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-mono">{index + 1}</TableCell>
                      <TableCell className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {receipt.studentName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{receipt.studentReadableId}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">{formatCurrency(receipt.amount)}</TableCell>
                      <TableCell>{formatDate(receipt.issuedAt)}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="outline" size="icon" onClick={() => window.print()}>
                          <Printer className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      لا توجد إيصالات لهذا الشهر.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
