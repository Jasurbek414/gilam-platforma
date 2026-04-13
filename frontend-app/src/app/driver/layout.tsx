'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getUser, removeToken } from '@/lib/api';
import Link from 'next/link';

const navItems = [
  { name: 'Buyurtmalar', href: '/driver', icon: '📋', exact: true },
  { name: 'Tarix', href: '/driver/history', icon: '📜' },
  { name: 'Profil', href: '/driver/profile', icon: '👤' },
];

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = getUser();
    if (!u || u.role !== 'DRIVER') {
      removeToken();
      router.push('/driver/login');
      return;
    }
    setUser(u);
  }, [router]);

  // Login sahifasida layout ko'rsatmaslik
  if (pathname === '/driver/login') {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-3 flex items-center justify-between shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚐</span>
          <div>
            <h1 className="text-sm font-black tracking-wide leading-none">HAYDOVCHI</h1>
            <p className="text-[10px] text-emerald-200 font-medium">{user.fullName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-200 font-semibold">Online</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex z-50 shadow-lg">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-3 transition-all ${
                isActive
                  ? 'text-emerald-600 bg-emerald-50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className={`text-[10px] mt-0.5 font-bold uppercase tracking-wider ${isActive ? 'text-emerald-700' : ''}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
