'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setToken, request } from '@/lib/api';

export default function DriverLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await request<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
      });

      if (data.user.role !== 'DRIVER') {
        setError('Bu portal faqat haydovchilar uchun');
        setLoading(false);
        return;
      }

      setToken(data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('loginPath', '/driver/login');
      router.push('/driver');
    } catch (err: any) {
      setError(err.message || 'Kirishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-xl shadow-emerald-500/20">
            <span className="text-4xl">🚐</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800">Haydovchi</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium tracking-wider uppercase">Gilam SaaS • Logistika</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-slate-200/50 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Telefon raqam
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">📱</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998901234567"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-800 font-semibold text-lg focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Parol
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔐</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-800 font-semibold text-lg focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-red-600 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-lg rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all uppercase tracking-wider"
          >
            {loading ? '⏳ Kirilmoqda...' : '🚛 Kirish'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          Faqat ro&apos;yxatdan o&apos;tgan haydovchilar uchun
        </p>
      </div>
    </div>
  );
}
