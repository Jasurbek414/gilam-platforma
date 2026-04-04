'use client';

import React, { useState, useEffect } from 'react';
import { 
  MdPhone, MdSettings, MdCloudQueue, MdSecurity, MdHistory, 
  MdCheckCircle, MdError, MdRefresh, MdAdd, MdMoreVert, MdClose, MdSave
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { telephonyApi, getUser } from '@/lib/api';
import Modal from '@/components/ui/Modal';

// --- TYPES ---
interface SIPConfig {
  provider: string;
  login: string;
  server: string;
  status: 'ONLINE' | 'OFFLINE' | 'CONNECTING';
  assignedTo: string;
  password?: string;
}

interface ProviderDef {
  id: string;
  name: string;
  logo: string;
  color: string;
}

// --- CONSTANTS ---
const PROVIDERS: ProviderDef[] = [
  { id: 'zadarma', name: 'Zadarma', logo: 'Z', color: 'bg-orange-500' },
  { id: 'binotel', name: 'Binotel', logo: 'B', color: 'bg-blue-600' },
  { id: 'asterisk', name: 'Asterisk', logo: 'A', color: 'bg-red-500' },
  { id: 'custom', name: 'Boshqa', logo: 'S', color: 'bg-slate-800' },
];

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
  <div className="flex items-center gap-4 mb-4">
    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
      <Icon className="text-xl" />
    </div>
    <div>
      <h2 className="text-sm font-black text-slate-800 tracking-tight leading-none uppercase">{title}</h2>
      {subtitle && <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-1.5">{subtitle}</p>}
    </div>
  </div>
);

export default function CompanySIPIntegration() {
  const [configs, setConfigs] = useState<SIPConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Partial<SIPConfig>>({});
  const user = getUser();

  const fetchConfig = async () => {
    if (!user?.companyId) return;
    try {
      setLoading(true);
      const data = await telephonyApi.getConfig(user.companyId);
      // Transform backend jsonb or list into our UI state
      if (data && data.login) {
        setConfigs([{ ...data, status: data.status || 'ONLINE', assignedTo: 'Asosiy Liniya' }]);
      } else {
        setConfigs([]);
      }
    } catch (error) {
      console.error('Fetch SIP error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    if (!user?.companyId) return;
    try {
      await telephonyApi.updateConfig({
        companyId: user.companyId,
        credentials: editingConfig
      });
      setIsEditModalOpen(false);
      fetchConfig();
    } catch (error) {
      alert('Xatolik yuz berdi saqlashda');
    }
  };

  return (
    <div className="min-h-full w-full flex flex-col gap-10 font-sans p-2">
      
      {/* 1. HEADER */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
        <div>
           <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">IP-Telefoniya Markazi</p>
           </div>
           <h1 className="text-3xl font-black text-slate-800 tracking-tight">SIP Integratsiya</h1>
        </div>

        <div className="flex gap-4">
           <button onClick={() => { setEditingConfig({}); setIsEditModalOpen(true); }} className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all">
              <MdAdd size={20} /> Yangi Integratsiya
           </button>
        </div>
      </header>

      {/* 2. MAIN GRID */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* LEFT: ACTIVE NUMBERS */}
        <section className="col-span-12 lg:col-span-8 flex flex-col gap-8">
           <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm flex flex-col min-h-[500px]">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                 <SectionHeader icon={MdCloudQueue} title="Integratsiyalar" subtitle="Barcha ulangan SIP liniyalar" />
                 <button onClick={fetchConfig} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                    <MdRefresh size={20} className={loading ? 'animate-spin' : ''} />
                 </button>
              </div>

              <div className="p-6">
                 {loading ? (
                   <div className="flex items-center justify-center h-64 text-slate-300 font-black uppercase text-[10px] tracking-widest italic">Ma'lumotlar yuklanmoqda...</div>
                 ) : configs.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-64 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4"><MdPhone size={32}/></div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hozircha integratsiyalar yo'q</p>
                   </div>
                 ) : (
                   <table className="w-full text-left">
                      <thead>
                         <tr className="text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50">
                            <th className="px-6 py-6 w-1/3">Provider</th>
                            <th className="px-6 py-6 text-center">Status</th>
                            <th className="px-6 py-6">Assigned To</th>
                            <th className="px-6 py-6 text-right">Amallar</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {configs.map((sip, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-all group">
                               <td className="px-6 py-6">
                                  <div className="flex items-center gap-4">
                                     <div className={`w-12 h-12 ${PROVIDERS.find(p => p.name === sip.provider)?.color || 'bg-slate-800'} rounded-2xl flex items-center justify-center text-white font-black text-xl`}>{sip.provider[0]}</div>
                                     <div>
                                        <p className="text-md font-black text-slate-800 leading-none mb-2">{sip.provider}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sip.login} &bull; {sip.server}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-6 py-6 text-center">
                                  <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${sip.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>{sip.status}</span>
                               </td>
                               <td className="px-6 py-6">
                                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{sip.assignedTo}</p>
                               </td>
                               <td className="px-6 py-6 text-right">
                                  <button onClick={() => { setEditingConfig(sip); setIsEditModalOpen(true); }} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100"><MdSettings size={18} /></button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                 )}
              </div>
           </div>
        </section>

        {/* RIGHT: PROVIDERS */}
        <section className="col-span-12 lg:col-span-4 flex flex-col gap-8">
           <div className="bg-indigo-600 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden group">
              <MdSecurity size={40} className="mb-8 text-indigo-200" />
              <h3 className="text-2xl font-black mb-4">SIP Xavfsizligi</h3>
              <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest opacity-80 mb-10 leading-relaxed">Barcha parollar AES-256 algoritmi orqali serverda shifrlangan holatda saqlanadi.</p>
           </div>
           <div className="bg-white rounded-[44px] border border-slate-100 shadow-sm p-8">
              <SectionHeader icon={MdCloudQueue} title="Provayderlar" subtitle="Integratsiya uchun tayyor" />
              <div className="grid grid-cols-2 gap-4 mt-6">
                 {PROVIDERS.map((p, idx) => (
                    <div key={idx} onClick={() => { setEditingConfig({ provider: p.name }); setIsEditModalOpen(true); }} className="p-6 bg-slate-50/50 border border-slate-50 rounded-3xl flex flex-col items-center justify-center text-center hover:bg-white hover:shadow-xl transition-all cursor-pointer group">
                       <div className={`w-10 h-10 ${p.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}><span className="font-black text-xs">{p.logo}</span></div>
                       <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest">{p.name}</p>
                    </div>
                 ))}
              </div>
           </div>
        </section>
      </div>

      {/* EDIT MODAL */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="SIP Sozlamalari">
         <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Provayder</label>
                  <select value={editingConfig.provider || ''} onChange={e => setEditingConfig({...editingConfig, provider: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                     <option value="">Tanlang...</option>
                     {PROVIDERS.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SIP Server</label>
                  <input type="text" value={editingConfig.server || ''} onChange={e => setEditingConfig({...editingConfig, server: e.target.value})} placeholder="sip.zadarma.com" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Login / Username</label>
                  <input type="text" value={editingConfig.login || ''} onChange={e => setEditingConfig({...editingConfig, login: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parol</label>
                  <input type="password" value={editingConfig.password || ''} onChange={e => setEditingConfig({...editingConfig, password: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
               </div>
            </div>
            <button onClick={handleSave} className="w-full py-5 bg-indigo-600 text-white rounded-[28px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 mt-4">
               <MdSave size={18}/> Sozlamalarni Saqlash
            </button>
         </div>
      </Modal>

    </div>
  );
}
