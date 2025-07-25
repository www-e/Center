// src/app/api/admin/payment-config/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAllPaymentConfigs, updatePaymentConfigs, getAllGradeSectionCombinations } from '@/lib/payment-config';

export async function GET() {
  try {
    const configs = await getAllPaymentConfigs();
    
    // If no configs exist, return default combinations
    if (configs.length === 0) {
      const defaultConfigs = getAllGradeSectionCombinations();
      return NextResponse.json({ configs: defaultConfigs });
    }
    
    return NextResponse.json({ configs });
  } catch (error) {
    console.error('Error fetching payment configs:', error);
    return NextResponse.json(
      { error: 'فشل في تحميل إعدادات الدفع' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { configs } = await request.json();
    
    if (!configs || !Array.isArray(configs)) {
      return NextResponse.json(
        { error: 'بيانات الإعدادات غير صحيحة' },
        { status: 400 }
      );
    }
    
    // Validate each config
    for (const config of configs) {
      if (!config.grade || !config.section || typeof config.amount !== 'number' || config.amount < 0) {
        return NextResponse.json(
          { error: 'بيانات الإعدادات غير مكتملة أو غير صحيحة' },
          { status: 400 }
        );
      }
    }
    
    await updatePaymentConfigs(configs);
    
    return NextResponse.json({ 
      success: true, 
      message: 'تم حفظ إعدادات الدفع بنجاح' 
    });
  } catch (error) {
    console.error('Error updating payment configs:', error);
    return NextResponse.json(
      { error: 'فشل في حفظ إعدادات الدفع' },
      { status: 500 }
    );
  }
}