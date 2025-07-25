// src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { AdminDashboard } from '@/components/admin-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if already authenticated (in a real app, this would check session/token)
  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin-authenticated') === 'true';
    setIsAuthenticated(isAuth);
  }, []);

  const handleAuthentication = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (response.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin-authenticated', 'true');
        setPassword('');
      } else {
        setError('كلمة مرور خاطئة');
      }
    } catch (error) {
      setError('خطأ في الاتصال');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin-authenticated');
    setPassword('');
    setError('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary-light/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-elevated">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              دخول المدير
            </CardTitle>
            <p className="text-muted-foreground">
              يرجى إدخال كلمة مرور المدير للوصول إلى لوحة الإدارة
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">كلمة المرور</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة مرور المدير"
                  className="pr-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleAuthentication()}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-error bg-error/10 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button 
              onClick={handleAuthentication} 
              className="w-full"
              disabled={!password || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  جاري التحقق...
                </div>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  دخول لوحة الإدارة
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                كلمة المرور الافتراضية: admin000
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary-light/20 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with logout */}
        <div className="flex justify-between items-center mb-6">
          <div></div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <Shield className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>

        {/* Admin Dashboard */}
        <AdminDashboard />
      </div>
    </div>
  );
}