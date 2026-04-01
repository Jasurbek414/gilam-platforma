'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  MdAdd, 
  MdSearch, 
  MdFilterList, 
  MdPerson, 
  MdPhone, 
  MdLocationOn, 
  MdCancel,
  MdCheckCircle,
  MdAccessTime,
  MdAttachMoney,
  MdClose
} from 'react-icons/md';
import Modal from '@/components/ui/Modal';
import { ordersApi, customersApi, servicesApi, getUser } from '@/lib/api';

function OrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

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

  // Handle URL query parameters to auto-open modal for incoming calls
  useEffect(() => {
    if (searchParams && user && !loading) {
      const phone = searchParams.get('phone');
      if (phone) {
        // Here we could try to auto-select the customer based on phone
        setFormData((prev: any) => ({ ...prev, notes: `Call from ${phone}` }));
        setIsModalOpen(true);
      }
    }
  }, [searchParams, user, loading]);

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
    if (!formData.customerId) return alert('Mijozni tanlang!');
    
    const formattedItems = formData.items
      .filter((item: any) => item.serviceId)
      .map((item: any) => ({
        serviceId: item.serviceId,
        width: item.width ? Number(item.width) : undefined,
        height: item.height ? Number(item.height) : undefined,
        quantity: item.quantity ? Number(item.quantity) : 1,
        notes: item.notes
      }));

    if (formattedItems.length === 0) return alert('Kamida bitta xizmat qatorini to\'ldiring!');

    setSaving(true);
    try {
      await ordersApi.create({
        customerId: formData.customerId,
        notes: formData.notes,
        operatorId: user.id, // Operator ID is captured
        items: formattedItems
      });
      alert('Buyurtma saqlandi! ✅');
      await loadData(user.company.id);
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Xatolik: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await ordersApi.updateStatus(orderId, { status: newStatus });
      await loadData(user.company.id);
    } catch (err: any) {
      alert('Status o\'zgartirishda xato: ' + err.message);
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
    'NEW': 'bg-indigo-50 text-indigo-600 border-indigo-200',
    'DRIVER_ASSIGNED': 'bg-amber-50 text-amber-600 border-amber-200',
    'READY_FOR_DELIVERY': 'bg-emerald-50 text-emerald-600 border-emerald-200',
    'CANCELLED': 'bg-rose-50 text-rose-600 border-rose-200',
  };

  const filteredOrders = orders.filter(order => {
    const custName = order.customer?.fullName?.toLowerCase() || '';
    const custPhone = order.customer?.phone1 || '';
    const matchesSearch = custName.includes(searchQuery.toLowerCase()) || 
                          order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          custPhone.includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
     return <div className="p-10 text-center text-indigo-500 font-bold">Yuklanmoqda...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Buyurtmalar Boshqaruvi</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Sizning korxonangiz uchun buyurtmalarni qabul qilish va nazorat qilish</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all"
        >
          <MdAdd className="text-xl" />
          Yangi Buyurtma
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input 
            type="text"
            placeholder="Mijoz ismi, ID yoki telefon raqami..."
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
            className="w-full pl-12 pr-10 py-4 bg-white border border-slate-100 rounded-2xl text-slate-500 font-bold outline-none focus:border-indigo-500 transition-all shadow-sm appearance-none cursor-pointer"
          >
            <option value="ALL">Barcha Holatlar</option>
            {Object.keys(statusLabels).map(k => (
               <option key={k} value={k}>{statusLabels[k]}</option>
            ))}
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
                <th className="px-8 py-5 text-center">Xizmatlar</th>
                <th className="px-8 py-5 text-center">Holatni o'zgartirish</th>
                <th className="px-8 py-5">Vaqti</th>
                <th className="px-8 py-5 text-right">Summa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.length > 0 ? filteredOrders.map((order) => {
                const colorClass = statusColors[order.status] || 'bg-slate-50 text-slate-600 border-slate-200';
                
                return (
                  <tr key={order.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800">#{order.id.split('-')[0].substring(0,8).toUpperCase()}</span>
                        <span className="text-xs font-bold text-slate-500 mt-0.5">{order.customer?.fullName || 'Anonim'}</span>
                        <span className="text-[10px] text-slate-400 font-medium italic">{order.customer?.phone1}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                        {order.items?.length || 0} ta
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <select 
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border outline-none cursor-pointer appearance-none transition-all ${colorClass}`}
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      >
                         {Object.keys(statusLabels).map(k => (
                           <option key={k} value={k}>{statusLabels[k]}</option>
                         ))}
                      </select>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <MdAccessTime className="text-sm" />
                        <span className="text-xs font-bold">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <span className="text-sm font-black text-slate-800">
                         {Number(order.totalAmount).toLocaleString()}
                       </span>
                    </td>
                  </tr>
                );
              }) : (
                 <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400 font-bold">Hech qanday buyurtma topilmadi</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yangi Buyurtma Qabul Qilish" size="lg">
        <form onSubmit={handleCreateOrder} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Mijozni Tanlang</label>
            <div className="relative">
              <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 text-xl" />
              <select 
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-slate-800 appearance-none bg-slate-50 hover:bg-white transition-colors"
                value={formData.customerId}
                onChange={(e) => setFormData({...formData, customerId: e.target.value})}
              >
                <option value="">-- Mijozlar (Ro'yxatdan tanlang) --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.fullName} ({c.phone1})</option>
                ))}
              </select>
            </div>
            {customers.length === 0 && (
               <p className="text-[10px] text-rose-500 font-bold mt-1">Xatolik: Tizimda mijozlar yo'q. Dastlab Mijoz qo'shing.</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
               <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Buyurtma Xizmatlar Ro'yxati</label>
               <button type="button" onClick={handleAddItem} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 flex items-center gap-1">
                 <MdAdd /> Qator qo'shish
               </button>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {formData.items.map((item: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-wrap lg:flex-nowrap gap-3 items-end relative transition-all hover:border-indigo-100">
                  <div className="w-full lg:w-1/3 space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-400">Xizmat turlari</label>
                    <select
                      required
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-sm font-bold bg-white focus:border-indigo-500"
                      value={item.serviceId}
                      onChange={(e) => handleItemChange(idx, 'serviceId', e.target.value)}
                    >
                      <option value="">Tanlang...</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.unit})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-1/3 lg:w-20 space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-400">Eni(m)</label>
                    <input type="number" step="0.01" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm font-bold" placeholder="0.0" value={item.width} onChange={(e) => handleItemChange(idx, 'width', e.target.value)} />
                  </div>
                  <div className="w-1/3 lg:w-20 space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-400">Bo'yi(m)</label>
                    <input type="number" step="0.01" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm font-bold" placeholder="0.0" value={item.height} onChange={(e) => handleItemChange(idx, 'height', e.target.value)} />
                  </div>
                  <div className="w-1/3 lg:w-20 space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-400">Soni</label>
                    <input type="number" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm font-bold" placeholder="1" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} />
                  </div>

                  {idx > 0 && (
                    <button type="button" onClick={() => handleRemoveItem(idx)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 p-1 bg-white rounded-md shadow-sm border border-slate-100">
                      <MdClose />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
             <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Qo'shimcha izohlar (haydovchi uchun va h.k)</label>
             <textarea 
               className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm text-slate-700 bg-slate-50 hover:bg-white focus:bg-white transition-all resize-none min-h-[80px]"
               placeholder="Uy tagida eshik bor... (ixtiyoriy)"
               value={formData.notes}
               onChange={(e) => setFormData({...formData, notes: e.target.value})}
             />
          </div>

          <div className="pt-4 flex gap-4">
             <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-sm font-black text-slate-400 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest">
               BEKOR QILISH
             </button>
             <button type="submit" disabled={saving} className="flex-1 py-4 text-sm font-black text-white bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all uppercase tracking-widest disabled:opacity-50 disabled:translate-y-0">
               {saving ? 'SAQLANMOQDA...' : 'YANGI BUYURTMA QABUL QILISH'}
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
    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className={className} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8"></circle>
    </svg>
  );
}
