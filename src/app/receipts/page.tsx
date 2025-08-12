// src/app/receipts/page.tsx
import { Suspense } from 'react';
import { ReceiptsViewContent } from '@/components/receipts-view'; // <-- Import the new component
import { getReceiptsForPeriod } from '@/lib/data'; // <-- Data fetching is now safe here

// Loading component for a better UX
function ReceiptsLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-24 bg-muted rounded-2xl mb-8"></div>
      <div className="h-16 bg-muted rounded-xl mb-8"></div>
      <div className="h-96 bg-muted rounded-xl"></div>
    </div>
  );
}

// This is now an async Server Component
export default async function ReceiptsPage({ 
  searchParams 
}: { 
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const resolvedSearchParams = await searchParams || {};
  const year = Number(resolvedSearchParams.year) || new Date().getFullYear();
  const month = Number(resolvedSearchParams.month) || new Date().getMonth() + 1;

  // 1. Fetch data on the server
  const receipts = await getReceiptsForPeriod(year, month);
  
  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto">
        <Suspense fallback={<ReceiptsLoading />}>
          {/* 2. Pass data as props to the Client Component */}
          <ReceiptsViewContent receipts={receipts} year={year} month={month} />
        </Suspense>
      </div>
    </div>
  );
}