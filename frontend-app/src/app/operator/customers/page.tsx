'use client';

import React, { useState, useEffect, Suspense } from 'react';
import {
  MdSearch,
  MdFilterList,
  MdPerson,
  MdPhone,
  MdLocationOn,
  MdHistory,
  MdPhoneInTalk,
  MdAdd,
  MdClose
} from 'react-icons/md';
import { useRouter, useSearchParams } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import { customersApi, getUser } from '@/lib/api';
import toast from 'react-hot-toast';

function CustomersContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', phone1: '', phone2: '', address: '' });
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId');

  useEffect(() => {
    const user = getUser();
    if (!user?.company?.id) return;
    loadCustomers(user.company.id);
  }, []);

  useEffect(() => {
    if (customerId && customers.length > 0) {
      const found = customers.find(c => c.id === customerId);
      if (found) setSelectedCustomer(found);
    }
  }, [customerId, customers]);

  async function loadCustomers(companyId: string) {
    try {
      const data = await customersApi.getByCompany(companyId);
      setCustomers(data);
    } catch {
      toast.error('Mijozlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }

  const handleCallback = (phone: string) => {
    router.push(`/operator/calls?phone=${encodeURIComponent(phone)}`);
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = getUser();
    if (!user?.company?.id) return;
    setSaving(true);
    try {
      await customersApi.create({ ...formData, companyId: user.company.id });
      toast.success('Mijoz qo\'shildi!');
      setIsAddModalOpen(false);
      setFormData({ fullName: '', phone1: '', phone2: '', address: '' });
      await loadCustomers(user.company.id);
    } catch (err: any) {
      toast.error(err.message || 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const q = searchQuery.toLowerCase();
    return (
      customer.fullName?.toLowerCase().includes(q) ||
      customer.phone1?.includes(searchQuery) ||
      customer.phone2?.includes(searchQuery)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Mijozlar Bazasi (CRM)</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Mijozlar ma'lumotlarini tahlil qiling va aloqada bo'ling</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all text-sm"
        >
          <MdAdd className="text-xl" /> Yangi Mijoz
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input
            type="text"
            placeholder="Mijoz ismi yoki telefon raqami orqali qidirish..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-white shadow-sm outline-none focus:border-indigo-500 transition-all font-medium text-slate-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-8 py-5">Mijoz / Aloqa</th>
                <th className="px-8 py-5">Manzil</th>
                <th className="px-8 py-5">Qo'shimcha Telefon</th>
                <th className="px-8 py-5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 border border-indigo-100">
                        {customer.fullName?.[0] || '?'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-800">{customer.fullName}</span>
                        <span className="text-xs font-bold text-slate-400 italic flex items-center gap-1">
                          <MdPhone className="text-slate-300" /> {customer.phone1}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm text-slate-600 font-medium flex items-center gap-1">
                      <MdLocationOn className="text-slate-300" />
                      {customer.address || '—'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm text-slate-500 font-medium">{customer.phone2 || '—'}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="p-2.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Batafsil ma'lumot"
                      >
                        <MdHistory className="text-xl" />
                      </button>
                      <button
                        onClick={() => handleCallback(customer.phone1)}
                        className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Qo'ng'iroq qilish"
                      >
                        <MdPhoneInTalk className="text-xl" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-bold">
                    <MdPerson className="text-6xl text-slate-200 mx-auto mb-3" />
                    {searchQuery ? 'Qidiruv natijasi topilmadi' : 'Mijozlar ro\'yxati bo\'sh'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mijoz detail modal */}
      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title="Mijoz haqida batafsil"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[35px] border border-slate-100">
              <div className="w-20 h-20 rounded-[30px] bg-indigo-600 flex items-center justify-center text-3xl text-white font-black shadow-xl shadow-indigo-100">
                {selectedCustomer.fullName?.[0] || '?'}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">{selectedCustomer.fullName}</h3>
                <div className="flex flex-col gap-1 mt-2">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                    <MdPhone className="text-indigo-500" /> {selectedCustomer.phone1}
                  </div>
                  {selectedCustomer.phone2 && (
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                      <MdPhone className="text-slate-400" /> {selectedCustomer.phone2}
                    </div>
                  )}
                  {selectedCustomer.address && (
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                      <MdLocationOn className="text-emerald-500" /> {selectedCustomer.address}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => { handleCallback(selectedCustomer.phone1); setSelectedCustomer(null); }}
              className="w-full py-5 bg-indigo-600 text-white font-black rounded-[25px] shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3"
            >
              <MdPhoneInTalk className="text-xl animate-pulse" /> Qayta Qo'ng'iroq Qilish
            </button>
          </div>
        )}
      </Modal>

      {/* Yangi mijoz qo'shish modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Yangi Mijoz Qo'shish"
      >
        <form onSubmit={handleAddCustomer} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">To'liq Ism *</label>
            <input
              required
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm text-slate-700 bg-slate-50"
              placeholder="Aliyev Vali Umarovich"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Telefon 1 *</label>
            <input
              required
              type="tel"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm text-slate-700 bg-slate-50"
              placeholder="+998901234567"
              value={formData.phone1}
              onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Telefon 2</label>
            <input
              type="tel"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm text-slate-700 bg-slate-50"
              placeholder="+998901234567 (ixtiyoriy)"
              value={formData.phone2}
              onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Manzil</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-medium text-sm text-slate-700 bg-slate-50"
              placeholder="Chilonzor 9, 12-uy"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-4 text-sm font-bold text-slate-500 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all">
              Bekor qilish
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-4 text-sm font-black text-white bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50">
              {saving ? 'Saqlanmoqda...' : 'SAQLASH'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function OperatorCustomersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CustomersContent />
    </Suspense>
  );
}
