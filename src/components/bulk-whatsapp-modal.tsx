// src/components/bulk-whatsapp-modal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageCircle, 
  Users, 
  Send, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Copy,
  Download
} from 'lucide-react';
import { messageTemplates, generateBulkWhatsAppUrls, BulkMessageOptions } from '@/lib/whatsapp-utils';
import { Student } from '@prisma/client';

interface BulkWhatsAppModalProps {
  students: Student[];
  trigger?: React.ReactNode;
}

export function BulkWhatsAppModal({ students, trigger }: BulkWhatsAppModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [messageType, setMessageType] = useState<'student' | 'parent'>('student');
  const [templateType, setTemplateType] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [generatedUrls, setGeneratedUrls] = useState<Array<{
    name: string;
    phone: string;
    url: string;
    type: 'student' | 'parent';
  }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedStudents([]);
      setTemplateType('');
      setCustomMessage('');
      setGeneratedUrls([]);
    }
  }, [isOpen]);

  const handleStudentSelection = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  const handleTemplateChange = (template: string) => {
    setTemplateType(template);
    if (template && messageTemplates[messageType][template as keyof typeof messageTemplates[typeof messageType]]) {
      // Show preview of template
      const templateFunc = messageTemplates[messageType][template as keyof typeof messageTemplates[typeof messageType]] as Function;
      const preview = templateFunc('اسم الطالب');
      setCustomMessage(preview);
    }
  };

  const generateUrls = () => {
    setIsGenerating(true);
    
    try {
      const selectedStudentData = students.filter(s => selectedStudents.includes(s.id));
      
      const recipients = selectedStudentData.map(student => ({
        phone: messageType === 'student' ? student.phone : student.parentPhone,
        name: student.name,
        type: messageType
      }));

      const options: BulkMessageOptions = {
        recipients,
        template: templateType,
        customMessage: customMessage || undefined
      };

      const urls = generateBulkWhatsAppUrls(options);
      setGeneratedUrls(urls);
    } catch (error) {
      console.error('Error generating URLs:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const openAllUrls = () => {
    generatedUrls.forEach((item, index) => {
      setTimeout(() => {
        window.open(item.url, '_blank');
      }, index * 1000); // Delay each URL by 1 second to avoid blocking
    });
  };

  const copyAllUrls = () => {
    const urlText = generatedUrls.map(item => 
      `${item.name}: ${item.url}`
    ).join('\n');
    
    navigator.clipboard.writeText(urlText);
  };

  const downloadUrls = () => {
    const csvContent = [
      'الاسم,النوع,رقم الهاتف,رابط WhatsApp',
      ...generatedUrls.map(item => 
        `${item.name},${item.type === 'student' ? 'طالب' : 'ولي أمر'},${item.phone},"${item.url}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `whatsapp-links-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getTemplateOptions = () => {
    return Object.keys(messageTemplates[messageType]).map(key => ({
      value: key,
      label: key === 'welcome' ? 'رسالة ترحيب' :
             key === 'reminder' ? 'تذكير بالحصة' :
             key === 'absence' ? 'إشعار غياب' :
             key === 'payment' ? 'تذكير دفع' :
             key === 'congratulations' ? 'تهنئة' :
             key === 'progress' ? 'تقرير تقدم' :
             key === 'meeting' ? 'دعوة اجتماع' :
             key === 'emergency' ? 'إشعار عاجل' : key
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <MessageCircle className="h-4 w-4" />
            رسائل جماعية
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <MessageCircle className="h-5 w-5 text-primary" />
            إرسال رسائل WhatsApp جماعية
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Message Configuration */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">إعداد الرسالة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">نوع المستقبل</label>
                  <Select value={messageType} onValueChange={(value: 'student' | 'parent') => setMessageType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">الطلاب</SelectItem>
                      <SelectItem value="parent">أولياء الأمور</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">قالب الرسالة</label>
                  <Select value={templateType} onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر قالب رسالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">رسالة مخصصة</SelectItem>
                      {getTemplateOptions().map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">نص الرسالة</label>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  سيتم استبدال "اسم الطالب" بالاسم الفعلي لكل طالب
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Student Selection */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">اختيار الطلاب</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {selectedStudents.length} من {students.length}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedStudents.length === students.length ? 'إلغاء الكل' : 'اختيار الكل'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {students.map(student => (
                  <div key={student.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={(e) => handleStudentSelection(student.id, e.target.checked)}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {messageType === 'student' ? student.phone : student.parentPhone}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generate URLs */}
          <div className="flex justify-center">
            <Button
              onClick={generateUrls}
              disabled={selectedStudents.length === 0 || !customMessage || isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              إنشاء روابط WhatsApp
            </Button>
          </div>

          {/* Generated URLs */}
          {generatedUrls.length > 0 && (
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">روابط WhatsApp المُنشأة</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyAllUrls} className="gap-2">
                      <Copy className="h-4 w-4" />
                      نسخ الكل
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadUrls} className="gap-2">
                      <Download className="h-4 w-4" />
                      تحميل CSV
                    </Button>
                    <Button onClick={openAllUrls} className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      فتح الكل
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {generatedUrls.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.phone}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(item.url, '_blank')}
                        className="gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        فتح
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}