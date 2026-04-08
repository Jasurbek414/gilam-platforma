'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdPhone, MdLock, MdLogin, MdVisibility, MdVisibilityOff, MdHeadset } from 'react-icons/md';
import { authApi, setToken, setUser, setLoginPath } from '@/lib/api';

export default function OperatorLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await authApi.login(phone, password);
      const { role } = result.user;

      // Faqat OPERATOR role ga ruxsat
      if (role !== 'OPERATOR') {
        setError(
          role === 'SUPER_ADMIN'
            ? "Super Admin bu sahifadan kira olmaydi. /admin sahifasidan kiring."
            : role === 'COMPANY_ADMIN'
            ? "Kompaniya admini bu sahifadan kira olmaydi."
            : "Sizning akkauntingiz operator emas."
        );
        return;
      }

      setToken(result.access_token);
      setUser(result.user);
      setLoginPath('/operator/login');
      router.push('/operator');
    } catch (err: any) {
      setError(err.message || 'Telefon raqam yoki parol noto\'g\'ri!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">

      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-sm w-full">

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/40">

          {/* Header */}
          <div className="px-10 pt-10 pb-7 text-center border-b border-white/5">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/30 rotate-3">
              <MdHeadset className="text-4xl text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Operator Kabineti
            </h1>
            <p className="mt-2 text-[10px] font-black text-white/30 uppercase tracking-[0.25em]">
              Gilam SaaS • Operator Portal
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="px-10 py-8 space-y-5">

            {/* Error */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-3 rounded-2xl text-[11px] font-bold text-center leading-relaxed">
                {error}
              </div>
            )}

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">
                Telefon raqam
              </label>
              <div className="relative group">
                <MdPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-xl group-focus-within:text-indigo-400 transition-colors" />
                <input
                  required
                  type="tel"
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold placeholder:text-white/20 outline-none focus:bg-white/8 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">
                Parol
              </label>
              <div className="relative group">
                <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-xl group-focus-within:text-indigo-400 transition-colors" />
                <input
                  required
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold placeholder:text-white/20 outline-none focus:bg-white/8 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPwd ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <MdLogin className="text-lg" />
                  Kirish
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="px-10 pb-8 -mt-1">
            <p className="text-[9px] font-bold text-white/20 text-center uppercase tracking-widest leading-relaxed">
              Faqat operator akkauntlari uchun
            </p>
          </div>
        </div>

        {/* Copyright */}
        <p className="mt-8 text-center text-[9px] font-bold text-white/15 uppercase tracking-widest">
          © {new Date().getFullYear()} Gilam SaaS Platform
        </p>
      </div>
    </div>
  );
}
