// src/components/admin-payment-config-modal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Lock, Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Grade, Section } from '@prisma/client';
import { translations } from '@/lib/constants';

interface PaymentConfigData {
  grade: Grade;
  section: Section;
  amount: number;
}

interface AdminPaymentConfigModalProps {
  trigger?: React.ReactNode;
}

export function AdminPaymentConfigModal({ trigger }: AdminPaymentConfigModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Payment configurations
  const [configs, setConfigs] = useState<PaymentConfigData[]>([
    { grade: Grade.FIRST, section: Section.NONE, amount: 200 },
    { grade: Grade.SECOND, section: Section.SCIENTIFIC, amount: 250 },
    { grade: Grade.SECOND, section: Section.LITERARY, amount: 230 },
    { grade: Grade.THIRD, section: Section.SCIENTIFIC, amount: 300 },
    { grade: Grade.THIRD, section: Section.LITERARY, amount: 280 }
  ]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsAuthenticated(false);
      setPassword('');
      setAuthError('');
      setSaveMessage('');
    }
  }, [isOpen]);

  // Load current configurations when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadCurrentConfigs();
    }
  }, [isAuthenticated]);

  const loadCurrentConfigs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/payment-config');
      if (response.ok) {
        const data = await response.json();
        if (data.configs && data.configs.length > 0) {
          setConfigs(data.configs);
        }
      }
    } catch (error) {
      console.error('Error loading configs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthentication = async () => {
    setAuthError('');
    
    if (!password) {
      setAuthError('يرجى إدخال كلمة المرور');
      return;
    }

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setPassword('');
      } else {
        setAuthError('كلمة مرور خاطئة');
      }
    } catch (error) {
      setAuthError('خطأ في الاتصال');
    }
  };

  const handleConfigChange = (index: number, amount: number) => {
    const newConfigs = [...configs];
    newConfigs[index].amount = amount;
    setConfigs(newConfigs);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      const response = await fetch('/api/admin/payment-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs })
      });

      if (response.ok) {
        setSaveMessage('تم حفظ الإعدادات بنجاح');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('فشل في حفظ الإعدادات');
      }
    } catch (error) {
      setSaveMessage('خطأ في الاتصال');
    } finally {
      setIsSaving(false);
    }
  };

  const getGradeColor = (grade: Grade) => {
    switch (grade) {
      case Grade.FIRST:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case Grade.SECOND:
        return 'bg-green-100 text-green-800 border-green-200';
      case Grade.THIRD:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSectionColor = (section: Section) => {
    switch (section) {
      case Section.SCIENTIFIC:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case Section.LITERARY:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            إعدادات الدفع
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Settings className="h-5 w-5 text-primary" />
            إعدادات الدفع للصفوف والشعب
          </DialogTitle>
        </DialogHeader>

        {!isAuthenticated ? (
          // Authentication Form
          <Card className="shadow-card">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-lg">تسجيل دخول المدير</CardTitle>
              <p className="text-sm text-muted-foreground">
                يرجى إدخال كلمة مرور المدير للوصول إلى إعدادات الدفع
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">كلمة المرور</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة مرور المدير"
                    className="pr-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleAuthentication()}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {authError && (
                <div className="flex items-center gap-2 text-sm text-error bg-error/10 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  {authError}
                </div>
              )}

              <Button 
                onClick={handleAuthentication} 
                className="w-full"
                disabled={!password}
              >
                <Lock className="h-4 w-4 mr-2" />
                تسجيل الدخول
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Payment Configuration Form
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                قم بتحديد مبلغ الدفع لكل صف وشعبة. سيتم تطبيق هذه المبالغ تلقائياً عند مسح كود الطالب.
              </p>
              {saveMessage && (
                <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                  saveMessage.includes('نجاح') 
                    ? 'text-success bg-success/10' 
                    : 'text-error bg-error/10'
                }`}>
                  {saveMessage.includes('نجاح') ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {saveMessage}
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">جاري تحميل الإعدادات...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {configs.map((config, index) => (
                  <Card key={`${config.grade}-${config.section}`} className="shadow-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={getGradeColor(config.grade)}>
                            {translations[config.grade]}
                          </Badge>
                          {config.section !== Section.NONE && (
                            <Badge variant="outline" className={getSectionColor(config.section)}>
                              {translations[config.section]}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium">المبلغ:</label>
                          <div className="relative">
                            <Input
                              type="number"
                              value={config.amount}
                              onChange={(e) => handleConfigChange(index, Number(e.target.value))}
                              className="w-24 text-center"
                              min="0"
                              step="10"
                            />
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                              ج.م
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                إلغاء
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving || isLoading}
                className="gap-2"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                حفظ الإعدادات
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}