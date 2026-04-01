'use client';

import React, { useState } from 'react';
import { MdSettings, MdPerson, MdLock, MdNotifications, MdLanguage, MdSave } from 'react-icons/md';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    fullName: 'Azizbek Rahimov',
    email: 'azizbek@example.uz',
    phone: '+998 90 111 22 33'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Sozlamalar muvaffaqiyatli saqlandi! ✅');
  };

  const tabs = [
    { id: 'profile', name: 'Profil', icon: MdPerson },
    { id: 'services', name: 'Xizmatlar / Narxlar', icon: MdSettings },
    { id: 'security', name: 'Xavfsizlik', icon: MdLock },
    { id: 'notifications', name: 'Bildirishnomalar', icon: MdNotifications },
  ];

  const [serviceGroups, setServiceGroups] = useState([
    {
      category: 'Gilamlar (kv.m)',
      services: [
        { id: '1-1', name: 'Oddiy gilam', price: 12000, unit: 'kv.m' },
        { id: '1-2', name: 'Qubbali gilam', price: 14000, unit: 'kv.m' },
        { id: '1-3', name: 'Rayhon gilam', price: 15000, unit: 'kv.m' },
        { id: '1-4', name: 'Hukmdor / Sheyx / Troya', price: 16000, unit: 'kv.m' },
        { id: '1-5', name: 'Shaggi / Makaron', price: 17000, unit: 'kv.m' },
        { id: '1-6', name: 'Xitoy / Turkiya nozik', price: 18000, unit: 'kv.m' },
        { id: '1-7', name: 'Polos / Daroshka', price: 12000, unit: 'kv.m' },
      ]
    },
    {
      category: 'Boshqa buyumlar',
      services: [
        { id: '2-1', name: 'Ko\'rpacha', price: 25000, unit: 'metr' },
        { id: '2-2-1', name: 'Odeyal (1 kishilik yupqa)', price: 40000, unit: 'dona' },
        { id: '2-2-2', name: 'Odeyal (1 kishilik qalin)', price: 50000, unit: 'dona' },
        { id: '2-2-3', name: 'Odeyal (2 kishilik yupqa)', price: 60000, unit: 'dona' },
        { id: '2-2-4', name: 'Odeyal (2 kishilik qalin)', price: 70000, unit: 'dona' },
        { id: '2-3', name: 'Ko\'rpa', price: 30000, unit: 'kv.m' },
        { id: '2-4', name: 'Pardalar', price: 30000, unit: 'kg' },
      ]
    },
    {
      category: 'Maxsus xizmatlar',
      services: [
        { id: '3-1', name: 'Yumshoq mebel', price: 60000, unit: 'o\'rindiq' },
        { id: '3-2', name: 'Matras yuvish', price: 80000, unit: 'dona' },
        { id: '3-3', name: 'Fasad yuvish', price: 15000, unit: 'kv.m' },
        { id: '3-4', name: 'Bruschatka yuvish', price: 10000, unit: 'kv.m' },
        { id: '3-5', name: 'Dazmollash', price: 5000, unit: 'metr' },
      ]
    }
  ]);

  const handleUpdatePrice = (groupIdx: number, serviceId: string, newPrice: number) => {
    const updatedGroups = [...serviceGroups];
    updatedGroups[groupIdx].services = updatedGroups[groupIdx].services.map(s => 
      s.id === serviceId ? { ...s, price: newPrice } : s
    );
    setServiceGroups(updatedGroups);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight border-b-2 border-indigo-200 inline-block pb-1">
          Korxona Sozlamalari
        </h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">Profil va xizmat tariflarini boshqaring</p>
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
                    ? 'bg-white shadow-md text-indigo-600' 
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
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Ism-sharif</label>
                    <input 
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all focus:ring-4 focus:ring-indigo-500/5"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Telefon</label>
                    <input 
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all focus:ring-4 focus:ring-indigo-500/5"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-900/20 hover:shadow-indigo-900/40 hover:-translate-y-1 transition-all">
                  <MdSave className="text-xl" />
                  O'zgarishlarni Saqlash
                </button>
              </div>
            </form>
          )}

          {activeTab === 'services' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Xizmatlar va Narxlar</h3>
                <p className="text-slate-500 text-sm mt-1">Order yaratishda ishlatiladigan narxlarni shu yerdan sozlashingiz mumkin.</p>
              </div>

              <div className="space-y-8">
                {serviceGroups.map((group, groupIdx) => (
                  <div key={group.category} className="space-y-4">
                    <h4 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] pl-1 border-l-4 border-indigo-600 ml-1">
                      {group.category}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {group.services.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">O'lchov: {item.unit}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-right font-black text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                              value={item.price}
                              onChange={(e) => handleUpdatePrice(groupIdx, item.id, parseInt(e.target.value) || 0)}
                            />
                            <span className="text-[10px] font-black text-slate-400 uppercase">so'm</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button onClick={handleSave} className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-900/20 hover:shadow-indigo-900/40 hover:-translate-y-1 transition-all">
                  <MdSave className="text-xl" />
                  Narxlarni Tasdiqlash
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 max-w-xl">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Xavfsizlik Sozlamalari</h3>
                <p className="text-slate-500 text-sm mt-1">Parol va hisob xavfsizligini boshqaring.</p>
              </div>

              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert('Parol yangilandi! 🔐'); }}>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Joriy Parol</label>
                  <input 
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all focus:ring-4 focus:ring-indigo-500/5"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Yangi Parol</label>
                  <input 
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all focus:ring-4 focus:ring-indigo-500/5"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Yangi Parolni Tasdiqlang</label>
                  <input 
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all focus:ring-4 focus:ring-indigo-500/5"
                  />
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full py-4 bg-slate-800 text-white font-black rounded-2xl shadow-xl shadow-slate-900/20 active:scale-95 transition-all uppercase tracking-widest text-xs">
                    Parolni Yangilash
                  </button>
                </div>
              </form>

              <div className="h-px bg-slate-100 my-8"></div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                          <MdLock className="text-xl" />
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-800">Ikki faktorli autentifikatsiya (2FA)</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Xavfsizlik darajasini oshirish</p>
                       </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8 max-w-xl">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Bildirishnomalar</h3>
                <p className="text-slate-500 text-sm mt-1">Muhim o'zgarishlardan xabardor bo'lishni sozlang.</p>
              </div>

              <div className="space-y-4">
                {[
                  { title: "Yangi buyurtmalar", desc: "Sizga yangi buyurtma kelganda bildirishnoma olish", checked: true },
                  { title: "To'lovlar", desc: "Mijozlar to'lov qilganda statusini ko'rish", checked: true },
                  { title: "Haydovchilar faolligi", desc: "Haydovchi marshrutga chiqqanda yoki yakunlaganda", checked: false },
                  { title: "Tizim xabarlari", desc: "Yangilanishlar va texnik xabarlar", checked: true },
                ].map((notif, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all">
                    <div>
                      <p className="text-sm font-black text-slate-800">{notif.title}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{notif.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={notif.checked} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <button onClick={() => alert('Bildirishnoma sozlamalari saqlandi! 🔔')} className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-900/20 hover:shadow-indigo-900/40 hover:-translate-y-1 transition-all">
                  <MdSave className="text-xl" />
                  Sozlamalarni Saqlash
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
