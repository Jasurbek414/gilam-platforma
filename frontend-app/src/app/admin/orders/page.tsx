'use client';

import React, { useState } from 'react';
import { MdSearch, MdFilterList, MdMoreVert, MdBusiness, MdShoppingCart } from 'react-icons/md';
import Modal from '@/components/ui/Modal';

const allOrders = [
  { id: 'ORD-101', company: '"Pokiza" MChJ', customer: 'Aliyev Vali', status: 'NEW', total: '0', date: '20.10.2023' },
  { id: 'ORD-102', company: '"Toza Makon" LC', customer: 'Zilola', status: 'WASHING', total: '120,000', date: '19.10.2023' },
  { id: 'ORD-103', company: 'Yulduz Gilam', customer: 'Botir Gani', status: 'FINISHED', total: '85,000', date: '18.10.2023' },
  { id: 'ORD-104', company: '"Pokiza" MChJ', customer: 'Sardor', status: 'WASHING', total: '210,000', date: '20.10.2023' },
];

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [orders, setOrders] = useState(allOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [formData, setFormData] = useState({ customer: '', status: '', total: '' });

  const statusLabels: Record<string, string> = {
    'NEW': 'Yangi',
    'WASHING': 'Yuvilmoqda',
    'FINISHED': 'Tayyor',
    'CANCELLED': 'Bekor qilingan',
  };

  const statusColors: Record<string, string> = {
    'NEW': 'bg-blue-100 text-blue-700 border-blue-200',
    'WASHING': 'bg-amber-100 text-amber-700 border-amber-200',
    'FINISHED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'CANCELLED': 'bg-red-100 text-red-700 border-red-200',
  };

  const handleOpenModal = (order: any) => {
    setEditingOrder(order);
    setFormData({
      customer: order.customer,
      status: order.status,
      total: order.total.replace(/,/g, '')
    });
    setIsModalOpen(true);
  };

  const handleUpdateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrders(orders.map(o => 
      o.id === editingOrder.id 
        ? { 
            ...o, 
            customer: formData.customer, 
            status: formData.status, 
            total: Number(formData.total).toLocaleString() 
          } 
        : o
    ));
    setIsModalOpen(false);
    alert('Buyurtma ma\'lumotlari va holati saqlandi! ✅');
  };

  const handleDeleteOrder = (id: string) => {
    if (confirm('Ushbu buyurtmani o\'chirishni tasdiqlaysizmi?')) {
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  const handleNextStatus = (order: any) => {
    const statuses = ['NEW', 'WASHING', 'FINISHED'];
    const currentIndex = statuses.indexOf(order.status);
    if (currentIndex < statuses.length - 1) {
      const nextStatus = statuses[currentIndex + 1];
      setOrders(orders.map(o => o.id === order.id ? { ...o, status: nextStatus } : o));
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(search.toLowerCase()) || 
                         order.id.toLowerCase().includes(search.toLowerCase()) ||
                         order.company.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight border-b-2 border-indigo-600 inline-block pb-1">
            Buyurtmalar Monitoringi
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Barcha korxonalar bo'ylab buyurtmalar oqimini kuzatish va boshqarish</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative w-full md:w-96">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input 
            type="text" 
            placeholder="Kompaniya, Mijoz yoki ID..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="px-4 py-3 bg-slate-50 text-slate-600 border border-slate-100 rounded-xl outline-none font-bold text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Barcha Holatlar</option>
            <option value="NEW">Yangi</option>
            <option value="WASHING">Yuvilmoqda</option>
            <option value="FINISHED">Tayyor</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-widest">
                <th className="py-5 px-8 text-center w-20">ID</th>
                <th className="py-5 px-6">Kompaniya</th>
                <th className="py-5 px-6">Mijoz</th>
                <th className="py-5 px-6">Sana</th>
                <th className="py-5 px-6 text-center">Holati</th>
                <th className="py-5 px-6">Summa</th>
                <th className="py-5 px-8 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length > 0 ? filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-5 px-8 text-center">
                    <span className="font-black text-slate-800 text-xs tracking-tight bg-slate-100 px-2 py-1 rounded">{order.id}</span>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-2">
                      <MdBusiness className="text-indigo-400" />
                      <span className="font-bold text-slate-700 text-sm">{order.company}</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 font-bold text-slate-600 text-sm">
                    {order.customer}
                  </td>
                  <td className="py-5 px-6 text-slate-500 text-xs font-bold">{order.date}</td>
                  <td className="py-5 px-6 text-center">
                    <button 
                      onClick={() => handleNextStatus(order)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-tighter border transition-all active:scale-95 ${statusColors[order.status] || 'bg-slate-100'}`}
                      title="Holatni o'zgartirish"
                    >
                      {statusLabels[order.status] || order.status}
                    </button>
                  </td>
                  <td className="py-5 px-6 font-black text-slate-800 text-sm">
                    {order.total} sum
                  </td>
                  <td className="py-5 px-8 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(order)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-xs font-bold"
                      >
                        Tahrirlash
                      </button>
                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs font-bold"
                      >
                        O'chirish
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <MdShoppingCart className="text-6xl text-slate-100 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest">Buyurtmalar topilmadi</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Order Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Buyurtma: ${editingOrder?.id}`}
      >
        <form onSubmit={handleUpdateOrder} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Mijoz ismi</label>
            <input 
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-bold"
              value={formData.customer}
              onChange={(e) => setFormData({...formData, customer: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Buyurtma holati</label>
            <select 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none bg-white font-bold"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="NEW">Yangi (NEW)</option>
              <option value="WASHING">Yuvilmoqda (WASHING)</option>
              <option value="FINISHED">Tayyor (FINISHED)</option>
              <option value="CANCELLED">Atkaz (CANCELLED)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Umumiy summa (sum)</label>
            <input 
              required
              type="number"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-bold"
              value={formData.total}
              onChange={(e) => setFormData({...formData, total: e.target.value})}
            />
          </div>
          <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl mt-4 hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
            O'zgarishlarni Saqlash
          </button>
        </form>
      </Modal>
    </div>
  );
}
