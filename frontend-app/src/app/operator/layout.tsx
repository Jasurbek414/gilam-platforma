'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import OperatorSidebar from '@/components/layout/OperatorSidebar';
import Topbar from '@/components/layout/Topbar';
import { ChatProvider } from '@/context/ChatContext';
import { getUser } from '@/lib/api';

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  // Login sahifasi: auth tekshirilmaydi — to'g'ridan children ko'rsatiladi
  const isLoginPage = pathname === '/operator/login';

  useEffect(() => {
    if (isLoginPage) {
      setAuthorized(true);
      return;
    }
    const user = getUser();
    if (!user || user.role !== 'OPERATOR') {
      router.replace('/operator/login');
    } else {
      setAuthorized(true);
    }
  }, [router, isLoginPage]);

  // Login sahifasida sidebar/topbar ko'rsatilmaydi
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ChatProvider>
      <div className="flex bg-slate-50 min-h-screen">
        <OperatorSidebar />
        <div className="flex-1 ml-72 flex flex-col min-h-screen">
          <Topbar />
          <main className="flex-1 p-3 lg:p-4 overflow-auto bg-slate-50/50">
            <div className="w-full h-full">{children}</div>
          </main>
        </div>
      </div>
    </ChatProvider>
  );
}
