// src/components/student-controls.tsx
'use client';

import { useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { translations, scheduleData } from '@/lib/constants';
import { Grade, GroupDay, Section } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Users, UserPlus, X } from 'lucide-react';
import Link from 'next/link';

export function StudentControls({ totalStudents }: { totalStudents: number }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [showFilters, setShowFilters] = useState(false);

  // Current filter values
  const currentSearch = searchParams.get('search') || '';
  const currentGrade = searchParams.get('grade') as Grade | null;
  const currentSection = searchParams.get('section') as Section | null;
  const currentGroupDay = searchParams.get('groupDay') as GroupDay | null;
  const currentPage = parseInt(searchParams.get('page') || '1');
  const studentsPerPage = parseInt(searchParams.get('perPage') || '10');

  function handleFilterChange(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    
    if (value === 'ALL' || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    // Reset to page 1 when filters change
    params.set('page', '1');
    
    // Clear dependent filters
    if (key === 'grade') {
      params.delete('section');
      params.delete('groupDay');
    }
    
    replace(`${pathname}?${params.toString()}`);
  }

  function handleSearch(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    params.set('page', '1'); // Reset to page 1
    replace(`${pathname}?${params.toString()}`);
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    replace(`${pathname}?${params.toString()}`);
  }

  function handlePerPageChange(perPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set('perPage', perPage.toString());
    params.set('page', '1'); // Reset to page 1
    replace(`${pathname}?${params.toString()}`);
  }

  function clearAllFilters() {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('perPage', studentsPerPage.toString());
    replace(`${pathname}?${params.toString()}`);
  }

  const activeFiltersCount = [currentSearch, currentGrade, currentSection, currentGroupDay].filter(Boolean).length;
  const totalPages = Math.ceil(totalStudents / studentsPerPage);
  const sectionOptions = currentGrade ? scheduleData[currentGrade].sections : [];
  const groupDayOptions = currentGrade ? Object.keys(scheduleData[currentGrade].groupDays) : [];

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <Card className="modern-card">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4" dir="rtl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">إدارة الطلاب ({totalStudents})</h1>
                <p className="text-xs text-muted-foreground">
                  {activeFiltersCount > 0 ? `${activeFiltersCount} فلتر نشط` : 'عرض جميع الطلاب'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                فلاتر
              </Button>
              
              <Button asChild size="sm" className="bg-primary text-white hover:bg-primary/90">
                <Link href="/students/add" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  إضافة طالب
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card className="modern-card">
        <CardContent className="p-4">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="البحث عن الطلاب بالاسم أو رقم الهاتف..."
              value={currentSearch}
              onChange={(e) => handleSearch(e.target.value)}
              className="pr-10 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Compact Filters */}
          {showFilters && (
            <Card className="modern-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">فلاتر البحث</h3>
                  {activeFiltersCount > 0 && (
                    <Button
                      onClick={clearAllFilters}
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4 mr-1" />
                      مسح ({activeFiltersCount})
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Grade Filter */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">الصف</label>
                    <select
                      value={currentGrade ?? 'ALL'}
                      onChange={(e) => handleFilterChange('grade', e.target.value)}
                      className="w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="ALL">الكل</option>
                      {Object.values(Grade).map(g => (
                        <option key={g} value={g}>{translations[g]}</option>
                      ))}
                    </select>
                  </div>

                  {/* Section Filter */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">الشعبة</label>
                    <select
                      value={currentSection ?? 'ALL'}
                      onChange={(e) => handleFilterChange('section', e.target.value)}
                      disabled={!currentGrade || sectionOptions.length <= 1}
                      className="w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-primary/20 disabled:bg-muted"
                    >
                      <option value="ALL">الكل</option>
                      {sectionOptions.map(s => (
                        <option key={s} value={s}>{translations[s as Section]}</option>
                      ))}
                    </select>
                  </div>

                  {/* Group Day Filter */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">الأيام</label>
                    <select
                      value={currentGroupDay ?? 'ALL'}
                      onChange={(e) => handleFilterChange('groupDay', e.target.value)}
                      disabled={!currentGrade}
                      className="w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-primary/20 disabled:bg-muted"
                    >
                      <option value="ALL">الكل</option>
                      {groupDayOptions.map(gd => (
                        <option key={gd} value={gd}>{translations[gd as GroupDay]}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">عرض</span>
              <select
                value={studentsPerPage}
                onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary/20"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-muted-foreground">طالب لكل صفحة</span>
            </div>

            {/* Pagination Buttons */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  variant="outline"
                  size="sm"
                >
                  السابق
                </Button>
                
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const page = i + 1;
                    const isCurrentPage = page === currentPage;
                    return (
                      <Button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        variant={isCurrentPage ? "default" : "outline"}
                        size="sm"
                        className={isCurrentPage ? "bg-primary text-white" : ""}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  variant="outline"
                  size="sm"
                >
                  التالي
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
