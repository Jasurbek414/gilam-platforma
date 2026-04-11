'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  MdAdd, MdSearch, MdFilterList, MdPerson, MdClose,
  MdAccessTime, MdExpandMore, MdExpandLess
} from 'react-icons/md';
import Modal from '@/components/ui/Modal';
import { ordersApi, customersApi, servicesApi, getUser } from '@/lib/api';
import toast from 'react-hot-toast';

const MEASUREMENT_UNITS = [
  { value: 'SQM', label: 'kv.m (Kvadrat metr)' },
  { value: 'KG', label: 'kg (Kilogramm)' },
  { value: 'METER', label: 'metr' },
  { value: 'PIECE', label: 'dona' },
  { value: 'SET', label: 'to\'plam' },
  { value: 'HOUR', label: 'soat' },
  { value: 'FIXED', label: 'belgilangan narx' },
];

const statusLabels: Record<string, string> = {
  'NEW': 'Yangi',
  'DRIVER_ASSIGNED': 'Haydovchi kutilyapti',
  'PICKED_UP': 'Olib ketildi',
  'AT_FACILITY': 'Korxonada',
  'WASHING': 'Yuvilmoqda',
  'DRYING': 'Quritilmoqda',
  'FINISHED': 'Tayyor (yetkazishga)',
  'OUT_FOR_DELIVERY': 'Yetkazilmoqda',
  'DELIVERED': 'Yetkazildi',
  'CANCELLED': 'Bekor qilingan',
};

const statusColors: Record<string, string> = {
  'NEW': 'bg-indigo-50 text-indigo-600 border-indigo-200',
  'DRIVER_ASSIGNED': 'bg-amber-50 text-amber-600 border-amber-200',
  'PICKED_UP': 'bg-orange-50 text-orange-600 border-orange-200',
  'AT_FACILITY': 'bg-blue-50 text-blue-600 border-blue-200',
  'WASHING': 'bg-cyan-50 text-cyan-600 border-cyan-200',
  'DRYING': 'bg-sky-50 text-sky-600 border-sky-200',
  'FINISHED': 'bg-emerald-50 text-emerald-600 border-emerald-200',
  'OUT_FOR_DELIVERY': 'bg-teal-50 text-teal-600 border-teal-200',
  'DELIVERED': 'bg-slate-100 text-slate-800 border-slate-300',
  'CANCELLED': 'bg-rose-50 text-rose-600 border-rose-200',
};

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
    items: [{ serviceId: '', width: '', length: '', quantity: 1, notes: '' }]
  });

  // Inline customer quick-add
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState({ fullName: '', phone1: '', phone2: '', address: '' });

  // Inline service quick-add
  const [showAddService, setShowAddService] = useState(false);
  const [savingService, setSavingService] = useState(false);
  const [serviceForm, setServiceForm] = useState({ name: '', measurementUnit: 'SQM', price: '' });

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser || !currentUser.company) {
      setTimeout(() => router.push('/operator/login'), 0);
      return;
    }
    setUser(currentUser);
    loadData(currentUser.company.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchParams && user && !loading) {
      const phone = searchParams.get('phone');
      if (phone) {
        setFormData((prev: any) => ({ ...prev, notes: `Qo'ng'iroq: ${phone}` }));
        // Auto-select customer by phone if found
        const match = customers.find(c => c.phone1 === phone || c.phone2 === phone);
        if (match) setFormData((prev: any) => ({ ...prev, customerId: match.id }));
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
      items: [{ serviceId: '', width: '', length: '', quantity: 1, notes: '' }]
    });
    setShowAddCustomer(false);
    setShowAddService(false);
    setCustomerForm({ fullName: '', phone1: '', phone2: '', address: '' });
    setServiceForm({ name: '', measurementUnit: 'SQM', price: '' });
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { serviceId: '', width: '', length: '', quantity: 1, notes: '' }]
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

  const handleQuickAddCustomer = async () => {
    if (!user?.company?.id) return;
    if (!customerForm.fullName || !customerForm.phone1) {
      toast.error('Ism va telefon majburiy');
      return;
    }
    setSavingCustomer(true);
    try {
      const newCustomer = await customersApi.create({ ...customerForm, companyId: user.company.id });
      toast.success('Mijoz qo\'shildi!');
      const updated = await customersApi.getByCompany(user.company.id);
      setCustomers(updated);
      setFormData((prev: any) => ({ ...prev, customerId: newCustomer.id }));
      setCustomerForm({ fullName: '', phone1: '', phone2: '', address: '' });
      setShowAddCustomer(false);
    } catch (err: any) {
      toast.error('Xatolik: ' + err.message);
    } finally {
      setSavingCustomer(false);
    }
  };

  const handleQuickAddService = async () => {
    if (!user?.company?.id) return;
    if (!serviceForm.name || !serviceForm.price || Number(serviceForm.price) <= 0) {
      toast.error('Nom va narxni kiriting');
      return;
    }
    setSavingService(true);
    try {
      await servicesApi.create({
        name: serviceForm.name,
        measurementUnit: serviceForm.measurementUnit,
        price: Number(serviceForm.price),
        companyId: user.company.id,
      });
      toast.success('Xizmat turi qo\'shildi!');
      const updated = await servicesApi.getByCompany(user.company.id);
      setServices(updated);
      setServiceForm({ name: '', measurementUnit: 'SQM', price: '' });
      setShowAddService(false);
    } catch (err: any) {
      toast.error('Xatolik: ' + err.message);
    } finally {
      setSavingService(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) return toast.error('Mijozni tanlang!');

    const formattedItems = formData.items
      .filter((item: any) => item.serviceId)
      .map((item: any) => ({
        serviceId: item.serviceId,
        width: item.width ? Number(item.width) : undefined,
        length: item.length ? Number(item.length) : undefined,
        quantity: item.quantity ? Number(item.quantity) : 1,
        notes: item.notes || undefined,
      }));

    if (formattedItems.length === 0) return toast.error('Kamida bitta xizmatni tanlang!');

    setSaving(true);
    try {
      await ordersApi.create({
        customerId: formData.customerId,
        notes: formData.notes || undefined,
        operatorId: user.id,
        items: formattedItems,
      });
      toast.success('Buyurtma saqlandi!');
      await loadData(user.company.id);
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error('Saqlashda xato: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await ordersApi.updateStatus(orderId, { status: newStatus });
      await loadData(user.company.id);
    } catch (err: any) {
      toast.error('Status xatosi: ' + err.message);
    }
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
          <p className="text-slate-500 text-sm font-medium mt-1">Buyurtmalarni qabul qilish va nazorat qilish</p>
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
        <div className="relative min-w-[200px]">
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
                  <tr key={order.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800">#{order.id.split('-')[0].substring(0, 8).toUpperCase()}</span>
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
                        <span className="text-xs font-bold">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-sm font-black text-slate-800">
                        {Number(order.totalAmount).toLocaleString()} <span className="text-[10px] text-slate-400">so'm</span>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Yangi Buyurtma Berish">
        <form onSubmit={handleCreateOrder} className="space-y-5">

          {/* === MIJOZ === */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Mijoz</label>
              <button
                type="button"
                onClick={() => { setShowAddCustomer(v => !v); setShowAddService(false); }}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-all"
              >
                {showAddCustomer ? <MdExpandLess /> : <MdAdd />}
                {showAddCustomer ? 'Yopish' : 'Yangi mijoz qo\'shish'}
              </button>
            </div>

            <div className="relative">
              <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 text-xl pointer-events-none" />
              <select
                required={!showAddCustomer}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-slate-800 appearance-none bg-slate-50 hover:bg-white transition-colors text-sm"
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              >
                <option value="">— Mijozni tanlang —</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.fullName} · {c.phone1}</option>
                ))}
              </select>
            </div>

            {showAddCustomer && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Yangi mijoz ma'lumotlari</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">To'liq ism *</label>
                    <input
                      type="text"
                      placeholder="Aliyev Vali"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm font-bold bg-white"
                      value={customerForm.fullName}
                      onChange={e => setCustomerForm({ ...customerForm, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Telefon 1 *</label>
                    <input
                      type="tel"
                      placeholder="+998901234567"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm font-bold bg-white"
                      value={customerForm.phone1}
                      onChange={e => setCustomerForm({ ...customerForm, phone1: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Telefon 2</label>
                    <input
                      type="tel"
                      placeholder="+998901234567"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm font-bold bg-white"
                      value={customerForm.phone2}
                      onChange={e => setCustomerForm({ ...customerForm, phone2: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Manzil</label>
                    <input
                      type="text"
                      placeholder="Chilonzor 9, 12-uy"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm font-bold bg-white"
                      value={customerForm.address}
                      onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleQuickAddCustomer}
                  disabled={savingCustomer}
                  className="w-full py-2.5 bg-indigo-600 text-white text-sm font-black rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {savingCustomer ? 'Saqlanmoqda...' : 'Mijozni saqlash va tanlash'}
                </button>
              </div>
            )}
          </div>

          {/* === XIZMATLAR === */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Xizmatlar ro'yxati</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setShowAddService(v => !v); setShowAddCustomer(false); }}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-all"
                >
                  {showAddService ? <MdExpandLess /> : <MdAdd />}
                  {showAddService ? 'Yopish' : 'Yangi xizmat turi'}
                </button>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-all"
                >
                  <MdAdd /> Qator qo'shish
                </button>
              </div>
            </div>

            {showAddService && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Yangi xizmat turi</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Xizmat nomi *</label>
                    <input
                      type="text"
                      placeholder="Gilam yuvish, Parma tozalash..."
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none text-sm font-bold bg-white"
                      value={serviceForm.name}
                      onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">O'lchov birligi *</label>
                    <select
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none text-sm font-bold bg-white"
                      value={serviceForm.measurementUnit}
                      onChange={e => setServiceForm({ ...serviceForm, measurementUnit: e.target.value })}
                    >
                      {MEASUREMENT_UNITS.map(u => (
                        <option key={u.value} value={u.value}>{u.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Narxi (so'm) *</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="25000"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none text-sm font-bold bg-white"
                      value={serviceForm.price}
                      onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleQuickAddService}
                  disabled={savingService}
                  className="w-full py-2.5 bg-emerald-600 text-white text-sm font-black rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50"
                >
                  {savingService ? 'Saqlanmoqda...' : 'Xizmat turini saqlash'}
                </button>
              </div>
            )}

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {formData.items.map((item: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-wrap lg:flex-nowrap gap-3 items-end relative transition-all hover:border-indigo-100">
                  <div className="w-full lg:w-1/3 space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-400">Xizmat *</label>
                    <select
                      required
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 outline-none text-sm font-bold bg-white focus:border-indigo-500"
                      value={item.serviceId}
                      onChange={(e) => handleItemChange(idx, 'serviceId', e.target.value)}
                    >
                      <option value="">Tanlang...</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} — {Number(s.price).toLocaleString()} so'm/{s.measurementUnit === 'SQM' ? 'kv.m' : s.measurementUnit === 'PIECE' ? 'dona' : s.measurementUnit === 'KG' ? 'kg' : s.measurementUnit.toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-1/3 lg:w-20 space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-400">Eni (m)</label>
                    <input type="number" step="0.01" min="0" placeholder="0.0"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm font-bold"
                      value={item.width} onChange={(e) => handleItemChange(idx, 'width', e.target.value)} />
                  </div>
                  <div className="w-1/3 lg:w-20 space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-400">Bo'yi (m)</label>
                    <input type="number" step="0.01" min="0" placeholder="0.0"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm font-bold"
                      value={item.length} onChange={(e) => handleItemChange(idx, 'length', e.target.value)} />
                  </div>
                  <div className="w-1/3 lg:w-20 space-y-1.5">
                    <label className="text-[10px] uppercase font-black text-slate-400">Soni</label>
                    <input type="number" min="1" placeholder="1"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none text-sm font-bold"
                      value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} />
                  </div>
                  {idx > 0 && (
                    <button type="button" onClick={() => handleRemoveItem(idx)}
                      className="absolute top-3 right-3 text-red-400 hover:text-red-600 p-1 bg-white rounded-md shadow-sm border border-slate-100">
                      <MdClose />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* === IZOH === */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Qo'shimcha izohlar</label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm text-slate-700 bg-slate-50 hover:bg-white focus:bg-white transition-all resize-none min-h-[70px]"
              placeholder="Uy tagida eshik bor... (ixtiyoriy)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="pt-2 flex gap-4">
            <button type="button" onClick={() => setIsModalOpen(false)}
              className="flex-1 py-4 text-sm font-black text-slate-400 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest">
              BEKOR QILISH
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-4 text-sm font-black text-white bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all uppercase tracking-widest disabled:opacity-50 disabled:translate-y-0">
              {saving ? 'SAQLANMOQDA...' : 'BUYURTMA QABUL QILISH'}
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
