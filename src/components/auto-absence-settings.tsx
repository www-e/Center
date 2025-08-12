// src/components/auto-absence-settings.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Clock, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Settings,
  RefreshCw
} from 'lucide-react';

interface AutoAbsenceStatus {
  gracePeriod: number;
}

export function AutoAbsenceSettings() {
  const [gracePeriod, setGracePeriod] = useState(15);
  const [currentGracePeriod, setCurrentGracePeriod] = useState(15);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      // Note: We no longer fetch status, as the scheduler is always on.
      // We will fetch the grace period directly if an endpoint existed for just that.
      // For now, we will simulate this with a default.
      // In a real scenario, you'd have a GET endpoint for '/api/admin/auto-absence/settings'.
      setCurrentGracePeriod(15); // Simulating fetch
      setGracePeriod(15); // Simulating fetch
    } catch (error) {
      console.error('Error loading auto-absence settings:', error);
      showMessage('error', 'خطأ في تحميل الإعدادات');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async () => {
    if (gracePeriod < 5 || gracePeriod > 60) {
      showMessage('error', 'المدة يجب أن تكون بين 5 و 60 دقيقة');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/auto-absence/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gracePeriod })
      });

      const result = await response.json();
      
      if (result.success) {
        setCurrentGracePeriod(gracePeriod);
        showMessage('success', 'تم حفظ الإعدادات بنجاح');
      } else {
        showMessage('error', result.message || 'خطأ في حفظ الإعدادات');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('error', 'خطأ في الاتصال');
    } finally {
      setIsSaving(false);
    }
  };

  const runManualCheck = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/auto-absence/run', {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.success) {
        showMessage('success', `تم تشغيل الفحص اليدوي - تم تسجيل ${result.data.marked} طالب كغائب`);
        // No need to reload settings, but you might want to refresh stats elsewhere
      } else {
        showMessage('error', result.message || 'خطأ في تشغيل الفحص');
      }
    } catch (error) {
      console.error('Error running manual check:', error);
      showMessage('error', 'خطأ في الاتصال');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-muted/30">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">حالة النظام</span>
            <Badge className="bg-success/10 text-success border-success/20">نشط دائماً</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">المدة الحالية</span>
            <span className="text-sm font-medium text-foreground">{currentGracePeriod} دقيقة</span>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <label className="text-sm font-medium text-foreground">تعديل مدة السماح (بالدقائق)</label>
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              type="number"
              min="5"
              max="60"
              value={gracePeriod}
              onChange={(e) => setGracePeriod(parseInt(e.target.value) || 15)}
              className="text-center"
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground mt-1">بين 5 و 60 دقيقة</p>
          </div>
          <Button 
            onClick={saveSettings}
            disabled={isSaving || gracePeriod === currentGracePeriod}
            className="px-6"
          >
            {isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="mr-2">حفظ</span>
          </Button>
        </div>
      </div>

      <div>
        <Button
          onClick={runManualCheck}
          disabled={isLoading}
          variant="outline"
          className="w-full"
        >
          <Settings className="h-4 w-4 mr-2" />
          تشغيل فحص يدوي الآن
        </Button>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-success/10 text-success border border-success/20' 
            : 'bg-error/10 text-error border border-error/20'
        }`}>
          {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}
    </div>
  );
}


// The AutoAbsenceStats component is still needed and doesn't need changes.
// To avoid deleting it by mistake, here is its code again.

export function AutoAbsenceStats() {
  const [stats, setStats] = useState({
    todayMarked: 0,
    weekMarked: 0,
    monthMarked: 0,
    overrides: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/auto-absence/stats');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error loading auto-absence stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">غياب اليوم</span>
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
          {stats.todayMarked}
        </Badge>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">غياب الأسبوع</span>
        <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
          {stats.weekMarked}
        </Badge>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">غياب الشهر</span>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          {stats.monthMarked}
        </Badge>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">تم تصحيحها</span>
        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
          {stats.overrides}
        </Badge>
      </div>
    </div>
  );
}