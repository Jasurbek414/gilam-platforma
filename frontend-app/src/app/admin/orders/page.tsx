'use client';

import React, { useState, useEffect } from 'react';
import { MdSearch, MdFilterList, MdBusiness, MdShoppingCart } from 'react-icons/md';
import { ordersApi } from '@/lib/api';

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const data = await ordersApi.getAll();
      setOrders(data);
    } catch (err) {
      console.error('Buyurtmalarni yuklashda xato:', err);
    } finally {
      setLoading(false);
    }
  }

  const statusLabels: Record<string, string> = {
    'NEW': 'Yangi',
    'DRIVER_ASSIGNED': 'Haydovchi biriktirilgan',
    'PICKED_UP': 'Olib ketilgan',
    'AT_FACILITY': 'Seshga kelgan',
    'WASHING': 'Yuvilmoqda',
    'DRYING': 'Quritilmoqda',
    'READY_FOR_DELIVERY': 'Yetkazishga tayyor',
    'OUT_FOR_DELIVERY': 'Yo\'lda',
    'DELIVERED': 'Yetkazildi',
    'CANCELLED': 'Bekor qilingan',
  };

  const statusColors: Record<string, string> = {
    'NEW': 'bg-blue-100 text-blue-700 border-blue-200',
    'DRIVER_ASSIGNED': 'bg-amber-100 text-amber-700 border-amber-200',
    'PICKED_UP': 'bg-orange-100 text-orange-700 border-orange-200',
    'AT_FACILITY': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'WASHING': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'DRYING': 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    'READY_FOR_DELIVERY': 'bg-purple-100 text-purple-700 border-purple-200',
    'OUT_FOR_DELIVERY': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'DELIVERED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'CANCELLED': 'bg-red-100 text-red-700 border-red-200',
  };

  const filteredOrders = orders.filter(order => {
    const customerName = order.customer?.fullName || 'Noma\'lum';
    const companyName = order.company?.name || 'Noma\'lum';
    
    const matchesSearch = customerName.toLowerCase().includes(search.toLowerCase()) || 
                          order.id.toLowerCase().includes(search.toLowerCase()) ||
                          companyName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight border-b-2 border-indigo-600 inline-block pb-1">
            Buyurtmalar Monitoringi
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Barcha korxonalar bo'ylab buyurtmalar oqimini kuzatish</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative w-full md:w-96">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input 
            type="text" 
            placeholder="Buyurtma ID, Mijoz yoki Korxona..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative group">
            <MdFilterList className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-12 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-bold text-sm text-slate-600 appearance-none cursor-pointer hover:bg-slate-100"
            >
              <option value="ALL">Barcha Holatlar</option>
              {Object.keys(statusLabels).map(key => (
                <option key={key} value={key}>{statusLabels[key]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-widest">
                <th className="py-5 px-8">Buyurtma ID & Sana</th>
                <th className="py-5 px-6">Korxona</th>
                <th className="py-5 px-6">Mijoz / Telefon</th>
                <th className="py-5 px-6 text-center">Holati</th>
                <th className="py-5 px-8 text-right">Summa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length > 0 ? filteredOrders.map((order) => {
                const customerName = order.customer?.fullName || 'Noma\'lum';
                const customerPhone = order.customer?.phone1 || '';
                const companyName = order.company?.name || 'Noma\'lum';
                
                return (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-5 px-8">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 text-sm tracking-tight">{order.id.split('-')[0].toUpperCase().substring(0, 8)}...</span>
                        <span className="text-slate-500 text-xs font-bold mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shrink-0">
                          <MdBusiness />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{companyName}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{customerName}</span>
                        <span className="text-xs font-semibold text-slate-500">{customerPhone}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className={`inline-block px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tighter uppercase border ${statusColors[order.status] || 'bg-slate-100'}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="py-5 px-8 text-right font-black text-slate-800 text-sm">
                      {Number(order.totalAmount).toLocaleString()} so'm
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <MdShoppingCart className="text-6xl text-slate-200 mb-4" />
                      <p className="text-lg font-bold">Buyurtmalar topilmadi</p>
                      <p className="text-sm mt-1">Ushbu so'rov bo'yicha ma'lumot yo'q</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 text-sm text-slate-500 font-bold bg-slate-50/50">
          Jami: {filteredOrders.length} ta buyurtma ko'rsatilmoqda
        </div>
      </div>
    </div>
  );
}
