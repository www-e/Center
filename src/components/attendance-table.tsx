// src/components/attendance-table.tsx
import { Student, AttendanceRecord } from '@prisma/client';

type StudentWithAttendance = Student & {
  attendance: AttendanceRecord[];
};

type AttendanceTableProps = {
  students: StudentWithAttendance[];
  sessionDates: Date[];
};

// Helper to format dates for the table header
function formatDateHeader(date: Date) {
  return date.toLocaleDateString('ar-EG', { day: 'numeric', weekday: 'short' });
}

export function AttendanceTable({ students, sessionDates }: AttendanceTableProps) {
  // If no group is selected, there are no session dates to show.
  if (sessionDates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h2 className="text-lg font-semibold text-gray-600">جدول الحضور</h2>
        <p className="text-gray-400 mt-2">الرجاء تحديد "الصف الدراسي" و "مجموعة الأيام" من الفلاتر أعلاه لعرض الطلاب وجدول الحضور الخاص بهم.</p>
      </div>
    );
  }

  // Create a quick-lookup map for attendance records
  const attendanceMap = new Map<string, Map<string, AttendanceRecord>>();
  students.forEach(student => {
    const studentRecords = new Map<string, AttendanceRecord>();
    student.attendance.forEach(record => {
      // Use YYYY-MM-DD as a consistent key for dates
      studentRecords.set(record.date.toISOString().split('T')[0], record);
    });
    attendanceMap.set(student.id, studentRecords);
  });

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto" dir="rtl">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-right font-semibold text-gray-700 sticky right-0 bg-gray-100 z-10">اسم الطالب</th>
            {sessionDates.map(date => (
              <th key={date.toISOString()} className="px-4 py-3 text-center font-semibold text-gray-600 w-24">
                {formatDateHeader(date)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {students.map(student => {
            const studentRecords = attendanceMap.get(student.id);
            return (
              <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-800 sticky right-0 bg-white hover:bg-gray-50 z-10">{student.name}</td>
                {sessionDates.map(date => {
                  const record = studentRecords?.get(date.toISOString().split('T')[0]);
                  return (
                    <td key={date.toISOString()} className="px-4 py-3 text-center">
                      {record ? (
                        record.isMakeup ? (
                          <span className="text-blue-500 font-bold" title="حضور تعويضي">م</span>
                        ) : (
                          <span className="text-green-500 font-bold" title="حاضر">✔</span>
                        )
                      ) : (
                        <span className="text-gray-300">-</span>
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