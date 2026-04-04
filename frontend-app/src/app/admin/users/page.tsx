'use client';

import React, { useState, useEffect } from 'react';
import { MdAdd, MdSearch, MdFilterList, MdPerson, MdEmail, MdBadge, MdBusiness, MdLock, MdPhone, MdEdit, MdDeleteOutline } from 'react-icons/md';
import Modal from '@/components/ui/Modal';
import { usersApi, companiesApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({ 
    fullName: '', 
    phone: '', 
    password: '',
    role: 'OPERATOR', 
    status: 'ACTIVE',
    companyId: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [usersData, companiesData] = await Promise.all([
        usersApi.getAll(),
        companiesApi.getAll()
      ]);
      setUsers(usersData);
      setCompanies(companiesData);
    } catch (err) {
      console.error('Ma\'lumotlarni yuklashda xato:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (user: any = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        fullName: user.fullName,
        phone: user.phone || '',
        password: '', // Password not shown for security
        role: user.role,
        status: user.status,
        companyId: user.companyId || ''
      });
    } else {
      setEditingUser(null);
      setFormData({ 
        fullName: '', 
        phone: '', 
        password: '', 
        role: 'OPERATOR', 
        status: 'ACTIVE',
        companyId: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCreateOrUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingUser) {
        const updateData: any = { ...formData };
        if (!updateData.password) delete updateData.password;
        await usersApi.update(editingUser.id, updateData);
        toast.success('Foydalanuvchi ma\'lumotlari yangilandi! ✅');
      } else {
        await usersApi.create(formData);
        toast.success('Yangi foydalanuvchi muvaffaqiyatli qo\'shildi! ✅');
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      toast.error('Xatolik: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = (user: any) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await usersApi.remove(userToDelete.id);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      await loadData();
      toast.success('Foydalanuvchi o\'chirildi');
    } catch (err: any) {
      const msg = Array.isArray(err.response?.data?.message) 
        ? err.response.data.message[0] 
        : (err.message || 'O\'chirishda xato');
      toast.error('Xatolik: ' + msg);
    }
  };

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await usersApi.update(user.id, { status: newStatus });
      await loadData();
      toast.success(newStatus === 'ACTIVE' ? 'Xodim faollashtirildi' : 'Xodim to\'xtatildi');
    } catch (err: any) {
      toast.error('Xatolik: ' + err.message);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.fullName || '').toLowerCase().includes(search.toLowerCase()) || 
    (user.phone || '').includes(search)
  );

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    COMPANY_ADMIN: 'Korxona Boshlig\'i',
    OPERATOR: 'Operator',
    DRIVER: 'Haydovchi',
    WASHER: 'Yuvuvchi',
    FINISHER: 'Dazmolchi',
    CUSTOMER: 'Mijoz',
  };

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
          <h1 className="text-2xl font-black border-b-[3px] border-indigo-600 inline-block pb-1 text-slate-800 tracking-tight">
            Foydalanuvchilar Boshqaruvi
          </h1>
          <p className="text-slate-500 mt-2 text-sm">Tizimdagi barcha foydalanuvchilar ro'yxati</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all outline-none"
        >
          <MdAdd className="text-lg" />
          Yangi Foydalanuvchi
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative w-full md:w-96">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input 
            type="text" 
            placeholder="Ism yoki telefon bo'yicha qidirish..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
          <MdFilterList /> Saralash
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                <th className="font-semibold py-4 px-6">Ism-sharif</th>
                <th className="font-semibold py-4 px-6 text-center">Tizim / Korxona</th>
                <th className="font-semibold py-4 px-6">Telefon</th>
                <th className="font-semibold py-4 px-6 text-center">Roli</th>
                <th className="font-semibold py-4 px-6 text-center">Holati</th>
                <th className="font-semibold py-4 px-6 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-6 font-semibold text-slate-800">{user.fullName || 'Noma\'lum'}</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                      {user.company ? user.company.name : 'Tizim / Barcha'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-600 text-sm">{user.phone}</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-600 tracking-tighter border border-slate-200 uppercase">
                      {roleLabels[user.role] || user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button 
                      onClick={() => handleToggleStatus(user)}
                      className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-tighter transition-all hover:scale-110 active:scale-95 ${
                        user.status === 'ACTIVE' 
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}
                      title={user.status === 'ACTIVE' ? "Nofaol qilish" : "Faol qilish"}
                    >
                      {user.status === 'ACTIVE' ? 'Faol' : 'Stop'}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                       <button 
                        onClick={() => handleOpenModal(user)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all group relative"
                      >
                        <MdEdit className="text-xl" />
                        <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-xl pointer-events-none z-10 whitespace-nowrap">Tahrirlash</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:shadow-lg hover:shadow-rose-500/20 hover:-translate-y-0.5 transition-all group relative"
                      >
                        <MdDeleteOutline className="text-xl" />
                        <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-xl pointer-events-none z-10 whitespace-nowrap">O'chirish</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-8 text-center text-slate-500 font-medium">
              Foydalanuvchilar topilmadi
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? "Foydalanuvchini Tahrirlash" : "Yangi Foydalanuvchi"}>
        <form onSubmit={handleCreateOrUpdateUser} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">Tizim Holati</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({...formData, status: 'ACTIVE'})}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  formData.status === 'ACTIVE' 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' 
                    : 'bg-white text-slate-500 border border-slate-200'
                }`}
              >
                {formData.status === 'ACTIVE' && <span>✓</span>}
                Faol
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, status: 'INACTIVE'})}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  formData.status === 'INACTIVE' 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' 
                    : 'bg-white text-slate-500 border border-slate-200'
                }`}
              >
                {formData.status === 'INACTIVE' && <span>✕</span>}
                Stop
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MdPerson className="text-blue-500" /> To'liq ism
            </label>
            <input 
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MdPhone className="text-blue-500" /> Telefon raqami
            </label>
            <input 
              required
              type="tel"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MdBadge className="text-blue-500" /> Tizimdagi rol
              </label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none bg-white font-bold"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="OPERATOR">Operator</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="COMPANY_ADMIN">Korxona Boshlig'i</option>
                <option value="DRIVER">Haydovchi</option>
                <option value="WASHER">Yuvuvchi</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MdBusiness className="text-blue-500" /> Biriktirilgan Korxona
              </label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none bg-white font-bold"
                value={formData.companyId || ''}
                onChange={(e) => setFormData({...formData, companyId: e.target.value})}
              >
                <option value="">Tizim (Super Admin uchun)</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MdLock className="text-blue-500" /> {editingUser ? "Yangi parol (ixtiyoriy)" : "Maxfiy parol"}
            </label>
            <input 
              required={!editingUser}
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button type="submit" disabled={saving} className="w-full py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl mt-4 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all disabled:opacity-50 hover:-translate-y-0.5">
            {saving ? 'Saqlanmoqda...' : editingUser ? "O'zgarishlarni Saqlash" : "Foydalanuvchini qo'shish"}
          </button>
        </form>

      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Foydalanuvchini o'chirish">
        <div className="space-y-6">
          <p className="text-slate-600 font-medium">
            Siz haqiqatan ham jadvaldagi <span className="font-black text-slate-800">{userToDelete?.fullName}</span> foydalanuvchisini tizimdan o'chirmoqchimisiz?
            <br />
            <span className="text-xs text-rose-500 mt-2 block">Ushbu amalni ortga qaytarib bo'lmaydi va xodim barcha ma'lumotlari zaxiradan olib tashlanadi.</span>
          </p>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-all"
            >
              Yo'q, bekor qilish
            </button>
            <button 
              onClick={confirmDeleteUser}
              className="flex-1 py-4 bg-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/20 hover:bg-rose-700 transition-all font-black hover:-translate-y-1"
            >
              Ha, o'chirilsin
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
