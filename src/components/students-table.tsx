// src/components/students-table.tsx
import { Student } from '@prisma/client';
import { translations } from '@/lib/constants';

type StudentsTableProps = {
  students: Student[];
};

export function StudentsTable({ students }: StudentsTableProps) {
  if (students.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow">
        <h3 className="text-xl font-semibold text-gray-700">لا يوجد طلاب بعد</h3>
        <p className="text-gray-500 mt-2">ابدأ بإضافة أول طالب لعرض بياناته هنا.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden" dir="rtl">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-right font-semibold">كود الطالب</th>
              <th className="px-6 py-3 text-right font-semibold">الاسم</th>
              <th className="px-6 py-3 text-right font-semibold">الهاتف</th>
              <th className="px-6 py-3 text-right font-semibold">الصف</th>
              <th className="px-6 py-3 text-right font-semibold">المجموعة</th>
              <th className="px-6 py-3 text-right font-semibold">الميعاد</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-800">{student.studentId}</td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{student.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">{translations[student.grade]}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {translations[student.groupDay]}
                  {student.section !== 'NONE' && <span className="text-xs text-gray-500 mr-2">({translations[student.section]})</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{student.groupTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}