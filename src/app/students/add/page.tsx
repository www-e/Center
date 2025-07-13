// src/app/students/add/page.tsx
import { StudentForm } from "@/components/student-form";

export default function AddStudentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary-light/20">
      <StudentForm />
    </div>
  );
}
