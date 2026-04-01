'use client';

import React, { useState } from 'react';
import { MdAdd, MdSearch, MdFilterList, MdMoreVert, MdShoppingCart, MdPerson, MdPhone, MdLocationOn, MdAttachMoney, MdDateRange } from 'react-icons/md';
import Modal from '@/components/ui/Modal';

const initialOrders = [
  { id: 'ORD-101', customer: 'Aliyev Vali', phone: '+998 90 123 45 67', status: 'NEW', total: '0', date: '20.10.2023' },
  { id: 'ORD-102', customer: 'Zilola', phone: '+998 94 444 55 66', status: 'WASHING', total: '120,000', date: '19.10.2023' },
  { id: 'ORD-103', customer: 'Botir Gani', phone: '+998 93 987 65 43', status: 'FINISHED', total: '85,000', date: '18.10.2023' },
];

export default function CompanyOrdersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [formData, setFormData] = useState({ 
    customer: '', 
    phone: '', 
    address: '', 
    service: 'oddiy',
    status: 'NEW'
  });

  const handleOpenModal = (order: any = null) => {
    if (order) {
      setEditingOrder(order);
      setFormData({
        customer: order.customer,
        phone: order.phone,
        address: order.address || '',
        service: order.service || 'oddiy',
        status: order.status
      });
    } else {
      setEditingOrder(null);
      setFormData({ customer: '', phone: '', address: '', service: 'oddiy', status: 'NEW' });
    }
    setIsModalOpen(true);
  };

  const handleCreateOrUpdateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOrder) {
      setOrders(orders.map(o => 
        o.id === editingOrder.id 
          ? { ...o, ...formData } 
          : o
      ));
      alert('Buyurtma muvaffaqiyatli yangilandi! ✅');
    } else {
      const newOrder = {
        id: `ORD-${orders.length + 101}`,
        customer: formData.customer,
        phone: formData.phone,
        address: formData.address,
        service: formData.service,
        status: 'NEW',
        total: '0',
        date: new Date().toLocaleDateString()
      };
      setOrders([newOrder, ...orders]);
      alert('Yangi buyurtma muvaffaqiyatli yaratildi! ✅');
    }
    setIsModalOpen(false);
    setFormData({ customer: '', phone: '', address: '', service: 'oddiy', status: 'NEW' });
    setEditingOrder(null);
  };

  const handleDeleteOrder = (id: string) => {
    if (confirm('Ushbu buyurtmani o\'chirishni tasdiqlaysizmi?')) {
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  const statusColors: Record<string, string> = {
    'NEW': 'bg-blue-100 text-blue-700',
    'WASHING': 'bg-amber-100 text-amber-700',
    'FINISHED': 'bg-emerald-100 text-emerald-700',
  };

  const statusLabels: Record<string, string> = {
    'NEW': 'Yangi',
    'WASHING': 'Yuvilmoqda',
    'FINISHED': 'Tayyor',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight border-b-2 border-blue-600 inline-block pb-1">
            Buyurtmalar Ro'yxati
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Barcha buyurtmalarni kuzatish va holatini yangilash</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all active:scale-95"
        >
          <MdAdd className="text-xl" />
          Yangi Buyurtma
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative w-full md:w-96">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input 
            type="text" 
            placeholder="Mijoz ismi yoki ID..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative group">
            <MdFilterList className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-sm text-slate-600 appearance-none cursor-pointer hover:bg-slate-100"
            >
              <option value="ALL">Barcha Holatlar</option>
              <option value="NEW">Yangi</option>
              <option value="WASHING">Yuvilmoqda</option>
              <option value="FINISHED">Tayyor</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-widest">
                <th className="py-5 px-8">Buyurtma ID / Mijoz</th>
                <th className="py-5 px-8">Telefon</th>
                <th className="py-5 px-8">Holati</th>
                <th className="py-5 px-8">Summa</th>
                <th className="py-5 px-8 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders
                .filter(o => 
                  (filterStatus === 'ALL' || o.status === filterStatus) &&
                  (o.customer.toLowerCase().includes(search.toLowerCase()) || 
                   o.id.toLowerCase().includes(search.toLowerCase()))
                )
                .map(order => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-5 px-8">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 text-sm tracking-tight">{order.id}</span>
                      <span className="text-slate-500 text-xs font-bold">{order.customer}</span>
                    </div>
                  </td>
                  <td className="py-5 px-8 text-slate-600 text-sm font-bold">{order.phone}</td>
                  <td className="py-5 px-8">
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${statusColors[order.status] || 'bg-slate-100'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="py-5 px-8 font-black text-slate-800 text-sm">
                    {order.total} sum
                  </td>
                  <td className="py-5 px-8 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(order)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all font-bold text-xs"
                      >
                        Tahrirlash
                      </button>
                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-xs"
                      >
                        O'chirish
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
        title={editingOrder ? "Buyurtmani Tahrirlash" : "Yangi Buyurtma Yaratish"}
      >
        <form onSubmit={handleCreateOrUpdateOrder} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Mijoz Ism-sharifi</label>
            <div className="relative">
              <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 text-xl" />
              <input 
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800"
                value={formData.customer}
                onChange={(e) => setFormData({...formData, customer: e.target.value})}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Telefon raqami</label>
              <div className="relative">
                <MdPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 text-xl" />
                <input 
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            {editingOrder && (
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Holati</label>
                <select 
                  className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800 bg-white"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="NEW">Yangi</option>
                  <option value="WASHING">Yuvilmoqda</option>
                  <option value="FINISHED">Tayyor</option>
                </select>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Olib ketish manzili</label>
            <div className="relative">
              <MdLocationOn className="absolute left-4 top-4 text-blue-500 text-xl" />
              <textarea 
                required
                rows={2}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800 resize-none"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Xizmat Turi & Narxlar</label>
            <div className="relative group">
              <MdAttachMoney className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 text-xl" />
              <select 
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800 bg-white appearance-none"
                value={formData.service}
                onChange={(e) => setFormData({...formData, service: e.target.value})}
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
                  <option value="korpacha">Ko'rpacha (25,000)</option>
                  <option value="odeyal">Odeyal (50,000-70,000)</option>
                  <option value="korpa">Ko'rpa</option>
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

          <div className="flex gap-3 mt-4">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl transition-all"
            >
              BEKOR QILISH
            </button>
            <button 
              type="submit" 
              className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 active:scale-95 transition-all"
            >
              {editingOrder ? "SAQLASH" : "TASDIQLASH"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
