// src/app/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminPaymentConfigModal } from '@/components/admin-payment-config-modal';
import Link from 'next/link';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  GraduationCap, 
  TrendingUp, 
  Shield, 
  Clock, 
  BarChart3,
  CheckCircle,
  Star,
  ArrowRight,
  Smartphone,
  Globe,
  Zap,
  Settings
} from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: Users,
      title: "إدارة الطلاب المتقدمة",
      description: "نظام شامل لإدارة بيانات الطلاب مع إمكانيات البحث والفلترة المتقدمة وإنشاء أكواد الطلاب تلقائياً.",
      benefits: ["إنشاء كود طالب تلقائي", "بحث وفلترة متقدمة", "إدارة البيانات الشخصية"],
      href: "/students"
    },
    {
      icon: Calendar,
      title: "تسجيل الحضور الذكي",
      description: "تقنية QR للمسح السريع مع دعم الحضور التعويضي والتقارير التفصيلية لمتابعة مثالية.",
      benefits: ["مسح QR سريع", "حضور تعويضي", "تقارير شهرية"],
      href: "/attendance"
    },
    {
      icon: CreditCard,
      title: "إدارة المدفوعات الذكية",
      description: "نظام دفع متطور مع إصدار إيصالات تلقائية ومتابعة دقيقة لحالة الدفعات الشهرية.",
      benefits: ["إيصالات تلقائية", "متابعة دقيقة", "تقارير مالية"],
      href: "/payments"
    }
  ];

  const stats = [
    { number: "500+", label: "طالب مسجل", icon: Users },
    { number: "98%", label: "دقة النظام", icon: TrendingUp },
    { number: "24/7", label: "عمل مستمر", icon: Clock },
    { number: "100%", label: "أمان البيانات", icon: Shield }
  ];

  const advantages = [
    { text: "واجهة عربية سهلة الاستخدام", icon: CheckCircle },
    { text: "تقارير تفصيلية ودقيقة", icon: BarChart3 },
    { text: "أمان عالي للبيانات", icon: Shield },
    { text: "دعم فني متواصل", icon: Star },
    { text: "تحديثات مستمرة", icon: Zap },
    { text: "تصميم متجاوب لجميع الأجهزة", icon: Smartphone }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary-light/20" dir="rtl">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  <GraduationCap className="h-4 w-4" />
                  النظام الأكثر تطوراً في مصر
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  نظام إدارة 
                  <span className="text-gradient block">الحضور والطلاب</span>
                  <span className="text-muted-foreground text-2xl lg:text-3xl font-normal block mt-2">
                    المتطور لعام 2025
                  </span>
                </h1>
                <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                  حل شامل ومتقدم لإدارة الطلاب والحضور والمدفوعات بتقنية عصرية وواجهة سهلة الاستخدام تناسب احتياجات المؤسسات التعليمية الحديثة.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="btn-primary h-14 px-8 text-lg font-semibold rounded-xl hover-lift">
                  <Link href="/students" className="flex items-center gap-2">
                    ابدأ الآن مجاناً
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold rounded-xl border-2 hover-lift">
                  <Link href="/attendance" className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    تجربة النظام
                  </Link>
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-border/50">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="text-center group">
                      <div className="flex justify-center mb-2">
                        <Icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="text-2xl lg:text-3xl font-bold text-foreground">{stat.number}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative lg:pl-8">
              <div className="relative">
                {/* Main Dashboard Card */}
                <div className="bg-card shadow-elevated rounded-2xl p-6 border hover-lift">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">لوحة التحكم</h3>
                        <p className="text-sm text-muted-foreground">نظرة عامة سريعة</p>
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm text-muted-foreground">إجمالي الطلاب</span>
                      <span className="font-semibold text-primary">524</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                      <span className="text-sm text-muted-foreground">حضور اليوم</span>
                      <span className="font-semibold text-success">487</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                      <span className="text-sm text-muted-foreground">معدل الحضور</span>
                      <span className="font-semibold text-primary">92.9%</span>
                    </div>
                  </div>
                </div>

                {/* Floating Success Card */}
                <div className="absolute -top-4 -left-4 bg-success/10 backdrop-blur-sm rounded-xl p-4 border border-success/20 animate-fade-in" style={{animationDelay: '0.5s'}}>
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">تم الحفظ بنجاح</span>
                  </div>
                </div>

                {/* Floating Notification Card */}
                <div className="absolute -bottom-4 -right-4 bg-background/90 backdrop-blur-sm rounded-xl p-4 border shadow-md animate-fade-in" style={{animationDelay: '1s'}}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">طالب جديد</p>
                      <p className="text-sm font-medium text-foreground">أحمد محمد</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              مميزات متقدمة لتجربة 
              <span className="text-gradient">استثنائية</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              نقدم لك حلولاً تقنية متطورة تجمع بين السهولة والقوة لإدارة فعالة ومتميزة لمؤسستك التعليمية
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover-lift transition-all duration-300 hover:shadow-elevated border-0 bg-card/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {feature.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                    
                    <div className="space-y-3">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <Button asChild className="w-full btn-ghost group-hover:btn-primary transition-all mt-6">
                      <Link href={feature.href} className="flex items-center justify-center gap-2">
                        استكشف المزيد
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                  لماذا يختارنا 
                  <span className="text-gradient">المئات</span>
                  من المؤسسات؟
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  نحن نقدم أكثر من مجرد نظام إدارة - نقدم تجربة متكاملة تركز على احتياجاتك وتطلعاتك المستقبلية
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {advantages.map((advantage, index) => {
                  const Icon = advantage.icon;
                  return (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors group">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{advantage.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Card className="shadow-card hover-lift">
                  <CardContent className="p-6 text-center">
                    <Globe className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">يعمل أونلاين وأوفلاين</h3>
                    <p className="text-sm text-muted-foreground">مرونة كاملة في الاستخدام</p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-card hover-lift mt-8">
                  <CardContent className="p-6 text-center">
                    <Smartphone className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">متجاوب تماماً</h3>
                    <p className="text-sm text-muted-foreground">يعمل على جميع الأجهزة</p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-card hover-lift">
                  <CardContent className="p-6 text-center">
                    <BarChart3 className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">تقارير ذكية</h3>
                    <p className="text-sm text-muted-foreground">إحصائيات تفصيلية دقيقة</p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-card hover-lift mt-8">
                  <CardContent className="p-6 text-center">
                    <Zap className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">سرعة فائقة</h3>
                    <p className="text-sm text-muted-foreground">أداء محسّن ومتطور</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 lg:px-6 relative">
          <div className="text-center space-y-8">
            <h2 className="text-3xl lg:text-5xl font-bold">
              ابدأ رحلتك معنا اليوم
            </h2>
            <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              انضم إلى مئات المؤسسات التعليمية التي تثق في نظامنا لإدارة طلابها بكفاءة وحداثة
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="h-14 px-8 text-lg font-semibold rounded-xl hover-lift bg-white text-primary hover:bg-white/90">
                <Link href="/students" className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  إدارة الطلاب
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold rounded-xl border-2 border-white text-white hover:bg-white hover:text-primary hover-lift">
                <Link href="/attendance" className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  تسجيل الحضور
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Admin Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <AdminPaymentConfigModal 
          trigger={
            <Button 
              size="lg" 
              className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary-hover"
              title="إعدادات الدفع (المدير)"
            >
              <Settings className="h-6 w-6" />
            </Button>
          }
        />
      </div>
    </main>
  );
}
