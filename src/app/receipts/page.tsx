// src/app/receipts/page.tsx
import { Suspense } from 'react';
import { ReceiptsView } from '@/components/receipts-view';

// Loading component for a better UX
function ReceiptsLoading() {
  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto">
        <div className="animate-pulse">
          <div className="h-24 bg-muted rounded-2xl mb-8"></div>
          <div className="h-16 bg-muted rounded-xl mb-8"></div>
          <div className="h-96 bg-muted rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}

export default async function ReceiptsPage({ 
  searchParams 
}: { 
  searchParams?: { [key: string]: string | string[] | undefined } 
}) {
  const resolvedSearchParams = searchParams || {};
  
  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto">
        <Suspense fallback={<ReceiptsLoading />}>
          <ReceiptsView searchParams={resolvedSearchParams} />
        </Suspense>
      </div>
    </div>
  );
}
