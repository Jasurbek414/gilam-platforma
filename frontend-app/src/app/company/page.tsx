'use client';

import React, { useState, useEffect } from 'react';
import { 
  MdTrendingUp, 
  MdTrendingDown, 
  MdPeople, 
  MdShoppingCart, 
  MdPhoneInTalk, 
  MdAdd, 
  MdPerson, 
  MdLocationOn, 
  MdAttachMoney
} from 'react-icons/md';
import Modal from '@/components/ui/Modal';
import { ordersApi, usersApi, getUser, customersApi, servicesApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CompanyDashboardPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily'); 
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [companyStats, setCompanyStats] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({
    phone: '',
    customerName: '',
    serviceId: '',
    quantity: '1',
    address: ''
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
      const [ordersData, statsData, usersData, servicesData] = await Promise.all([
        ordersApi.getByCompany(companyId),
        ordersApi.getCompanyStats(companyId),
        usersApi.getByCompany(companyId),
        servicesApi.getByCompany(companyId)
      ]);
      setOrders(ordersData);
      setCompanyStats(statsData);
      setUsers(usersData);
      setServices(servicesData);
      if (servicesData.length > 0 && !formData.serviceId) {
        setFormData(prev => ({ ...prev, serviceId: servicesData[0].id }));
      }
    } catch (err) {
      console.error('Ma\'lumotlarni yuklashda xato:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || !formData.serviceId) {
      toast.error('Telefon va xizmat turini kiriting');
      return;
    }

    setSubmitting(true);
    try {
      let customerId = selectedCustomer?.id;

      // 1. Agar yangi mijoz bo'lsa - yaratish
      if (!customerId) {
        const newCustomer = await customersApi.create({
          fullName: formData.customerName || 'Ismsiz Mijoz',
          phone: formData.phone,
          address: formData.address || 'Kiritilmagan',
          companyId: user.company.id
        });
        customerId = newCustomer.id;
      }

      // 2. Buyurtma yaratish
      await ordersApi.create({
        customerId,
        companyId: user.company.id,
        operatorId: user.id,
        items: [{
          serviceId: formData.serviceId,
          quantity: Number(formData.quantity) || 1,
          width: 0,
          length: 0
        }]
      });

      toast.success('Buyurtma muvaffaqiyatli yaratildi!');
      setIsModalOpen(false);
      setFormData({ phone: '', customerName: '', serviceId: '', quantity: '1', address: '' });
      setSelectedCustomer(null);
      loadData(user.company.id); // Yangilash
    } catch (err: any) {
      toast.error(err.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = [
    { 
      title: "Jami Buyurtmalar", 
      value: companyStats?.totalOrders || "0", 
      trend: "+12%", up: true, icon: MdShoppingCart, color: "blue" 
    },
    { 
      title: "Yangi Buyurtmalar", 
      value: companyStats?.newOrders || "0", 
      trend: "-2%", up: false, icon: MdPhoneInTalk, color: "rose" 
    },
    { 
      title: "Jarayonda", 
      value: companyStats?.inProgress || "0", 
      trend: "+5%", up: true, icon: MdTrendingUp, color: "emerald" 
    },
    { 
      title: "Xodimlar", 
      value: `${users.length} ta`, 
      trend: "Hammasi liniyada", up: true, icon: MdPeople, color: "indigo" 
    },
  ];

  const statusLabels: Record<string, string> = {
    'NEW': 'Yangi',
    'DRIVER_ASSIGNED': 'Haydovchi kutilyapti',
    'PICKED_UP': 'Olib ketildi',
    'AT_FACILITY': 'Korxonada',
    'WASHING': 'Yuvilmoqda',
    'DRYING': 'Quritilmoqda',
    'READY_FOR_DELIVERY': 'Tayyor',
    'OUT_FOR_DELIVERY': 'Yetkazilmoqda',
    'DELIVERED': 'Tayyor/Yopilgan',
    'CANCELLED': 'Bekor qilingan',
  };

  const statusColors: Record<string, string> = {
    'NEW': 'slate',
    'WASHING': 'blue',
    'READY_FOR_DELIVERY': 'emerald',
    'OUT_FOR_DELIVERY': 'indigo',
    'DRIVER_ASSIGNED': 'amber',
  };

  const recentOrders = orders.slice(0, 8);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Xush kelibsiz, {user.fullName.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-sm">
            Tashkilot: <span className="text-blue-600 font-bold">{user.company.name}</span> boshqaruv panelidasiz.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl hidden md:flex">
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
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

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all"
          >
            <MdAdd className="text-xl" />
            Vaqtincha Buyurtma
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
            <button className="text-sm font-medium text-blue-600 hover:underline" onClick={() => router.push('/company/orders')}>Barchasini ko'rish</button>
          </div>
          <div className="p-0 overflow-x-auto text-nowrap">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4">ID / Mijoz</th>
                  <th className="px-6 py-4">Holati</th>
                  <th className="px-6 py-4">Operator/Haydovchi</th>
                  <th className="px-6 py-4 text-right">Summa (so'm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.length > 0 ? recentOrders.map((order) => {
                  const color = statusColors[order.status] || 'slate';
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">#{order.id.split('-')[0].substring(0,6).toUpperCase()}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{order.customer?.fullName || 'Noma\'lum'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-tighter bg-${color}-100 text-${color}-700 border border-${color}-200`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">
                        {order.operator ? `Op: ${order.operator.fullName.split(' ')[0]}` : ''}
                        {order.driver ? <br/> : ''}
                        {order.driver ? `Haydovchi: ${order.driver.fullName.split(' ')[0]}` : ''}
                        {!order.operator && !order.driver ? '-' : ''}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-black text-slate-800">{Number(order.totalAmount).toLocaleString()}</p>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 font-medium">Hozircha buyurtmalar yo'q</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">Xodimlar Jamoasi ({users.length})</h2>
          </div>
          <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[400px]">
            {users.length > 0 ? users.map((u) => {
               const roleColor = 
                  u.role === 'DRIVER' ? 'amber' : 
                  u.role === 'OPERATOR' ? 'indigo' : 
                  u.role === 'WASHER' ? 'emerald' : 'slate';
               const displayRole = u.role.replace('_', ' ');

               return (
                <div key={u.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-xl transition-colors">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full bg-${roleColor}-100 text-${roleColor}-700 flex items-center justify-center font-bold`}>
                      {u.fullName[0].toUpperCase()}
                    </div>
                    {u.status === 'ACTIVE' && (
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full bg-emerald-500`}></span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{u.fullName}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{displayRole}</p>
                  </div>
                </div>
               );
            }) : (
              <p className="text-slate-500 text-center text-sm font-medium">Boshqa xodimlar topilmadi.</p>
            )}
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Tezkor Buyurtma Yaratish"
      >
        <form onSubmit={handleCreateOrder} className="space-y-5 p-1">
          <div className="space-y-4">
            {/* Telefon */}
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Mijoz Telefoni</label>
              <input
                type="text"
                required
                placeholder="+998 90 123 45 67"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold"
                value={formData.phone}
                onChange={async (e) => {
                  const val = e.target.value;
                  setFormData({...formData, phone: val});
                  if (val.length >= 7) {
                    const found = await customersApi.search(user.company.id, val);
                    if (found && found.length > 0) {
                      setSelectedCustomer(found[0]);
                      setFormData(prev => ({...prev, customerName: found[0].fullName, address: found[0].address}));
                    } else {
                      setSelectedCustomer(null);
                    }
                  }
                }}
              />
              {selectedCustomer && (
                <p className="mt-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md inline-block uppercase animate-pulse">
                  Mijoz topildi: {selectedCustomer.fullName}
                </p>
              )}
            </div>

            {/* Ism */}
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Mijoz Ismi</label>
              <input
                type="text"
                placeholder="Mijoz to'liq ismi"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold"
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              />
            </div>

            {/* Xizmat va Miqdor */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Xizmat turi</label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold appearance-none"
                  value={formData.serviceId}
                  onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
                >
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.price} so'm)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Kvadrat (m²)</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                />
              </div>
            </div>

            {/* Manzil */}
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Manzil (Kollektor uchun)</label>
              <input
                type="text"
                placeholder="Ko'cha, uy raqami..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
             <button 
              type="button"
              disabled={submitting}
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-3.5 text-sm font-black text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors uppercase tracking-widest"
            >
              Yopish
            </button>
            <button 
              type="submit"
              disabled={submitting}
              className={`flex-1 py-3.5 text-sm font-black text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all uppercase tracking-widest flex items-center justify-center gap-2 ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saqlanmoqda...
                </>
              ) : (
                'Saqlash'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
