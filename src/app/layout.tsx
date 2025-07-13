import Link from 'next/link';  // Add this line

<header className="bg-white dark:bg-gray-800 shadow-md">
  <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
    <div className="text-xl font-bold text-primary"> {/* Updated to primary color */}
      <Link href="/">نظام الحضور</Link>
    </div>
    <div className="flex items-center space-x-4 space-x-reverse">
      <Link href="/students" className="px-4 py-2 rounded-md text-sm font-medium text-foreground hover:bg-neutral transition-smooth">
        الطلاب
      </Link>
      <Link href="/attendance" className="px-4 py-2 rounded-md text-sm font-medium text-foreground hover:bg-neutral transition-smooth">
        الحضور
      </Link>
      <Link href="/payments" className="px-4 py-2 rounded-md text-sm font-medium text-foreground hover:bg-neutral transition-smooth">
        المدفوعات
      </Link>
    </div>
  </nav>
</header>
