'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdEmail, MdLock, MdLogin, MdVisibility, MdVisibilityOff } from 'react-icons/md';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'login' | '2fa'>('login');
  const [otp, setOtp] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulated Authentication Logic
    setTimeout(() => {
      const storedAdminEmail = typeof window !== 'undefined' ? localStorage.getItem('adminEmail') : 'admin@gilam.uz';
      const effectiveAdminEmail = storedAdminEmail || 'admin@gilam.uz';
      const is2FAEnabled = typeof window !== 'undefined' ? localStorage.getItem('is2FAEnabled') === 'true' : false;

      if (email === effectiveAdminEmail) {
        if (is2FAEnabled) {
          setStep('2fa');
        } else {
          router.push('/admin');
        }
      } else if (email === 'operator@test.uz') {
        router.push('/company/orders');
      } else {
        alert('Email yoki parol xato! Iltimos qaytadan urinib ko\'ring.');
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (otp === '123456') {
        router.push('/admin');
      } else {
        alert('Tasdiqlash kodi noto\'g\'ri! Qayta urinib ko\'ring (Simulyatsiya uchun: 123456)');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_#e2e8f0,_transparent),_radial-gradient(circle_at_bottom_left,_#f1f5f9,_transparent)]">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-500/10 border border-slate-100 overflow-hidden transform transition-all">
          
          <div className="p-8 pb-4 text-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-700 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20 text-4xl mb-6 rotate-3">
              {step === 'login' ? '💧' : '🛡️'}
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              {step === 'login' ? 'Xush Kelibsiz' : 'Xavfsizlikni Tasdiqlang'}
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">
              {step === 'login' ? 'Gilam SaaS • Avtomatlashtirish Tizimi' : 'Telefonga yuborilgan 6 xonali kodni kiriting'}
            </p>
          </div>

          {step === 'login' ? (
            <form onSubmit={handleLogin} className="p-8 pt-4 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Manzili</label>
                <div className="relative group">
                  <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    required
                    type="email" 
                    placeholder="admin@gilam.uz"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Maxfiy Parol</label>
                <div className="relative group">
                  <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    required
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-blue-600 focus:ring-blue-500/10 cursor-pointer" />
                  <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors">Eslab qolish</span>
                </label>
                <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">Parolni unutdingizmi?</button>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-70 disabled:translate-y-0"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <MdLogin className="text-xl" />
                    Davom Etish
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify2FA} className="p-8 pt-4 space-y-6">
              <div className="space-y-1.5 text-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tasdiqlash kodi</label>
                <input 
                  required
                  autoFocus
                  type="text" 
                  maxLength={6}
                  placeholder="000000"
                  className="w-full py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-black text-3xl tracking-[0.5em] text-center text-slate-800 placeholder:text-slate-200"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest pt-2 cursor-pointer hover:underline">Kodni qayta yuborish</p>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-70 disabled:translate-y-0"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>Tizimga Kirish</>
                  )}
                </button>
                <button 
                  type="button"
                  onClick={() => setStep('login')}
                  className="w-full py-2 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                >
                  Orqaga Qaytish
                </button>
              </div>
            </form>
          )}

          <div className="p-6 bg-slate-50/50 border-t border-slate-50 text-center">
            <p className="text-xs font-bold text-slate-400">
              {step === 'login' ? 'Muammo yuzaga kelsa texnik ko\'makka murojaat qiling' : 'Simulyatsiya uchun kod: 123456'}
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs font-bold text-slate-400/60 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Gilam SaaS Automation Platform
        </p>
      </div>
    </div>
  );
}
