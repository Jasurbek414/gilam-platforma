'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, removeToken } from '@/lib/api';

export default function DriverProfilePage() {
  const router = useRouter();
  const user = getUser();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    removeToken();
    localStorage.removeItem('user');
    router.push('/driver/login');
  };

  if (!user) return null;

  return (
    <div className="p-4 space-y-4">
      {/* Profile Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl">
            {user.fullName?.[0]?.toUpperCase() || '👤'}
          </div>
          <div>
            <h2 className="text-xl font-black">{user.fullName}</h2>
            <p className="text-emerald-200 text-sm font-medium">{user.phone}</p>
            <span className="inline-block mt-1 px-3 py-0.5 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
              Haydovchi
            </span>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="space-y-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
          <span className="text-2xl">📱</span>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Telefon</p>
            <p className="font-semibold text-slate-800">{user.phone}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
          <span className="text-2xl">🏢</span>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Kompaniya</p>
            <p className="font-semibold text-slate-800">{user.company?.name || user.companyId || '—'}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
          <span className="text-2xl">🆔</span>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">ID</p>
            <p className="font-mono text-xs text-slate-600">{user.id}</p>
          </div>
        </div>
      </div>

      {/* App info */}
      <div className="bg-slate-50 rounded-2xl p-4 text-center space-y-1">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Gilam SaaS • Haydovchi</p>
        <p className="text-xs text-slate-300">Versiya 1.0.0</p>
      </div>

      {/* Logout */}
      <button
        onClick={() => setShowLogout(true)}
        className="w-full py-4 bg-red-50 text-red-500 font-black text-base rounded-2xl border-2 border-red-100 hover:bg-red-100 active:scale-[0.98] transition-all uppercase tracking-wider"
      >
        🚪 Chiqish
      </button>

      {/* Logout confirmation */}
      {showLogout && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end z-[100] p-4">
          <div className="w-full bg-white rounded-3xl p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom">
            <h3 className="text-lg font-black text-slate-800 text-center">Tizimdan chiqish</h3>
            <p className="text-sm text-slate-500 text-center">Haqiqatan ham chiqmoqchimisiz?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowLogout(false)}
                className="py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl active:scale-95 transition-all"
              >
                Yo&apos;q
              </button>
              <button
                onClick={handleLogout}
                className="py-4 bg-red-500 text-white font-black rounded-2xl active:scale-95 transition-all shadow-lg shadow-red-500/20"
              >
                Ha, chiqish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
