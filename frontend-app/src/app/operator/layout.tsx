'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OperatorSidebar from '@/components/layout/OperatorSidebar';
import Topbar from '@/components/layout/Topbar';
import { ChatProvider } from '@/context/ChatContext';
import { getUser, getLoginPath } from '@/lib/api';

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== 'OPERATOR') {
      router.replace(getLoginPath());
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
