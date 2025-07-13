// app/students/add/page.tsx
import { StudentForm } from "@/components/student-form";

export default function AddStudentPage() {
  return (
    <main className="p-4 md:p-10">
      <StudentForm />
    </main>
  );
}