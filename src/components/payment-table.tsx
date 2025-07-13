// src/components/payment-table.tsx
import { Student, PaymentRecord } from '@prisma/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';

type StudentWithPayments = Student & {
  payments: PaymentRecord[];
};

type PaymentTableProps = {
  students: StudentWithPayments[];
  year: number;
};

const months = Array.from({ length: 12 }, (_, i) => i + 1);

export function PaymentTable({ students, year }: PaymentTableProps) {
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
    <Card className="shadow-card overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-neutral">
            <TableHead className="px-4 py-3 text-right font-semibold text-foreground sticky right-0 bg-neutral z-10">اسم الطالب</TableHead>
            {months.map(month => (
              <TableHead key={month} className="px-3 py-3 text-center font-semibold text-foreground w-24">
                {new Date(year, month - 1).toLocaleString('ar-EG', { month: 'short' })}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map(student => {
            const studentPayments = paymentMap.get(student.id);
            return (
              <TableRow key={student.id} className="hover:bg-neutral transition-smooth">
                <TableCell className="px-4 py-3 font-semibold text-foreground sticky right-0 bg-background hover:bg-neutral z-10">{student.name}</TableCell>
                {months.map(month => {
                  const record = studentPayments?.get(month);
                  return (
                    <TableCell key={month} className="px-3 py-3 text-center">
                      {record?.isPaid ? (
                        <span className="px-2 py-1 text-xs font-semibold text-success bg-success/20 rounded-full">
                          مدفوع
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold text-error bg-error/20 rounded-full">
                          غير مدفوع
                        </span>
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
