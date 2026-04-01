'use client';

import React, { useState } from 'react';
import { MdAdd, MdSearch, MdFilterList, MdMoreVert, MdPerson, MdEmail, MdBadge, MdBusiness, MdLock } from 'react-icons/md';
import Modal from '@/components/ui/Modal';

const initialUsers = [
  { id: '1', name: 'Alisher Otabekov', email: 'alisher@example.uz', role: 'SUPER_ADMIN', status: 'ACTIVE', company: 'Tizim' },
  { id: '2', name: 'Sardorbek Rahimov', email: 'sardor@example.uz', role: 'OPERATOR', status: 'ACTIVE', company: '"Pokiza" MChJ' },
  { id: '3', name: 'Zilola Ganiyeva', email: 'zilola@example.uz', role: 'OPERATOR', status: 'INACTIVE', company: '"Toza Makon" LC' },
];

const companies = [
  { id: '0', name: 'Tizim (Super Admin)' },
  { id: '1', name: '"Pokiza" MChJ' },
  { id: '2', name: '"Toza Makon" LC' },
  { id: '3', name: 'Yulduz Gilam' },
];

export default function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    role: 'OPERATOR', 
    status: 'ACTIVE',
    companyId: ''
  });

  const handleOpenModal = (user: any = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // Password not shown for security
        role: user.role,
        status: user.status,
        companyId: companies.find(c => c.name === user.company)?.id || ''
      });
    } else {
      setEditingUser(null);
      setFormData({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'OPERATOR', 
        status: 'ACTIVE',
        companyId: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCreateOrUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData } 
          : u
      ));
      alert('Foydalanuvchi ma\'lumotlari va holati yangilandi! ✅');
    } else {
      const newUser = {
        id: (new Date().getTime()).toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        company: companies.find(c => c.id === formData.companyId)?.name || 'Noma\'lum'
      };
      setUsers([...users, newUser]);
      alert('Yangi foydalanuvchi muvaffaqiyatli qo\'shildi va login-parol biriktirildi! ✅');
    }
    setIsModalOpen(false);
    setFormData({ name: '', email: '', password: '', role: 'OPERATOR', status: 'ACTIVE', companyId: '' });
    setEditingUser(null);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Ushbu foydalanuvchini tizimdan o\'chirishni tasdiqlaysizmi?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setUsers(users.map(u => 
      u.id === id 
        ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } 
        : u
    ));
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) || 
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold border-b-2 border-blue-500 inline-block pb-1 text-slate-800">
            Foydalanuvchilar Boshqaruvi
          </h1>
          <p className="text-slate-500 mt-2 text-sm">Tizimdagi barcha adminlar va operatorlar ro'yxati</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all outline-none"
        >
          <MdAdd className="text-xl" />
          Yangi Foydalanuvchi
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative w-full md:w-96">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input 
            type="text" 
            placeholder="Ism yoki email bo'yicha qidirish..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
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
                <th className="font-semibold py-4 px-6">Email</th>
                <th className="font-semibold py-4 px-6 text-center">Roli</th>
                <th className="font-semibold py-4 px-6 text-center">Holati</th>
                <th className="font-semibold py-4 px-6 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-6 font-semibold text-slate-800">{user.name}</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                      {user.company}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-600 text-sm">{user.email}</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 text-slate-600 tracking-tighter border border-slate-200 uppercase">
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button 
                      onClick={() => handleToggleStatus(user.id)}
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
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-bold"
                      >
                        Tahrirlash
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs font-bold"
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
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MdEmail className="text-blue-500" /> Email manzili
            </label>
            <input 
              required
              type="email"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
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
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MdBusiness className="text-blue-500" /> Biriktirilgan Korxona
              </label>
              <select 
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none bg-white font-bold"
                value={formData.companyId}
                onChange={(e) => setFormData({...formData, companyId: e.target.value})}
              >
                <option value="">Tanlang...</option>
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
          <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl mt-4 hover:shadow-lg transition-all">
            {editingUser ? "Saqlash" : "Foydalanuvchini qo'shish"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
