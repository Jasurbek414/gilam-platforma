'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getUser, removeToken, getLoginPath } from '@/lib/api';
import {
  MdDashboard,
  MdCall,
  MdShoppingCart,
  MdPeople,
  MdLocalShipping,
  MdExitToApp,
  MdChat,
  MdVerifiedUser
} from 'react-icons/md';

const operatorLinks = [
  { name: 'Dashboard', href: '/operator', icon: MdDashboard },
  { name: 'Qo\'ng\'iroqlar', href: '/operator/calls', icon: MdCall },
  { name: 'Yangi Buyurtma', href: '/operator/orders', icon: MdShoppingCart },
  { name: 'Mijozlar', href: '/operator/customers', icon: MdPeople },
  { name: 'Logistika', href: '/operator/logistics', icon: MdLocalShipping },
  { name: 'Xabarlar', href: '/operator/messages', icon: MdChat },
  { name: 'Sifat Nazorati', href: '/operator/quality', icon: MdVerifiedUser },
];

export default function OperatorSidebar() {
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
    const loginPath = getLoginPath();
    removeToken();
    router.push(loginPath);
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-100 flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-8">
        <Link href="/operator" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <MdCall className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">OPERATOR</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Call-Center Panel</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
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
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="text-xl" />
              <span className="text-sm">{link.name}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-glow" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center font-black text-indigo-600 shrink-0">
              {operatorName[0]?.toUpperCase() || 'O'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{operatorName}</p>
              <p className="text-[10px] font-medium text-slate-400 truncate">{companyName || 'Operator'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-3 bg-white text-slate-400 font-bold rounded-2xl hover:text-rose-600 hover:bg-rose-50 transition-all border border-slate-100"
          >
            <MdExitToApp className="text-lg" />
            <span>Chiqish</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
