'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import OperatorSidebar, { MobileMenuButton } from '@/components/layout/OperatorSidebar';
import Topbar from '@/components/layout/Topbar';
import { ChatProvider } from '@/context/ChatContext';
import { getUser } from '@/lib/api';
import { useCallsSocket } from '@/hooks/useCallsSocket';
import IncomingCallModal from '@/components/calls/IncomingCallModal';

/**
 * OperatorLayout — Responsive operator panel layout.
 *
 * Vazifalar:
 * 1. Auth guard — faqat OPERATOR role'li foydalanuvchilarga ruxsat
 * 2. Responsive sidebar — mobilda drawer, desktopda fixed
 * 3. WebSocket listener — kiruvchi qo'ng'iroq modali
 */

function OperatorLayoutInner({ children }: { children: React.ReactNode }) {
  const { incomingCall, dismissIncomingCall } = useCallsSocket();

  return (
    <>
      {children}
      {incomingCall && (
        <IncomingCallModal
          event={incomingCall}
          onDismiss={dismissIncomingCall}
          onCompleted={dismissIncomingCall}
        />
      )}
    </>
  );
}

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname === '/operator/login';

  useEffect(() => {
    if (isLoginPage) {
      setAuthorized(true);
      return;
    }
    const user = getUser();
    if (!user || user.role !== 'OPERATOR') {
      setTimeout(() => router.replace('/operator/login'), 0);
    } else {
      setAuthorized(true);
    }
  }, [router, isLoginPage]);

  if (isLoginPage) return <>{children}</>;

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
        {/* Responsive sidebar */}
        <OperatorSidebar
          mobileOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content area — ml-0 on mobile, ml-64/72 on desktop */}
        <div className="flex-1 lg:ml-64 xl:ml-72 flex flex-col min-h-screen w-full">

          {/* Topbar with mobile menu button */}
          <header className="h-14 lg:h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center gap-3 px-4 lg:px-8 sticky top-0 z-40">
            <MobileMenuButton onClick={() => setSidebarOpen(true)} />
            <div className="flex-1">
              <Topbar />
            </div>
          </header>

          <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto bg-slate-50/50">
            <div className="w-full h-full max-w-[1600px] mx-auto">
              <OperatorLayoutInner>
                {children}
              </OperatorLayoutInner>
            </div>
          </main>
        </div>
      </div>
    </ChatProvider>
  );
}
