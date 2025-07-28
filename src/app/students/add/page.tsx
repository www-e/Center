// src/app/students/add/page.tsx
import { StudentForm } from "@/components/student-form";
import { Suspense } from "react";

function StudentFormLoading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
    </div>
  );
}

export default function AddStudentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary-light/20">
      <Suspense fallback={<StudentFormLoading />}>
        <StudentForm />
      </Suspense>
    </div>
  );
}
