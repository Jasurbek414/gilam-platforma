'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getUser, removeToken } from '@/lib/api';
import {
  MdDashboard,
  MdCall,
  MdShoppingCart,
  MdPeople,
  MdLocalShipping,
  MdExitToApp,
  MdChat,
  MdVerifiedUser,
  MdClose,
  MdMenu,
} from 'react-icons/md';

const operatorLinks = [
  { name: 'Dashboard', href: '/operator', icon: MdDashboard },
  { name: "Qo'ng'iroqlar", href: '/operator/calls', icon: MdCall },
  { name: 'Yangi Buyurtma', href: '/operator/orders', icon: MdShoppingCart },
  { name: 'Mijozlar', href: '/operator/customers', icon: MdPeople },
  { name: 'Logistika', href: '/operator/logistics', icon: MdLocalShipping },
  { name: 'Xabarlar', href: '/operator/messages', icon: MdChat },
  { name: 'Sifat Nazorati', href: '/operator/quality', icon: MdVerifiedUser },
];

interface Props {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function OperatorSidebar({ mobileOpen, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [operatorName, setOperatorName] = useState('Operator');
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    const user = getUser();
    if (user?.fullName) setOperatorName(user.fullName);
    if (user?.company?.name) setCompanyName(user.company.name);
  }, []);

  const handleLogout = () => {
    removeToken();
    router.push('/operator/login');
  };

  // Sahifa o'zgarganda mobil menyuni yopish
  useEffect(() => {
    onClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const sidebarContent = (
    <aside className={`
      w-64 lg:w-72 bg-white border-r border-slate-100 flex flex-col h-screen
      fixed left-0 top-0 z-[60]
      transition-transform duration-300 ease-out
      ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0
    `}>
      {/* Header */}
      <div className="p-6 lg:p-8 flex items-center justify-between">
        <Link href="/operator" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <MdCall className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-lg lg:text-xl font-black text-slate-800 tracking-tight leading-none">OPERATOR</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Call-Center</p>
          </div>
        </Link>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all"
        >
          <MdClose className="text-lg" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 lg:px-4 space-y-1 overflow-y-auto">
        {operatorLinks.map((link) => {
          const isBasePath = link.href === '/operator';
          const isActive = isBasePath
            ? pathname === link.href
            : (pathname === link.href || pathname.startsWith(`${link.href}/`));
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 lg:py-3.5 rounded-2xl font-bold transition-all text-sm ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="text-xl flex-shrink-0" />
              <span className="truncate">{link.name}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div className="p-3 lg:p-4 mt-auto">
        <div className="bg-slate-50 rounded-2xl lg:rounded-3xl p-3 lg:p-4 border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center font-black text-indigo-600 shrink-0 text-sm">
              {operatorName[0]?.toUpperCase() || 'O'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{operatorName}</p>
              <p className="text-[10px] font-medium text-slate-400 truncate">{companyName || 'Operator'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-slate-400 font-bold rounded-xl hover:text-rose-600 hover:bg-rose-50 transition-all border border-slate-100 text-sm"
          >
            <MdExitToApp className="text-lg" />
            <span>Chiqish</span>
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] lg:hidden"
          onClick={onClose}
        />
      )}
      {sidebarContent}
    </>
  );
}

// ── Hamburger tugmasi (Topbar yoki layout uchun) ──
export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-all"
    >
      <MdMenu className="text-xl" />
    </button>
  );
}
