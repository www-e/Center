// src/app/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="p-4 md:p-10 mx-auto w-full max-w-screen-2xl" dir="rtl">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">مرحباً بك في نظام إدارة الحضور</h1>
        <p className="text-xl text-foreground mb-8">نظام حديث لإدارة الطلاب، الحضور، والمدفوعات بكفاءة وسهولة.</p>
        <Link href="/students" className="px-6 py-3 bg-primary text-background font-semibold rounded-md shadow-sm hover:bg-primary/90 transition-smooth">
          ابدأ الآن
        </Link>
      </section>

      {/* Feature Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">إدارة الطلاب</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral">أضف وتابع بيانات الطلاب بسهولة، مع فلاتر متقدمة.</p>
            <Link href="/students" className="mt-4 inline-block text-primary hover:underline">استعرض الطلاب</Link>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">تسجيل الحضور</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral">سجل الحضور باستخدام QR أو يدوياً، مع دعم التعويضي.</p>
            <Link href="/attendance" className="mt-4 inline-block text-primary hover:underline">تسجيل حضور</Link>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">إدارة المدفوعات</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral">تابع الدفعات الشهرية وأصدر إيصالات تلقائياً.</p>
            <Link href="/payments" className="mt-4 inline-block text-primary hover:underline">عرض المدفوعات</Link>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
