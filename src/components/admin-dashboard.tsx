// src/components/admin-dashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminPaymentConfigModal } from './admin-payment-config-modal';
import { 
  Settings, 
  Users, 
  CreditCard, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  Database,
  Shield,
  Activity,
  BarChart3
} from 'lucide-react';

interface AdminStats {
  totalStudents: number;
  totalPayments: number;
  monthlyRevenue: number;
  activeConfigs: number;
  systemHealth: 'good' | 'warning' | 'error';
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    totalPayments: 0,
    monthlyRevenue: 0,
    activeConfigs: 0,
    systemHealth: 'good'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading admin stats
    const loadStats = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch from an API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats({
          totalStudents: 524,
          totalPayments: 487,
          monthlyRevenue: 125000,
          activeConfigs: 5,
          systemHealth: 'good'
        });
      } catch (error) {
        console.error('Error loading admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const getHealthBadge = (health: AdminStats['systemHealth']) => {
    switch (health) {
      case 'good':
        return <Badge className="bg-success/10 text-success border-success/20">نظام سليم</Badge>;
      case 'warning':
        return <Badge className="bg-warning/10 text-warning border-warning/20">تحذير</Badge>;
      case 'error':
        return <Badge className="bg-error/10 text-error border-error/20">خطأ</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-foreground">جاري تحميل لوحة الإدارة</h2>
          <p className="text-muted-foreground">يرجى الانتظار...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            لوحة الإدارة
          </h1>
          <p className="text-muted-foreground mt-2">
            إدارة شاملة للنظام والإعدادات المتقدمة
          </p>
        </div>
        {getHealthBadge(stats.systemHealth)}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-card hover-lift transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalStudents.toLocaleString('ar-EG')}</p>
                <p className="text-sm text-muted-foreground">إجمالي الطلاب</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover-lift transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalPayments.toLocaleString('ar-EG')}</p>
                <p className="text-sm text-muted-foreground">المدفوعات هذا الشهر</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover-lift transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.monthlyRevenue.toLocaleString('ar-EG')}</p>
                <p className="text-sm text-muted-foreground">الإيرادات الشهرية (ج.م)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card hover-lift transition-all">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                <Settings className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.activeConfigs}</p>
                <p className="text-sm text-muted-foreground">إعدادات الدفع النشطة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Configuration */}
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              إعدادات الدفع
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              إدارة مبالغ الدفع لكل صف وشعبة. يتم تطبيق هذه المبالغ تلقائياً عند مسح كود الطالب.
            </p>
            <AdminPaymentConfigModal 
              trigger={
                <Button className="w-full bg-primary text-white hover:bg-primary/90">
                  <Settings className="h-4 w-4 mr-2" />
                  تعديل إعدادات الدفع
                </Button>
              }
            />
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-success" />
              حالة النظام
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">قاعدة البيانات</span>
                <Badge className="bg-success/10 text-success border-success/20">متصلة</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">النسخ الاحتياطي</span>
                <Badge className="bg-success/10 text-success border-success/20">محدث</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">الأداء</span>
                <Badge className="bg-success/10 text-success border-success/20">ممتاز</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              <Database className="h-4 w-4 mr-2" />
              تفاصيل النظام
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-secondary" />
            إجراءات سريعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-16 flex-col gap-2">
              <Users className="h-5 w-5" />
              <span>تقرير الطلاب</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2">
              <CreditCard className="h-5 w-5" />
              <span>تقرير المدفوعات</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-2">
              <Calendar className="h-5 w-5" />
              <span>تقرير الحضور</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-warning" />
            النشاط الأخير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">تم إضافة طالب جديد</p>
                <p className="text-xs text-muted-foreground">أحمد محمد - الصف الثاني الثانوي</p>
              </div>
              <span className="text-xs text-muted-foreground">منذ 5 دقائق</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">تم تسجيل دفعة جديدة</p>
                <p className="text-xs text-muted-foreground">سارة أحمد - 250 ج.م</p>
              </div>
              <span className="text-xs text-muted-foreground">منذ 12 دقيقة</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
                <Settings className="h-4 w-4 text-warning" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">تم تحديث إعدادات الدفع</p>
                <p className="text-xs text-muted-foreground">الصف الثالث الثانوي - علمي</p>
              </div>
              <span className="text-xs text-muted-foreground">منذ ساعة</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}