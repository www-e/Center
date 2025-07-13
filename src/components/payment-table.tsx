// src/components/payment-table.tsx
import { Student, PaymentRecord } from '@prisma/client';

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
    <div className="bg-white rounded-lg shadow overflow-x-auto" dir="rtl">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-right font-semibold text-gray-700 sticky right-0 bg-gray-100 z-10">اسم الطالب</th>
            {months.map(month => (
              <th key={month} className="px-3 py-3 text-center font-semibold text-gray-600 w-24">
                {new Date(year, month - 1).toLocaleString('ar-EG', { month: 'short' })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {students.map(student => {
            const studentPayments = paymentMap.get(student.id);
            return (
              <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-semibold text-gray-800 sticky right-0 bg-white hover:bg-gray-50 z-10">{student.name}</td>
                {months.map(month => {
                  const record = studentPayments?.get(month);
                  return (
                    <td key={month} className="px-3 py-3 text-center">
                      {record?.isPaid ? (
                        <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                          مدفوع
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
                          غير مدفوع
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}