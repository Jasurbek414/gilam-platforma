'use client';

import React, { useState, useEffect } from 'react';
import { 
  MdPeople, 
  MdSearch, 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdPhone, 
  MdLocationOn, 
  MdClose,
  MdCheckCircle
} from 'react-icons/md';
import Modal from '@/components/ui/Modal';
import { customersApi, getUser } from '@/lib/api';
import { User, Customer } from '@/types';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/ui/MapPicker'), { 
  ssr: false,
  loading: () => <div className="h-[300px] bg-slate-50 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 font-bold uppercase text-xs tracking-widest">Xarita yuklanmoqda...</div>
});

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    location: null as { lat: number, lng: number } | null
  });
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getUser();
    if (currentUser && currentUser.companyId) {
      setUser(currentUser);
      fetchCustomers(currentUser.companyId);
    }
  }, []);

  const fetchCustomers = async (companyId: string) => {
    setLoading(true);
    try {
      const data = await customersApi.getByCompany(companyId);
      setCustomers(data);
    } catch (err) {
      toast.error('Mijozlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    
    if (!user) return;
    
    if (q.length > 2) {
      try {
        const found = await customersApi.search(user.companyId, q);
        setCustomers(found);
      } catch (err) {
        console.error('Search error:', err);
      }
    } else if (q.length === 0) {
      fetchCustomers(user.companyId);
    }
  };

  const handleOpenModal = (customer?: Customer) => {
    setIsMapOpen(false);
    if (customer) {
      setSelectedCustomer(customer);
      setFormData({
        fullName: customer.fullName,
        phone: customer.phone,
        address: customer.address,
        location: null // Location is optional for editing for now
      });
    } else {
      setSelectedCustomer(null);
      setFormData({ fullName: '', phone: '', address: '', location: null });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (selectedCustomer) {
        await customersApi.update(selectedCustomer.id, {
          ...formData,
          companyId: user.companyId,
          operatorId: user.id
        });
        toast.success('Mijoz ma&apos;lumotlari yangilandi');
      } else {
        await customersApi.create({
          ...formData,
          companyId: user.companyId,
          operatorId: user.id
        });
        toast.success('Yangi mijoz qo&apos;shildi');
      }
      setIsModalOpen(false);
      fetchCustomers(user.companyId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
    }
  };

  const confirmDelete = async () => {
    if (!selectedCustomer || !user) return;
    try {
      await customersApi.remove(selectedCustomer.id);
      toast.success('Mijoz o&apos;chirildi');
      setIsDeleteModalOpen(false);
      fetchCustomers(user.companyId);
    } catch (err) {
      toast.error('Mijozni o&apos;chirishda xatolik yuz berdi');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
            <MdPeople />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Mijozlar Bazasi</h1>
            <p className="text-sm font-medium text-slate-500">Jami {customers.length} nafar mijoz</p>
          </div>
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative flex-1 md:w-72">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
            <input 
              type="text" 
              placeholder="Ism yoki telefon orqali..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white outline-none transition-all font-medium text-sm"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all text-sm uppercase tracking-widest"
          >
            <MdAdd className="text-xl" />
            Qo&apos;shish
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Yuklanmoqda...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Mijoz / Telefon</th>
                  <th className="px-6 py-4">Mas&apos;ul Operator</th>
                  <th className="px-6 py-4">Manzil</th>
                  <th className="px-6 py-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {customers.length > 0 ? (customers as any[]).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs">
                          {c.fullName[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-slate-800">{c.fullName}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-bold">
                            <MdPhone className="text-indigo-400" />
                            {c.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center text-[10px] font-black">
                          {c.operator?.fullName?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="font-bold text-xs text-slate-600 truncate max-w-[120px]">
                          {c.operator?.fullName?.split(' ')[0] || 'Noma&apos;lum'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-600 font-medium max-w-[180px] truncate">
                        <MdLocationOn className="text-slate-400 shrink-0" />
                        {c.address}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(c)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Tahrirlash"
                        >
                          <MdEdit className="text-xl" />
                        </button>
                        <button 
                          onClick={() => { setSelectedCustomer(c); setIsDeleteModalOpen(true); }}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="O&apos;chirish"
                        >
                          <MdDelete className="text-xl" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center space-y-3 opacity-30">
                        <MdPeople className="text-7xl" />
                        <p className="font-black text-lg">Mijozlar topilmadi</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={selectedCustomer ? "Mijozni Tahrirlash" : "Yangi Mijoz Qo&apos;shish"}
      >
        <form onSubmit={handleSave} className="space-y-6 p-1 max-h-[80vh] overflow-y-auto pr-2">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">F.I.SH (To&apos;liq ism)</label>
              <input 
                type="text" 
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
                placeholder="Masalan: Azizbek Sodiqov"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Telefon raqami</label>
              <div className="relative">
                <MdPhone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input 
                  type="text" 
                  required
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
                  placeholder="+998"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Manzil</label>
              <div className="relative group">
                <MdLocationOn className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input 
                  type="text" 
                  required
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
                  placeholder="Shahar, ko&apos;cha, uy bino..."
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setIsMapOpen(!isMapOpen)}
                  className={`absolute right-3 top-2 p-2 rounded-xl transition-all ${isMapOpen ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white text-slate-400 hover:text-indigo-600 hover:bg-slate-50 border border-slate-100'}`}
                  title="Xaritadan tanlash"
                >
                  <MdLocationOn className="text-xl" />
                </button>
              </div>

              {isMapOpen && (
                <div className="mt-4 animate-in slide-in-from-top-4 duration-300">
                  <MapPicker 
                    searchQuery={formData.address}
                    onLocationSelect={(lat, lng, address) => {
                      setFormData(prev => ({ ...prev, address, location: { lat, lng } }));
                    }} 
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all font-black"
            >
              Bekor qilish
            </button>
            <button 
              type="submit"
              className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 transition-all font-black"
            >
              <div className="flex items-center justify-center gap-2">
                <MdCheckCircle className="text-lg" />
                {selectedCustomer ? 'Yangilash' : 'Saqlash'}
              </div>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Mijozni O&apos;chirish"
      >
        <div className="space-y-6">
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-4 font-black">
            <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
              <MdDelete className="text-2xl" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">Mijozni o&apos;chirib tashlamoqchimisiz?</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Bu amalni ortga qaytarib bo&apos;lmaydi. Mijozning barcha ma&apos;lumotlari tizimdan o&apos;chiriladi.</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all font-black"
            >
              Yo&apos;q, qolsin
            </button>
            <button 
              onClick={confirmDelete}
              className="flex-1 py-4 bg-rose-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-700 hover:-translate-y-1 active:scale-95 transition-all font-black"
            >
              Ha, o&apos;chirilsin
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
