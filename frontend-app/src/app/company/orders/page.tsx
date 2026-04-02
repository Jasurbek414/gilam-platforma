'use client';

import React, { useState, useEffect } from 'react';
import { MdAdd, MdSearch, MdFilterList, MdShoppingCart, MdPerson, MdPhone, MdLocationOn, MdAttachMoney, MdClose, MdBusinessCenter } from 'react-icons/md';
import Modal from '@/components/ui/Modal';
import { ordersApi, customersApi, servicesApi, getUser } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CompanyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({ 
    customerId: '', 
    notes: '',
    items: [{ serviceId: '', width: '', height: '', quantity: 1, notes: '' }]
  });

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser || !currentUser.company) {
      router.push('/');
      return;
    }
    setUser(currentUser);
    loadData(currentUser.company.id);
  }, [router]);

  async function loadData(companyId: string) {
    try {
      const [ordData, custData, servData] = await Promise.all([
        ordersApi.getByCompany(companyId),
        customersApi.getByCompany(companyId),
        servicesApi.getByCompany(companyId)
      ]);
      setOrders(ordData);
      setCustomers(custData);
      setServices(servData);
    } catch (err) {
      console.error('Data loading error:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = () => {
    setFormData({ 
      customerId: '', 
      notes: '',
      items: [{ serviceId: '', width: '', height: '', quantity: 1, notes: '' }] 
    });
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { serviceId: '', width: '', height: '', quantity: 1, notes: '' }]
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) return toast.error('Mijozni tanlang!');
    
    // Format items
    const formattedItems = formData.items
      .filter((item: any) => item.serviceId)
      .map((item: any) => ({
        serviceId: item.serviceId,
        width: item.width ? Number(item.width) : undefined,
        height: item.height ? Number(item.height) : undefined,
        quantity: item.quantity ? Number(item.quantity) : 1,
        notes: item.notes
      }));

    if (formattedItems.length === 0) return toast.error('Kamida bitta xizmatni tanlang!');

    setSaving(true);
    try {
      if (!user?.company?.id) {
        toast.error('Kompaniya topilmadi');
        return;
      }
      await ordersApi.create({
        companyId: user.company.id,
        customerId: formData.customerId,
        notes: formData.notes,
        items: formattedItems,
        status: 'NEW'
      });
      
      toast.success('Buyurtma muvaffaqiyatli saqlandi! 🎉');
      setIsModalOpen(false);
      await loadData(user.company.id);
    } catch (err: any) {
      toast.error('Xatolik: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await ordersApi.updateStatus(orderId, { status: newStatus });
      toast.success('Holati yangilandi');
      await loadData(user.company.id);
    } catch (err: any) {
      toast.error('Xatolik: ' + err.message);
    }
  };

  const statusLabels: Record<string, string> = {
    'NEW': 'Yangi',
    'DRIVER_ASSIGNED': 'Haydovchi kutilyapti',
    'PICKED_UP': 'Olib ketildi',
    'AT_FACILITY': 'Korxonada',
    'WASHING': 'Yuvilmoqda',
    'DRYING': 'Quritilmoqda',
    'READY_FOR_DELIVERY': 'Tayyor',
    'OUT_FOR_DELIVERY': 'Yetkazilmoqda',
    'DELIVERED': 'Yopilgan',
    'CANCELLED': 'Bekor qilingan',
  };

  const statusColors: Record<string, string> = {
    'NEW': 'slate',
    'DRIVER_ASSIGNED': 'amber',
    'PICKED_UP': 'orange',
    'AT_FACILITY': 'yellow',
    'WASHING': 'blue',
    'DRYING': 'fuchsia',
    'READY_FOR_DELIVERY': 'purple',
    'OUT_FOR_DELIVERY': 'indigo',
    'DELIVERED': 'emerald',
    'CANCELLED': 'red',
  };

  const filteredOrders = orders.filter(order => {
    const custName = order.customer?.fullName?.toLowerCase() || '';
    const custPhone = order.customer?.phone1 || '';
    const matchesSearch = custName.includes(search.toLowerCase()) || custPhone.includes(search) || order.id.includes(search);
    const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
     return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      );
  }

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
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all text-sm active:scale-95"
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
            placeholder="Mijoz ismi, raqami yoki ID..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium text-sm text-slate-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <MdFilterList className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none" />
            <select 
              className="pl-12 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-bold text-sm text-slate-600 appearance-none cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Barcha Holatlar</option>
              {Object.keys(statusLabels).map(k => (
                <option key={k} value={k}>{statusLabels[k]}</option>
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
                <th className="py-5 px-6">Buyurtma ID & Sana</th>
                <th className="py-5 px-6">Mijoz / Telefon</th>
                <th className="py-5 px-6 text-center">Xizmatlar (Soni)</th>
                <th className="py-5 px-6 text-center">Joriy Holat</th>
                <th className="py-5 px-6 text-right">Summa (so'm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length > 0 ? filteredOrders.map((order) => {
                const color = statusColors[order.status] || 'slate';
                return (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-5 px-6">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 tracking-tight text-sm">
                          #{order.id.split('-')[0].substring(0,8).toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-slate-400 mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black text-sm">
                          <MdPerson className="text-xl" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{order.customer?.fullName || 'Anonim'}</p>
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                            <MdPhone className="text-slate-400 text-[10px]" /> {order.customer?.phone1}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className="font-black text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg text-xs">
                        {order.items?.length || 0} ta
                      </span>
                    </td>
                    <td className="py-5 px-6 text-center">
                      <select 
                        className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase border border-transparent hover:border-${color}-300 bg-${color}-100 text-${color}-700 cursor-pointer outline-none transition-colors appearance-none text-center`}
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      >
                        {Object.keys(statusLabels).map(k => (
                          <option key={k} value={k}>{statusLabels[k]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <span className="font-black text-slate-800 text-sm">
                        {Number(order.totalAmount).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                   <td colSpan={5} className="py-12 text-center text-slate-500 font-bold border-none">
                     <MdShoppingCart className="text-6xl text-slate-200 mx-auto mb-3" />
                     Buyurtmalar ro'yxati bo'sh
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yangi Buyurtma Qo'shish">
        <form onSubmit={handleCreateOrder} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Mijozni Tanlang</label>
            <div className="relative">
              <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 text-xl" />
              <select 
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800 appearance-none bg-slate-50 hover:bg-white transition-colors"
                value={formData.customerId}
                onChange={(e) => setFormData({...formData, customerId: e.target.value})}
              >
                <option value="">-- Mijozni tanlang (yoki Mijozlar bo'limidan qo'shing) --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.fullName} ({c.phone1}) - {c.address}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
               <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Buyurtma qismlari (Xizmatlar)</label>
               <button type="button" onClick={handleAddItem} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1">
                 <MdAdd /> Qator qo'shish
               </button>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {formData.items.map((item: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-wrap lg:flex-nowrap gap-3 items-end relative">
                  <div className="w-full lg:w-1/3 space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-400">Xizmat</label>
                    <select
                      required
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-sm font-bold bg-white"
                      value={item.serviceId}
                      onChange={(e) => handleItemChange(idx, 'serviceId', e.target.value)}
                    >
                      <option value="">Tanlang...</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.unit === 'SQM' ? 'kv.m' : s.unit})</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Agar SQM bo'lsa Eni/Bo'yi, aks holda Soni kirgizilishi kerak - soddalashtirilgan view */}
                  <div className="w-1/3 lg:w-20 space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-400">Eni(m)</label>
                    <input type="number" step="0.01" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-sm font-bold placeholder:text-slate-300" placeholder="0.0" value={item.width} onChange={(e) => handleItemChange(idx, 'width', e.target.value)} />
                  </div>
                  <div className="w-1/3 lg:w-20 space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-400">Bo'yi(m)</label>
                    <input type="number" step="0.01" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-sm font-bold placeholder:text-slate-300" placeholder="0.0" value={item.height} onChange={(e) => handleItemChange(idx, 'height', e.target.value)} />
                  </div>
                  <div className="w-1/3 lg:w-20 space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-400">Soni(kg/dona)</label>
                    <input type="number" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-sm font-bold placeholder:text-slate-300" placeholder="1" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} />
                  </div>

                  {idx > 0 && (
                    <button type="button" onClick={() => handleRemoveItem(idx)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 p-1 bg-white rounded-md shadow-sm">
                      <MdClose />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
             <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Qo'shimcha izoh</label>
             <textarea 
               className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-medium text-sm text-slate-700 bg-slate-50 hover:bg-white focus:bg-white transition-all resize-none min-h-[80px]"
               placeholder="Buyurtma uchun izohlar..."
               value={formData.notes}
               onChange={(e) => setFormData({...formData, notes: e.target.value})}
             />
          </div>

          <div className="pt-4 flex gap-3">
             <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-sm font-bold text-slate-500 bg-slate-100 rounded-2xl hover:bg-slate-200 active:scale-95 transition-all">
               BEKOR QILISH
             </button>
             <button type="submit" disabled={saving} className="flex-1 py-4 text-sm font-black tracking-widest uppercase text-white bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50">
               {saving ? 'SAQLANMOQDA...' : 'YANGI BUYURTMA'}
             </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
