'use client';

import React, { useState } from 'react';
import { MdAdd, MdMoreVert, MdPhone, MdLocationOn, MdBusiness, MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdPerson } from 'react-icons/md';
import Modal from '@/components/ui/Modal';

export default function CompaniesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [companies, setCompanies] = useState([
    { id: '1', name: '"Pokiza" MChJ', phone: '+998 90 123 45 67', region: 'Toshkent sh.', status: 'ACTIVE', users: 12, login: 'pokiza_admin', email: 'pokiza@example.uz', password: 'password123' },
    { id: '2', name: '"Toza Makon" LC', phone: '+998 93 987 65 43', region: 'Samarqand sh.', status: 'ACTIVE', users: 5, login: 'toza_makon', email: 'toza@example.uz', password: 'password123' },
    { id: '3', name: 'Yulduz Gilam', phone: '+998 99 111 22 33', region: 'Farg\'ona sh.', status: 'INACTIVE', users: 8, login: 'yulduz_gilam', email: 'yulduz@example.uz', password: 'password123' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    region: '',
    login: '',
    password: '',
    status: 'ACTIVE'
  });

  const handleOpenModal = (company: any = null) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name,
        phone: company.phone,
        region: company.region,
        login: company.login || '',
        password: company.password || '',
        status: company.status
      });
    } else {
      setEditingCompany(null);
      setFormData({ name: '', phone: '', region: '', login: '', password: '', status: 'ACTIVE' });
    }
    setIsModalOpen(true);
  };

  const [showPassword, setShowPassword] = useState(false);

  const handleCreateOrUpdateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCompany) {
      setCompanies(companies.map(c => 
        c.id === editingCompany.id 
          ? { ...c, ...formData } 
          : c
      ));
      alert('Korxona ma\'lumotlari va tizimga kirish huquqi yangilandi! ✅');
    } else {
      const newCompany = {
        id: (new Date().getTime()).toString(),
        name: formData.name,
        phone: formData.phone,
        region: formData.region,
        login: formData.login,
        email: '',
        password: formData.password,
        status: formData.status,
        users: 0
      };
      setCompanies([...companies, newCompany]);
      alert('Yangi korxona muvaffaqiyatli qo\'shildi va tizim holati belgilandi! ✅');
    }
    setIsModalOpen(false);
    setFormData({ name: '', phone: '', region: '', login: '', password: '', status: 'ACTIVE' });
    setEditingCompany(null);
  };

  const handleDeleteCompany = (id: string) => {
    if (confirm('Ushbu korxonani o\'chirishni tasdiqlaysizmi? Barcha ma\'lumotlar o\'chib ketadi!')) {
      setCompanies(companies.filter(c => c.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setCompanies(companies.map(c => 
      c.id === id 
        ? { ...c, status: c.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } 
        : c
    ));
    const company = companies.find(c => c.id === id);
    const newStatus = company?.status === 'ACTIVE' ? 'Tizimga kirish cheklandi 🛑' : 'Tizimga kirishga ruxsat berildi ✅';
    alert(`${company?.name}: ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold border-b-2 border-indigo-500 inline-block pb-1 text-slate-800">
            Korxonalar Ro'yxati
          </h1>
          <p className="text-slate-500 mt-2 text-sm">Tizimga kirish huquqini va to'lov holatini nazorat qilish</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300"
        >
          <MdAdd className="text-xl" />
          Yangi Korxona Qo'shish
        </button>
      </div>

      {/* Modal for adding/editing company */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCompany ? "Korxonani Tahrirlash & To'lov" : "Yangi Korxona Qo'shish"}
      >
        <form onSubmit={handleCreateOrUpdateCompany} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">Tizimga Kirish (To'lov Holati)</label>
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
                Faol (Ruxsat etilgan)
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
                Bloklangan (To'lovsiz)
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MdBusiness className="text-indigo-500" /> Korxona Nomi
            </label>
            <input 
              required
              type="text" 
              placeholder="Masalan: 'Pokiza' MChJ"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MdPhone className="text-indigo-500" /> Telefon raqami
              </label>
              <input 
                required
                type="tel" 
                placeholder="+998 90 000 00 00"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MdLocationOn className="text-indigo-500" /> Hudud
              </label>
              <select 
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all appearance-none bg-white"
                value={formData.region}
                onChange={(e) => setFormData({...formData, region: e.target.value})}
              >
                <option value="">Tanlang...</option>
                <option value="Toshkent sh.">Toshkent sh.</option>
                <option value="Toshkent vil.">Toshkent vil.</option>
                <option value="Samarqand sh.">Samarqand sh.</option>
                <option value="Namangan sh.">Namangan sh.</option>
                <option value="Andijon sh.">Andijon sh.</option>
                <option value="Farg'ona sh.">Farg'ona sh.</option>
                <option value="Buxoro sh.">Buxoro sh.</option>
                <option value="Xorazm (Urganch)">Xorazm (Urganch)</option>
                <option value="Navoiy sh.">Navoiy sh.</option>
                <option value="Qashqadaryo (Qarshi)">Qashqadaryo (Qarshi)</option>
                <option value="Surxondaryo (Termiz)">Surxondaryo (Termiz)</option>
                <option value="Jizzax sh.">Jizzax sh.</option>
                <option value="Sirdaryo (Guliston)">Sirdaryo (Guliston)</option>
                <option value="Qoraqalpog'iston (Nukus)">Qoraqalpog'iston (Nukus)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MdPerson className="text-indigo-500" /> Tizim logini
              </label>
              <input 
                required
                type="text" 
                placeholder="Masalan: pokiza_admin"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-bold text-slate-800"
                value={formData.login}
                onChange={(e) => setFormData({...formData, login: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MdLock className="text-indigo-500" /> Tizimga kirish paroli
              </label>
              <div className="relative group">
                <input 
                  required
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Bekor qilish
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
            >
              {editingCompany ? "Yangilash" : "Saqlash"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                <th className="font-semibold py-4 px-6">Korxona Nomi / Login</th>
                <th className="font-semibold py-4 px-6">Aloqa (IP Telefoniya)</th>
                <th className="font-semibold py-4 px-6">Hudud</th>
                <th className="font-semibold py-4 px-6 text-center">Xodimlar</th>
                <th className="font-semibold py-4 px-6 text-center">Holati</th>
                <th className="font-semibold py-4 px-6 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                        {company.name.charAt(1)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{company.name}</span>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-0.5">Login: {company.login || company.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <MdPhone className="text-slate-400" />
                      {company.phone}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <MdLocationOn className="text-slate-400" />
                      {company.region}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center text-slate-700 font-medium">
                    {company.users}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button 
                      onClick={() => handleToggleStatus(company.id)}
                      className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-tighter transition-all hover:scale-110 active:scale-95 ${
                        company.status === 'ACTIVE' 
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}
                      title={company.status === 'ACTIVE' ? "To'xtatish" : "Yoqish"}
                    >
                      {company.status === 'ACTIVE' ? 'Faol' : 'Stop'}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                       <button 
                        onClick={() => handleOpenModal(company)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-xs font-bold"
                      >
                        Tahrirlash
                      </button>
                      <button 
                        onClick={() => handleDeleteCompany(company.id)}
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
        
        {/* Pagination mock */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <p>Jami: {companies.length} ta korxona ko'rsatilmoqda</p>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50">Oldingi</button>
            <button className="px-3 py-1 bg-indigo-50 text-indigo-600 font-medium rounded border border-indigo-100">1</button>
            <button className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50">Keyingi</button>
          </div>
        </div>
      </div>
    </div>
  );
}
