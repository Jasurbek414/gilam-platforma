'use client';

import React, { useState } from 'react';
import { MdSettings, MdPerson, MdLock, MdNotifications, MdLanguage, MdSave, MdSecurity } from 'react-icons/md';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [is2FAEnabled, setIs2FAEnabled] = useState(typeof window !== 'undefined' ? localStorage.getItem('is2FAEnabled') === 'true' : false);
  const [is2FALoading, setIs2FALoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: 'Azizbek Rahimov',
    email: typeof window !== 'undefined' ? localStorage.getItem('adminEmail') || 'azizbek@example.uz' : 'azizbek@example.uz',
    phone: '+998 90 111 22 33'
  });

  const handleToggle2FA = () => {
    setIs2FALoading(true);
    setTimeout(() => {
      const newState = !is2FAEnabled;
      setIs2FAEnabled(newState);
      localStorage.setItem('is2FAEnabled', newState.toString());
      setIs2FALoading(false);
      alert(newState ? '2FA muvaffaqiyatli yoqildi! 🔐' : '2FA muvaffaqiyatli o\'chirildi! 🔓');
    }, 1000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'profile') {
      localStorage.setItem('adminEmail', formData.email);
    }
    alert('Sozlamalar muvaffaqiyatli saqlandi! ✅');
  };
  const tabs = [
    { id: 'profile', name: 'Profil', icon: MdPerson },
    { id: 'security', name: 'Xavfsizlik', icon: MdLock },
    { id: 'notifications', name: 'Bildirishnomalar', icon: MdNotifications },
    { id: 'system', name: 'Tizim', icon: MdLanguage },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight border-b-2 border-slate-200 inline-block pb-1">
          Tizim Sozlamalari
        </h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">Profil va dastur parametrlarini boshqaring</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tabs Sidebar */}
        <div className="w-full lg:w-64 space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white shadow-md text-blue-600' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="text-xl" />
                {tab.name}
              </button>
            )
          })}
        </div>

        {/* Form Content */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-6 max-w-xl">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-3xl bg-blue-100 flex items-center justify-center text-4xl font-black text-blue-600">
                  AR
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Profil Rasmi</h3>
                  <button type="button" className="text-sm font-bold text-blue-600 mt-1 hover:underline">Rasmni yangilash</button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Ism-sharif</label>
                    <input 
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all focus:ring-4 focus:ring-blue-500/5"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Telefon</label>
                    <input 
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all focus:ring-4 focus:ring-blue-500/5"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Email</label>
                  <input 
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all focus:ring-4 focus:ring-blue-500/5"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-slate-900/20 hover:shadow-slate-900/40 hover:-translate-y-1 transition-all">
                  <MdSave className="text-xl text-blue-400" />
                  O'zgarishlarni Saqlash
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 max-w-xl">
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                  <MdLock className="text-blue-500" /> Parolni o'zgartirish
                </h3>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Joriy parol</label>
                    <input 
                      type="password"
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all focus:ring-4 focus:ring-blue-500/5"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Yangi parol</label>
                    <input 
                      type="password"
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all focus:ring-4 focus:ring-blue-500/5"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Yangi parolni tasdiqlang</label>
                    <input 
                      type="password"
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all focus:ring-4 focus:ring-blue-500/5"
                      placeholder="••••••••"
                    />
                  </div>
                  <button type="submit" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:-translate-y-1 transition-all mt-2">
                    Parolni yangilash
                  </button>
                </form>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                  <MdNotifications className="text-blue-500" /> Ikki bosqichli autentifikatsiya (2FA)
                </h3>
                <p className="text-slate-500 text-sm mb-6 font-medium">Hisobingiz xavfsizligini oshirish uchun SMS yoki Google Authenticator orqali tasdiqlashni yoqing.</p>
                <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${is2FAEnabled ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${is2FAEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                      <MdSecurity className="text-xl" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">2FA holati</p>
                      <p className={`text-xs font-bold uppercase tracking-widest ${is2FAEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {is2FAEnabled ? 'Faollashtirilgan ✅' : 'Hozirda o\'chirilgan'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={handleToggle2FA}
                    disabled={is2FALoading}
                    className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 min-w-[100px] ${
                      is2FAEnabled 
                        ? 'bg-white text-red-600 border border-red-100 hover:bg-red-50 shadow-sm' 
                        : 'bg-blue-600 text-white hover:shadow-lg shadow-blue-500/20'
                    } disabled:opacity-50`}
                  >
                    {is2FALoading ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      is2FAEnabled ? "O'CHIRISH" : "YOQISH"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8 max-w-xl">
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                  <MdNotifications className="text-blue-500" /> Bildirishnoma Sozlamalari
                </h3>
                
                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold">@</div>
                      <div>
                        <p className="font-bold text-slate-800">Email Bildirishnomalar</p>
                        <p className="text-xs text-slate-500">Yangi buyurtmalar va hisobotlar haqida xabar olish</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* SMS Notifications */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 font-bold">SMS</div>
                      <div>
                        <p className="font-bold text-slate-800">SMS Bildirishnomalar</p>
                        <p className="text-xs text-slate-500">Muhim ogohlantirishlarni telefonga olish</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Platform Notifications */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                        <MdNotifications className="text-xl" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Tizim Bildirishnomalari</p>
                        <p className="text-xs text-slate-500">Brauzer va Dashboard ichidagi xabarlar</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-8">
                  <button onClick={handleSave} className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:-translate-y-1 transition-all">
                    <MdSave className="text-xl" />
                    Sozlamalarni Saqlash
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-8 max-w-xl">
              <div>
                <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                  <MdLanguage className="text-blue-500" /> Tizim Parametrlari
                </h3>
                
                <div className="space-y-6">
                  {/* Language Setting */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Asosiy til</label>
                    <select className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800 bg-white">
                      <option value="uz">O'zbekcha</option>
                      <option value="ru">Русский</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  {/* Currency Setting */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Pul birligi</label>
                    <select className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800 bg-white">
                      <option value="uzs">O'zbek so'mi (UZS)</option>
                      <option value="usd">AQSh dollari (USD)</option>
                    </select>
                  </div>

                  {/* Timezone Setting */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Vaqt mintaqasi</label>
                    <select className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800 bg-white">
                      <option value="uzt">Tashkent (GMT+5)</option>
                      <option value="utc">UTC (Coordinated Universal Time)</option>
                    </select>
                  </div>

                  {/* Maintenance Mode */}
                  <div className="pt-4 p-6 bg-red-50 rounded-2xl border border-red-100 border-dashed">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-red-800">Texnik xizmat ko'rsatish rejimi</p>
                        <p className="text-xs text-red-600 mt-1">Ushbu rejim yoqilganda faqat adminlar tizimga kira oladi.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <button onClick={handleSave} className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:-translate-y-1 transition-all">
                    <MdSave className="text-xl text-blue-400" />
                    Sozlamalarni Saqlash
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'profile' && activeTab !== 'security' && activeTab !== 'notifications' && activeTab !== 'system' && (
            <div className="h-64 flex items-center justify-center border-4 border-dashed border-slate-50 bg-slate-50/30 rounded-3xl">
              <p className="text-slate-400 font-bold uppercase tracking-widest italic">{activeTab} sozlamalari yaqin orada...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
