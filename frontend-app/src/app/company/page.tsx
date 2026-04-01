'use client';

import React, { useState } from 'react';
import { 
  MdTrendingUp, 
  MdTrendingDown, 
  MdPeople, 
  MdShoppingCart, 
  MdPhoneInTalk, 
  MdFilterList, 
  MdAdd, 
  MdPerson, 
  MdLocationOn, 
  MdAttachMoney,
  MdDateRange
} from 'react-icons/md';
import Modal from '@/components/ui/Modal';

export default function CompanyDashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily'); 
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [orders, setOrders] = useState([
    { id: 'ORD-9021', customer: 'Aliyev Vali', status: 'Olib Ketilgan', driver: 'Sardor (Isuzu)', amount: 'Kutilyapti', color: 'amber' },
    { id: 'ORD-9022', customer: 'Karimov Anvar', status: 'Yuvilmoqda', driver: 'Nozim (Damas)', amount: '120,000', color: 'blue' },
    { id: 'ORD-9023', customer: 'Rasulov Jamshid', status: 'Tayyor', driver: 'Sardor (Isuzu)', amount: '85,000', color: 'emerald' },
    { id: 'ORD-9024', customer: 'Toshmatova Gulnoza', status: 'Yetkazilmoqda', driver: 'Nozim (Damas)', amount: '210,000', color: 'indigo' },
    { id: 'ORD-9025', customer: 'Ahmedov Dilshod', status: 'Yangi', driver: '-', amount: '-', color: 'slate' },
  ]);

  const [newOrder, setNewOrder] = useState({
    customer: '',
    phone: '',
    address: '',
    service: 'oddiy'
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newItem = {
      id: orderId,
      customer: newOrder.customer,
      status: 'Yangi',
      driver: '-',
      amount: '-',
      color: 'slate'
    };
    setOrders([newItem, ...orders]);
    setIsModalOpen(false);
    setNewOrder({ customer: '', phone: '', address: '', service: 'oddiy' });
    alert('Yangi buyurtma muvaffaqiyatli yaratildi! ✅');
  };

  const stats = [
    { title: "Bugungi Buyurtmalar", value: "48 ta", trend: "+12%", up: true, icon: MdShoppingCart, color: "blue", suffix: "" },
    { title: "Kutilayotgan Qo'ng'iroqlar", value: "7 ta", trend: "-2%", up: false, icon: MdPhoneInTalk, color: "rose", suffix: "" },
    { title: "Yuvishdagi Gilamlar", value: "1,240 kv.m", trend: "+5%", up: true, icon: MdTrendingUp, color: "emerald", suffix: "" },
    { title: "Faol Haydovchilar", value: "5 ta", trend: "Hammasi liniyada", up: true, icon: MdPeople, color: "indigo", suffix: "" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Xush kelibsiz, Azizbek 👋</h1>
          <p className="text-slate-500 mt-1 font-medium">Boshqaruv paneli orqali barcha jarayonlarni kuzating.</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p as any)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${
                  period === p 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {p === 'daily' ? 'KUNLIK' : p === 'weekly' ? 'HAFTALIK' : 'OYLIK'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Dan</span>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none transition-all"
              />
            </div>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Gacha</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none transition-all"
              />
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all"
          >
            <MdAdd className="text-xl" />
            Yangi Buyurtma
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:border-blue-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:bg-${stat.color}-100 transition-colors`}>
                <stat.icon className="text-2xl" />
              </div>
              <span className={`flex items-center text-sm font-bold ${stat.up ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'} px-2 py-1 rounded-md`}>
                {stat.up ? <MdTrendingUp className="mr-1" /> : <MdTrendingDown className="mr-1" />}
                {stat.trend}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">So'nggi Buyurtmalar</h2>
            <button className="text-sm font-medium text-blue-600 hover:underline">Barchasini ko'rish</button>
          </div>
          <div className="p-0 overflow-x-auto text-nowrap">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3">ID / Mijoz</th>
                  <th className="px-6 py-3">Holati</th>
                  <th className="px-6 py-3">Haydovchi</th>
                  <th className="px-6 py-3 text-right">Summa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">#{order.id}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{order.customer}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-tighter ${
                        order.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                        order.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                        order.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                        order.color === 'indigo' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{order.driver}</td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-bold text-slate-800">{order.amount}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">Xodimlar Faolligi</h2>
          </div>
          <div className="p-6 space-y-6 flex-1">
            {[
              { id: 1, name: 'Sardor', role: 'Haydovchi', status: 'Liniyada (3 ta qoldi)', color: 'emerald' },
              { id: 2, name: 'Jasur', role: 'Yuvuvchi', status: 'Dastgohda', color: 'blue' },
              { id: 3, name: 'Bekzod', role: 'Qadoqlovchi', status: 'Tanaffusda', color: 'amber' },
            ].map(user => (
              <div key={user.id} className="flex items-center gap-4">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600`}>
                    {user.name[0]}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full bg-${user.color}-500`}></span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500 font-medium">{user.role} • <span className={`text-${user.color}-600`}>{user.status}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Yangi Buyurtma Yaratish"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Mijoz Ism-sharifi</label>
              <div className="relative group">
                <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input 
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all focus:ring-4 focus:ring-blue-500/5"
                  placeholder="Masalan: Aliyev Vali"
                  value={newOrder.customer}
                  onChange={(e) => setNewOrder({...newOrder, customer: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Telefon Raqami</label>
              <div className="relative group">
                <MdPhoneInTalk className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input 
                  required
                  type="tel"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all focus:ring-4 focus:ring-blue-500/5"
                  placeholder="+998 90 000 00 00"
                  value={newOrder.phone}
                  onChange={(e) => setNewOrder({...newOrder, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Manzil</label>
              <div className="relative group">
                <MdLocationOn className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input 
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all focus:ring-4 focus:ring-blue-500/5"
                  placeholder="Ko'cha, uy, xonadon..."
                  value={newOrder.address}
                  onChange={(e) => setNewOrder({...newOrder, address: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Xizmat Turi & Narxlar</label>
              <div className="relative group">
                <MdAttachMoney className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <select 
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all focus:ring-4 focus:ring-blue-500/5 bg-white appearance-none"
                  value={newOrder.service}
                  onChange={(e) => setNewOrder({...newOrder, service: e.target.value})}
                >
                  <optgroup label="Gilamlar (1kv.m)">
                    <option value="oddiy">Oddiy gilam (12,000-13,000)</option>
                    <option value="qubbali">Qubbali gilam (14,000)</option>
                    <option value="rayhon">Rayhon gilam (15,000)</option>
                    <option value="lux">Hukmdor, Sheyx, Troya (16,000)</option>
                    <option value="shaggi">Shaggi, Makaron (17,000)</option>
                    <option value="nozik">Xitoy, Turkiya nozik (18,000)</option>
                    <option value="polos">Polos / Daroshka</option>
                  </optgroup>
                  <optgroup label="Boshqa buyumlar">
                    <option value="korpacha">Ko'rpacha (metr / 25,000)</option>
                    <option value="odeyal_1_yupqa">Odeyal (1 kishilik yupqa/parash)</option>
                    <option value="odeyal_1_qalin">Odeyal (1 kishilik qalin)</option>
                    <option value="odeyal_2_yupqa">Odeyal (2 kishilik yupqa/parash)</option>
                    <option value="odeyal_2_qalin">Odeyal (2 kishilik qalin)</option>
                    <option value="korpa">Ko'rpa (kv.m)</option>
                    <option value="parda">Pardalar (1kg / 25,000-35,000)</option>
                  </optgroup>
                  <optgroup label="Maxsus xizmatlar">
                    <option value="mebel">Yumshoq mebel (1 o'rindiq / 50-70 ming)</option>
                    <option value="matras">Matras yuvish</option>
                    <option value="fasad">Fasad yuvish</option>
                    <option value="bruschatka">Bruschatka yuvish</option>
                    <option value="dazmol">Dazmollash (1m / 5,000)</option>
                  </optgroup>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-3">
             <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-3 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200"
            >
              Bekor qilish
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
            >
              Buyurtmani Tasdiqlash
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
