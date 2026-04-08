'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CompanySidebar from '@/components/layout/CompanySidebar';
import Topbar from '@/components/layout/Topbar';
import { getUser, getLoginPath } from '@/lib/api';

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'COMPANY_ADMIN') {
      router.replace('/');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <CompanySidebar />
      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6 md:p-10 overflow-auto bg-slate-50/50">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
