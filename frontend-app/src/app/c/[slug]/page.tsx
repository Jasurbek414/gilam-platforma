'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MdPhone, MdLock, MdLogin } from 'react-icons/md';
import { authApi, setToken, setUser, toSlug, setLoginPath } from '@/lib/api';

export default function CompanyLoginPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string || 'kompaniya';
  
  // Clean up slug for display (e.g. pokizamchj -> Pokiza mchj)
  const displaySlug = slug.charAt(0).toUpperCase() + slug.slice(1);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await authApi.login(phone, password);
      const { role, company } = result.user;

      if (role === 'SUPER_ADMIN') {
        setToken(result.access_token);
        setUser(result.user);
        setLoginPath('/');
        router.push('/admin');
        return;
      }

      const companySlug = toSlug(company?.name || '');
      if (!company || companySlug !== slug) {
        const correctPath = companySlug ? `/c/${companySlug}` : '/';
        setError(`Siz bu portalni foydalana olmaysiz. Sizning portalingiz: ${correctPath}`);
        return;
      }

      setToken(result.access_token);
      setUser(result.user);
      setLoginPath(`/c/${slug}`);

      switch (role) {
        case 'COMPANY_ADMIN': router.push('/company'); break;
        case 'OPERATOR': router.push('/operator'); break;
        default: router.push('/app-view');
      }
    } catch (err: any) {
      setError(err.message || 'Telefon raqam yoki parol xato!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-950 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_#312e81,_transparent),_radial-gradient(circle_at_bottom_left,_#1e1b4b,_transparent)]">
      <div className="max-w-md w-full relative z-10">
        
        {/* Back link */}
        <button onClick={() => router.push('/')} className="text-indigo-300 hover:text-white mb-6 text-sm font-bold flex items-center gap-2 transition-colors">
          &larr; Asosiy menyuga qaytish
        </button>

        <div className="bg-white rounded-[2rem] shadow-2xl shadow-indigo-500/20 border border-indigo-100 overflow-hidden">
          <div className="p-8 pb-4 text-center border-b border-slate-100 bg-slate-50">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30 text-3xl mb-4 font-black">
              {displaySlug.charAt(0)}
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              {displaySlug} portaliga kirish
            </h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2 flex items-center justify-center gap-1">
              Gilam SaaS <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md ml-2">{slug}.gilamsaas.uz</span>
            </p>
          </div>

          <form onSubmit={handleLogin} className="p-8 pt-6 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-bold text-center">
                ❌ {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Xodim Telefon Raqami</label>
              <div className="relative group">
                <MdPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  required
                  type="tel" 
                  placeholder="+998"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Maxfiy Parol</label>
              <div className="relative group">
                <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black rounded-2xl mt-4 shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <MdLogin className="text-xl" />
              {isLoading ? "TEKSHIRILMOQDA..." : "PORTALGA KIRISH"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
