'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  MdAdd, 
  MdSearch, 
  MdFilterList, 
  MdPerson, 
  MdPhone, 
  MdLocationOn, 
  MdCreditCard, 
  MdCancel,
  MdCheckCircle,
  MdAccessTime,
  MdAttachMoney
} from 'react-icons/md';
import Modal from '@/components/ui/Modal';

function OrderContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Barchasi');
  const searchParams = useSearchParams();
  
  const [orders, setOrders] = useState([
    { id: 'ORD-5501', customer: 'Aliyev Vali', phone: '+998 90 123 45 67', status: 'Yangi', type: 'Gilam (Oddiy)', area: '12kv.m', price: '144,000', time: '14:20' },
    { id: 'ORD-5502', customer: 'Karimov Anvar', phone: '+998 93 987 65 43', status: 'Tayyor', type: 'Odeyal (2 kishilik)', area: '2 dona', price: '120,000', time: '12:45' },
    { id: 'ORD-5503', customer: 'Rasulova Jamila', phone: '+998 99 111 22 33', status: 'Bekor qilingan', type: 'Gilam (Lux)', area: '-', price: '-', time: '10:30' },
  ]);

  const [newOrder, setNewOrder] = useState({
    customer: '',
    phone: '',
    address: '',
    service: 'oddiy',
    company: 'Pokiza MChJ'
  });

  useEffect(() => {
    const phone = searchParams.get('phone');
    const name = searchParams.get('name');
    const address = searchParams.get('address');

    if (phone || name || address) {
      setNewOrder(prev => ({
        ...prev,
        phone: phone || '',
        customer: name || '',
        address: address || ''
      }));
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newItem = {
      id: orderId,
      customer: newOrder.customer,
      phone: newOrder.phone,
      status: 'Yangi',
      type: 'Yangi buyurtma',
      area: '-',
      price: '-',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setOrders([newItem, ...orders]);
    setIsModalOpen(false);
    setNewOrder({ customer: '', phone: '', address: '', service: 'oddiy', company: 'Pokiza MChJ' });
    alert('Yangi buyurtma operator tomonidan muvaffaqiyatli yaratildi! ✅');
  };

  const handleCancelOrder = (id: string) => {
    if (confirm('Ushbu buyurtmani bekor qilishni tasdiqlaysizmi?')) {
      setOrders(orders.map(o => o.id === id ? { ...o, status: 'Bekor qilingan' } : o));
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'Barchasi' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Buyurtmalar Boshqaruvi</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Barcha korxonalar bo'yicha buyurtmalarni qabul qilish va nazorat qilish</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all"
        >
          <MdAdd className="text-xl" />
          Yangi Buyurtma Olish
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input 
            type="text"
            placeholder="Mijoz ismi, ID yoki telefon raqami orqali qidirish..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-white shadow-sm outline-none focus:border-indigo-500 transition-all font-medium text-slate-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative group min-w-[200px]">
          <MdFilterList className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-12 pr-10 py-4 bg-white border border-slate-100 rounded-2xl text-slate-500 font-bold outline-none focus:border-indigo-500 transition-all shadow-sm appearance-none"
          >
            <option value="Barchasi">Barcha Holatlar</option>
            <option value="Yangi">Yangi</option>
            <option value="Tayyor">Tayyor</option>
            <option value="Bekor qilingan">Bekor qilingan</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-5">ID / Mijoz</th>
                <th className="px-8 py-5">Xizmat va Hajm</th>
                <th className="px-8 py-5">Holati</th>
                <th className="px-8 py-5">Vaqti</th>
                <th className="px-8 py-5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-800">#{order.id}</span>
                      <span className="text-xs font-bold text-slate-500 mt-0.5">{order.customer}</span>
                      <span className="text-[10px] text-slate-400 font-medium italic">{order.phone}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{order.type}</span>
                      <span className="text-xs font-black text-indigo-600 mt-0.5">{order.area} • {order.price === '-' ? '-' : order.price + ' so\'m'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      order.status === 'Yangi' ? 'bg-blue-50 text-blue-600' :
                      order.status === 'Tayyor' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-rose-50 text-rose-600'
                    }`}>
                      <MdFiberManualRecord className="text-[8px]" />
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-400">
                       <MdAccessTime className="text-sm" />
                       <span className="text-xs font-bold">{order.time}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {order.status !== 'Bekor qilingan' && (
                        <button 
                          onClick={() => handleCancelOrder(order.id)}
                          className="p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Bekor qilish"
                        >
                          <MdCancel className="text-xl" />
                        </button>
                      )}
                      <button className="p-2.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                        <MdCheckCircle className="text-xl" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Yangi Buyurtma Qabul Qilish"
      >
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Mijoz Ism-sharifi</label>
              <div className="relative group">
                <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input 
                  required
                  placeholder="Aliyev Vali"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all"
                  value={newOrder.customer}
                  onChange={(e) => setNewOrder({...newOrder, customer: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Telefon Raqami</label>
              <div className="relative group">
                <MdPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
                <input 
                  required
                  placeholder="+998 90 000 00 00"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all font-mono"
                  value={newOrder.phone}
                  onChange={(e) => setNewOrder({...newOrder, phone: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Xizmat Ko'rsatuvchi Korxona</label>
            <div className="relative group">
               <MdLocationOn className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
               <select 
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all bg-white appearance-none"
                value={newOrder.company}
                onChange={(e) => setNewOrder({...newOrder, company: e.target.value})}
               >
                 <option value="Pokiza MChJ">"Pokiza" MChJ - Toshkent</option>
                 <option value="Toza Makon">"Toza Makon" - Samarqand</option>
                 <option value="Yulduz Gilam">"Yulduz Gilam" - Farg'ona</option>
               </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Xizmat turi</label>
            <div className="relative group">
               <MdAttachMoney className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
               <select 
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-slate-800 transition-all bg-white appearance-none"
                value={newOrder.service}
                onChange={(e) => setNewOrder({...newOrder, service: e.target.value})}
               >
                 <option value="oddiy">Oddiy gilam (kv.m / 12,000)</option>
                 <option value="qubbali">Qubbali gilam (kv.m / 14,000)</option>
                 <option value="odeyal">Odeyal (dona / 50,000)</option>
                 <option value="korpacha">Ko'rpacha (metr / 25,000)</option>
               </select>
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-4 text-sm font-black text-slate-400 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest"
            >
              Bekor qilish
            </button>
            <button 
              type="submit"
              className="flex-1 py-4 text-sm font-black text-white bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all uppercase tracking-widest"
            >
              Buyurtmani Tasdiqlash
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function OperatorOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-bold text-slate-400">Yuklanmoqda...</div>}>
      <OrderContent />
    </Suspense>
  );
}

function MdFiberManualRecord({ className }: { className?: string }) {
  return (
    <svg 
      stroke="currentColor" 
      fill="currentColor" 
      strokeWidth="0" 
      viewBox="0 0 24 24" 
      className={className}
      height="1em" 
      width="1em" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="8"></circle>
    </svg>
  );
}
