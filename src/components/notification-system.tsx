// src/components/notification-system.tsx
'use client';

import { useState, useEffect ,useCallback} from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  XCircle, 
  X 
} from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

interface NotificationSystemProps {
  notifications?: Notification[];
  onDismiss?: (id: string) => void;
}

export function NotificationSystem({ notifications = [], onDismiss }: NotificationSystemProps) {
  const searchParams = useSearchParams();
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);

  // Check for URL-based notifications (success, error, etc.)
  useEffect(() => {
    const urlNotifications: Notification[] = [];
    
    const success = searchParams.get('success');
    if (success) {
      urlNotifications.push({
        id: 'url-success',
        type: 'success',
        title: 'تم بنجاح',
        message: success,
        duration: 5000
      });
    }
    
    const error = searchParams.get('error');
    if (error) {
      urlNotifications.push({
        id: 'url-error',
        type: 'error',
        title: 'خطأ',
        message: error,
        persistent: true
      });
    }
    
    const warning = searchParams.get('warning');
    if (warning) {
      urlNotifications.push({
        id: 'url-warning',
        type: 'warning',
        title: 'تنبيه',
        message: warning,
        duration: 7000
      });
    }
    
    const info = searchParams.get('info');
    if (info) {
      urlNotifications.push({
        id: 'url-info',
        type: 'info',
        title: 'معلومة',
        message: info,
        duration: 4000
      });
    }
    
    if (urlNotifications.length > 0) {
      setLocalNotifications(urlNotifications);
    }
  }, [searchParams]);
  const handleDismiss = useCallback((id: string) => {
    if (onDismiss) {
      onDismiss(id);
    }
    setLocalNotifications(prev => prev.filter(n => n.id !== id));
  }, [onDismiss]);
  // Auto-dismiss notifications
  useEffect(() => {
    const allNotifications = [...notifications, ...localNotifications];
    
    allNotifications.forEach(notification => {
      if (notification.duration && !notification.persistent) {
        const timer = setTimeout(() => {
          handleDismiss(notification.id);
        }, notification.duration);
        
        return () => clearTimeout(timer);
      }
    });
  }, [notifications, localNotifications, handleDismiss]);



  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-error" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'info':
        return <Info className="h-5 w-5 text-info" />;
    }
  };

  const getNotificationStyles = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-success/10 border-success/20 text-success';
      case 'error':
        return 'bg-error/10 border-error/20 text-error';
      case 'warning':
        return 'bg-warning/10 border-warning/20 text-warning';
      case 'info':
        return 'bg-info/10 border-info/20 text-info';
    }
  };

  const allNotifications = [...notifications, ...localNotifications];

  if (allNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {allNotifications.map((notification) => (
        <Card
          key={notification.id}
          className={`shadow-lg border-2 animate-fade-in ${getNotificationStyles(notification.type)}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                {notification.title && (
                  <h4 className="font-semibold text-sm mb-1">
                    {notification.title}
                  </h4>
                )}
                <p className="text-sm leading-relaxed">
                  {notification.message}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(notification.id)}
                className="flex-shrink-0 h-6 w-6 p-0 hover:bg-black/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll
  };
}