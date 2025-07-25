// src/components/student-form.tsx
'use client';

import { useActionState, useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createStudent } from '@/lib/actions';
import { scheduleData, translations } from '@/lib/constants';
import { Grade, Section, GroupDay, PaymentPref } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, GraduationCap, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { getRealTimeValidation, handlePhoneInput } from '@/lib/phone-validation';

export function StudentForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editStudentId = searchParams.get('edit');
  const isEditMode = !!editStudentId;

  const initialState = { message: '', errors: {} };
  const [state, dispatch] = useActionState(createStudent, initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [editStudent, setEditStudent] = useState<any>(null);

  // Form state management
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    parentPhone: '',
    grade: Grade.FIRST,
    section: Section.NONE,
    groupDay: GroupDay.SAT_TUE,
    groupTime: '',
    paymentPref: PaymentPref.PREPAID
  });

  // Real-time student ID preview
  const [studentIdPreview, setStudentIdPreview] = useState('');

  // Load student data in edit mode
  useEffect(() => {
    if (isEditMode && editStudentId) {
      setIsLoading(true);
      fetch(`/api/students/${editStudentId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const student = data.student;
            setEditStudent(student);
            setFormData({
              name: student.name,
              phone: student.phone,
              parentPhone: student.parentPhone,
              grade: student.grade,
              section: student.section,
              groupDay: student.groupDay,
              groupTime: student.groupTime,
              paymentPref: student.paymentPref
            });
            setStudentIdPreview(student.studentId);
          }
        })
        .catch(error => {
          console.error('Error loading student:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isEditMode, editStudentId]);

  // Form validation states
  const [fieldValidation, setFieldValidation] = useState({
    name: { valid: false, message: '' },
    phone: { valid: false, message: '' },
    parentPhone: { valid: false, message: '' },
    groupTime: { valid: false, message: '' }
  });

  // Generate real-time student ID preview
  useEffect(() => {
    const generatePreview = () => {
      if (formData.name.trim()) {
        const gradeNumber = formData.grade === Grade.FIRST ? 1 : formData.grade === Grade.SECOND ? 2 : 3;
        // Simulate counting students (in real app, this would be an API call)
        const nextNumber = (1).toString().padStart(4, '0');
        setStudentIdPreview(`std${gradeNumber}${nextNumber}`);
      } else {
        setStudentIdPreview('');
      }
    };
    generatePreview();
  }, [formData.grade, formData.name]);

  // Real-time validation
  useEffect(() => {
    const validateField = (field: string, value: string) => {
      switch (field) {
        case 'name':
          if (value.length < 3) {
            return { valid: false, message: 'الاسم يجب أن يكون 3 أحرف على الأقل' };
          }
          return { valid: true, message: 'اسم صحيح' };
        case 'phone':
        case 'parentPhone':
          const phoneValidation = getRealTimeValidation(value);
          return { 
            valid: phoneValidation.isValid, 
            message: phoneValidation.message 
          };
        default:
          return { valid: false, message: '' };
      }
    };

    const newValidation = { ...fieldValidation };
    Object.keys(formData).forEach(field => {
      if (['name', 'phone', 'parentPhone'].includes(field)) {
        newValidation[field as keyof typeof fieldValidation] = validateField(field, formData[field as keyof typeof formData] as string);
      }
    });
    newValidation.groupTime = { 
      valid: formData.groupTime !== '', 
      message: formData.groupTime ? 'ميعاد محدد' : 'يرجى اختيار ميعاد' 
    };

    setFieldValidation(newValidation);
  }, [formData]);

  // Reset dependent fields when grade changes
  useEffect(() => {
    const defaultSection = scheduleData[formData.grade].sections[0];
    setFormData(prev => ({ ...prev, section: defaultSection, groupTime: '' }));
  }, [formData.grade]);

  // Reset group time when groupDay changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, groupTime: '' }));
  }, [formData.groupDay]);

  const sectionOptions = useMemo(() => scheduleData[formData.grade].sections, [formData.grade]);
  
  const groupDayOptions = useMemo(() => {
    if (formData.grade === Grade.THIRD) {
      if (formData.section === Section.SCIENTIFIC) return Object.keys(scheduleData[formData.grade].groupDays.SCIENTIFIC);
      if (formData.section === Section.LITERARY) return Object.keys(scheduleData[formData.grade].groupDays.LITERARY);
      return [];
    }
    return Object.keys(scheduleData[formData.grade].groupDays);
  }, [formData.grade, formData.section]);

  const groupTimeOptions = useMemo(() => {
    try {
      if (formData.grade === Grade.THIRD) {
        if (formData.section === Section.SCIENTIFIC) return scheduleData[formData.grade].groupDays.SCIENTIFIC[formData.groupDay as 'SAT_TUE_THU'];
        if (formData.section === Section.LITERARY) return scheduleData[formData.grade].groupDays.LITERARY[formData.groupDay as 'SUN_WED'];
        return [];
      }
      return scheduleData[formData.grade].groupDays[formData.groupDay as 'SAT_TUE' | 'SUN_WED' | 'MON_THU'];
    } catch {
      return [];
    }
  }, [formData.grade, formData.section, formData.groupDay]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (formDataObj: FormData) => {
    // Add all current form data to FormData object
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.set(key, value);
    });
    dispatch(formDataObj);
  };

  const isFormValid = Object.values(fieldValidation).every(field => field.valid) && formData.groupTime;

  // Loading state for edit mode
  if (isEditMode && isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-light to-secondary-light p-4 flex items-center justify-center">
        <Card className="shadow-elevated">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">جاري تحميل بيانات الطالب</h3>
            <p className="text-muted-foreground">يرجى الانتظار...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-secondary-light p-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button for Edit Mode */}
        {isEditMode && (
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.push('/students')}
              className="flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              العودة لقائمة الطلاب
            </Button>
          </div>
        )}

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-4">
            {isEditMode ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}
          </h1>
          <p className="text-lg text-muted-foreground">
            {isEditMode 
              ? 'قم بتعديل بيانات الطالب وحفظ التغييرات'
              : 'أضف بيانات الطالب وسيتم إنشاء كود الطالب تلقائياً'
            }
          </p>
          
          {/* Edit Mode Notification */}
          {isEditMode && (
            <div className="mt-4 p-4 bg-warning/10 border border-warning/20 rounded-lg max-w-md mx-auto">
              <div className="flex items-center gap-2 text-warning">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">وضع التعديل</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                أنت تقوم بتعديل بيانات طالب موجود. تأكد من صحة البيانات قبل الحفظ.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Real-time Student ID Preview */}
          <div className="lg:col-span-1">
            <Card className="glass-effect sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <GraduationCap className="h-5 w-5" />
                  {isEditMode ? 'بيانات الطالب' : 'معاينة كود الطالب'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 hover-lift">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <div className="font-mono text-2xl font-bold text-primary mb-2">
                    {studentIdPreview || 'std10001'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formData.name || 'اسم الطالب'}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>الصف:</span>
                    <span className="font-medium">{translations[formData.grade]}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>الشعبة:</span>
                    <span className="font-medium">{translations[formData.section]}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>الأيام:</span>
                    <span className="font-medium">{translations[formData.groupDay]}</span>
                  </div>
                  {formData.groupTime && (
                    <div className="flex items-center justify-between">
                      <span>الميعاد:</span>
                      <span className="font-medium">{formData.groupTime}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-elevated">
              <CardContent className="p-8">
                <form action={handleSubmit} className="space-y-8" dir="rtl">
                  {/* Personal Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold text-foreground">البيانات الشخصية</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name Field */}
                      <div className="form-floating">
                        <Input
                          type="text"
                          name="name"
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder=" "
                          className={`form-control focus-ring ${fieldValidation.name.valid ? 'border-success' : formData.name ? 'border-error' : ''}`}
                          required
                        />
                        <label htmlFor="name" className="text-muted-foreground">اسم الطالب</label>
                        {formData.name && (
                          <div className={`flex items-center gap-1 mt-1 text-xs ${fieldValidation.name.valid ? 'text-success' : 'text-error'}`}>
                            {fieldValidation.name.valid ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                            {fieldValidation.name.message}
                          </div>
                        )}
                        {state.errors?.name && <p className="text-error text-xs mt-1">{state.errors.name[0]}</p>}
                      </div>

                      {/* Phone Field */}
                      <div className="form-floating">
                        <Input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => {
                            const formattedValue = handlePhoneInput(e.target.value);
                            handleInputChange('phone', formattedValue);
                          }}
                          placeholder=" "
                          maxLength={11}
                          className={`form-control focus-ring ${fieldValidation.phone.valid ? 'border-success' : formData.phone ? 'border-error' : ''}`}
                          required
                        />
                        <label htmlFor="phone" className="text-muted-foreground">رقم هاتف الطالب</label>
                        {formData.phone && (
                          <div className={`flex items-center gap-1 mt-1 text-xs ${fieldValidation.phone.valid ? 'text-success' : 'text-error'}`}>
                            {fieldValidation.phone.valid ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                            {fieldValidation.phone.message}
                          </div>
                        )}
                        {state.errors?.phone && <p className="text-error text-xs mt-1">{state.errors.phone[0]}</p>}
                      </div>

                      {/* Parent Phone Field */}
                      <div className="form-floating md:col-span-2">
                        <Input
                          type="tel"
                          name="parentPhone"
                          id="parentPhone"
                          value={formData.parentPhone}
                          onChange={(e) => {
                            const formattedValue = handlePhoneInput(e.target.value);
                            handleInputChange('parentPhone', formattedValue);
                          }}
                          placeholder=" "
                          maxLength={11}
                          className={`form-control focus-ring ${fieldValidation.parentPhone.valid ? 'border-success' : formData.parentPhone ? 'border-error' : ''}`}
                          required
                        />
                        <label htmlFor="parentPhone" className="text-muted-foreground">رقم هاتف ولي الأمر</label>
                        {formData.parentPhone && (
                          <div className={`flex items-center gap-1 mt-1 text-xs ${fieldValidation.parentPhone.valid ? 'text-success' : 'text-error'}`}>
                            {fieldValidation.parentPhone.valid ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                            {fieldValidation.parentPhone.message}
                          </div>
                        )}
                        {state.errors?.parentPhone && <p className="text-error text-xs mt-1">{state.errors.parentPhone[0]}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Academic Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold text-foreground">البيانات الأكاديمية</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Grade Field */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">الصف الدراسي</label>
                        <Select
                          name="grade"
                          value={formData.grade}
                          onValueChange={(value) => handleInputChange('grade', value)}
                        >
                          <SelectTrigger className="w-full focus-ring">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(Grade).map(g => (
                              <SelectItem key={g} value={g}>{translations[g]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Section Field */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">الشعبة</label>
                        <Select
                          name="section"
                          value={formData.section}
                          onValueChange={(value) => handleInputChange('section', value)}
                          disabled={sectionOptions.length <= 1}
                        >
                          <SelectTrigger className="w-full focus-ring">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {sectionOptions.map(s => (
                              <SelectItem key={s} value={s}>{translations[s as Section]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Group Day Field */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">مجموعة الأيام</label>
                        <Select
                          name="groupDay"
                          value={formData.groupDay}
                          onValueChange={(value) => handleInputChange('groupDay', value)}
                        >
                          <SelectTrigger className="w-full focus-ring">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(groupDayOptions as string[]).map(gd => (
                              <SelectItem key={gd} value={gd}>{translations[gd as GroupDay]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Group Time Field */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">ميعاد المجموعة</label>
                        <Select
                          name="groupTime"
                          value={formData.groupTime}
                          onValueChange={(value) => handleInputChange('groupTime', value)}
                          disabled={groupTimeOptions.length === 0}
                        >
                          <SelectTrigger className={`w-full focus-ring ${fieldValidation.groupTime.valid ? 'border-success' : formData.groupTime ? 'border-error' : ''}`}>
                            <SelectValue placeholder="اختر ميعاد المجموعة" />
                          </SelectTrigger>
                          <SelectContent>
                            {groupTimeOptions?.map(gt => (
                              <SelectItem key={gt} value={gt}>{gt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formData.groupTime && (
                          <div className={`flex items-center gap-1 mt-1 text-xs ${fieldValidation.groupTime.valid ? 'text-success' : 'text-error'}`}>
                            {fieldValidation.groupTime.valid ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                            {fieldValidation.groupTime.message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold text-foreground">طريقة الدفع</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">تفضيل الدفع</label>
                        <Select
                          name="paymentPref"
                          value={formData.paymentPref}
                          onValueChange={(value) => handleInputChange('paymentPref', value)}
                        >
                          <SelectTrigger className="w-full focus-ring">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(PaymentPref).map(p => (
                              <SelectItem key={p} value={p}>{translations[p]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  {state.message && (
                    <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-error" />
                        <p className="text-error font-medium">{state.message}</p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-center pt-6">
                    <Button
                      type="submit"
                      disabled={!isFormValid}
                      className={`px-8 py-3 text-lg font-semibold rounded-xl transition-all ${
                        isFormValid
                          ? 'bg-gradient-primary text-white hover:shadow-lg hover-lift'
                          : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }`}
                    >
                      <User className="h-5 w-5 mr-2" />
                      {isEditMode ? 'حفظ التغييرات' : 'حفظ بيانات الطالب'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
