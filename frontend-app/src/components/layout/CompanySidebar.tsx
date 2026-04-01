'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  MdDashboard,
  MdShoppingCart,
  MdLocalShipping,
  MdPeople,
  MdSettings,
  MdLogout,
  MdStore,
  MdAssessment
} from 'react-icons/md';

const companyLinks = [
  { name: 'Asosiy Oyna', href: '/company', icon: MdDashboard },
  { name: 'Buyurtmalar', href: '/company/orders', icon: MdShoppingCart },
  { name: 'Xisobotlar', href: '/company/finance', icon: MdAssessment },
  { name: 'Haydovchilar liniyasi', href: '/company/logistics', icon: MdLocalShipping },
  { name: 'Xodimlar', href: '/company/staff', icon: MdPeople },
  { name: 'Mening Korxonam', href: '/company/settings', icon: MdStore },
];

export default function CompanySidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (confirm('Tizimdan chiqishni tasdiqlaysizmi?')) {
      router.push('/');
    }
  };

  return (
    <aside className="w-72 bg-indigo-950 border-r border-indigo-900 text-indigo-100 flex flex-col h-screen fixed left-0 top-0 shadow-2xl z-20">
      <div className="h-16 flex items-center px-6 border-b border-indigo-900/50 bg-indigo-950/50">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">✨</span> "Pokiza" MChJ
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <p className="px-4 text-xs font-semibold text-indigo-400/60 uppercase tracking-widest mb-4">
          Boshqaruv
        </p>
        
        {companyLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group',
                isActive 
                  ? 'bg-indigo-600/20 text-indigo-300 font-medium shadow-inner shadow-indigo-500/10' 
                  : 'hover:bg-indigo-900/50 hover:text-white'
              )}
            >
              <Icon className={cn("text-xl transition-all group-hover:scale-110", isActive ? 'text-indigo-400 drop-shadow-md' : 'text-indigo-400/50')} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-indigo-900/50 bg-indigo-950/80 backdrop-blur-sm">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors group"
        >
          <MdLogout className="text-xl group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Tizimdan chiqish</span>
        </button>
      </div>
    </aside>
  );
}
