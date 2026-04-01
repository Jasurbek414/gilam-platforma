'use client';

import React, { useState, useEffect } from 'react';
import { MdAdd, MdPhone, MdBusiness } from 'react-icons/md';
import Modal from '@/components/ui/Modal';
import { companiesApi } from '@/lib/api';

export default function CompaniesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    status: 'ACTIVE'
  });

  // Bazadan yuklash
  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    try {
      const data = await companiesApi.getAll();
      setCompanies(data);
    } catch (err) {
      console.error('Kompaniyalarni yuklashda xato:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (company: any = null) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name,
        phoneNumber: company.phoneNumber || '',
        status: company.status,
      });
    } else {
      setEditingCompany(null);
      setFormData({ name: '', phoneNumber: '', status: 'ACTIVE' });
    }
    setIsModalOpen(true);
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCompany) {
        await companiesApi.update(editingCompany.id, formData);
      } else {
        await companiesApi.create(formData);
      }
      await loadCompanies();
      setIsModalOpen(false);
      setEditingCompany(null);
    } catch (err: any) {
      alert('Xatolik: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Ushbu korxonani o\'chirishni tasdiqlaysizmi?')) {
      try {
        await companiesApi.remove(id);
        await loadCompanies();
      } catch (err: any) {
        alert('Xatolik: ' + err.message);
      }
    }
  };

  const handleToggleStatus = async (company: any) => {
    const newStatus = company.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await companiesApi.update(company.id, { status: newStatus });
      await loadCompanies();
    } catch (err: any) {
      alert('Xatolik: ' + err.message);
    }
  };

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
            Korxonalar Ro&apos;yxati
          </h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Bazadan {companies.length} ta korxona topildi</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all active:scale-95"
        >
          <MdAdd className="text-xl" />
          Yangi Korxona
        </button>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCompany ? 'Korxonani Tahrirlash' : 'Yangi Korxona Qo\'shish'}
      >
        <form onSubmit={handleCreateOrUpdate} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">Holati</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'ACTIVE' })}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                  formData.status === 'ACTIVE'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-white text-slate-500 border border-slate-200'
                }`}
              >
                ✅ Faol
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'INACTIVE' })}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                  formData.status === 'INACTIVE'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                    : 'bg-white text-slate-500 border border-slate-200'
                }`}
              >
                🛑 Bloklangan
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Korxona Nomi</label>
            <div className="relative">
              <MdBusiness className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 text-xl" />
              <input
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-slate-800"
                placeholder="Masalan: Pokiza MChJ"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Telefon</label>
            <div className="relative">
              <MdPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 text-xl" />
              <input
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-indigo-500 outline-none font-bold text-slate-800"
                placeholder="+998 90 000 00 00"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl"
            >
              BEKOR QILISH
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/30 active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? 'SAQLANMOQDA...' : editingCompany ? 'YANGILASH' : 'SAQLASH'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 text-xs font-black uppercase tracking-widest">
                <th className="py-5 px-8">Korxona</th>
                <th className="py-5 px-6">Telefon</th>
                <th className="py-5 px-6">Xodimlar</th>
                <th className="py-5 px-6 text-center">Holati</th>
                <th className="py-5 px-8 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center">
                        {company.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">{company.name}</span>
                        <p className="text-[10px] text-slate-400 font-bold">ID: {company.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-2 text-slate-600 text-sm font-bold">
                      <MdPhone className="text-slate-400" />
                      {company.phoneNumber || '—'}
                    </div>
                  </td>
                  <td className="py-5 px-6 font-black text-slate-700">
                    {company.users?.length || 0}
                  </td>
                  <td className="py-5 px-6 text-center">
                    <button
                      onClick={() => handleToggleStatus(company)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-tighter border transition-all active:scale-95 ${
                        company.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : 'bg-red-100 text-red-700 border-red-200'
                      }`}
                    >
                      {company.status === 'ACTIVE' ? 'Faol' : 'Bloklangan'}
                    </button>
                  </td>
                  <td className="py-5 px-8 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(company)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-xs font-bold"
                      >
                        Tahrirlash
                      </button>
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs font-bold"
                      >
                        O&apos;chirish
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 text-sm text-slate-500 font-bold">
          Jami: {companies.length} ta korxona
        </div>
      </div>
    </div>
  );
}
