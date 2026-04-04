'use client';

import React, { useState } from 'react';
import { 
  MdPhone, MdSettings, MdCloudQueue, MdSecurity, MdHistory, 
  MdCheckCircle, MdError, MdRefresh, MdAdd, MdMoreVert 
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPES ---
interface SIPConfig {
  provider: string;
  login: string;
  server: string;
  status: 'ONLINE' | 'OFFLINE' | 'CONNECTING';
  assignedTo: string;
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
  const [configs, setConfigs] = useState<SIPConfig[]>([
    { provider: 'Zadarma', login: '123456', server: 'sip.zadarma.com', status: 'ONLINE', assignedTo: 'Operator #01' },
    { provider: 'Binotel', login: 'sip_user_77', server: 'binotel.com', status: 'OFFLINE', assignedTo: 'Asosiy liniya' },
  ]);

  return (
    <div className="min-h-full w-full flex flex-col gap-10 font-sans p-2">
      
      {/* 1. HEADER & SUMMARY */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
        <div>
           <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">IP-Telefoniya Markazi</p>
           </div>
           <h1 className="text-3xl font-black text-slate-800 tracking-tight">SIP Integratsiya</h1>
           <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest max-w-md leading-relaxed">
             Kompaniya raqamlarini boshqarish va SIP provayderlarni ulash markazi
           </p>
        </div>

        <div className="flex gap-4">
           <button className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-100 rounded-3xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
              <MdHistory size={18} /> Logs
           </button>
           <button className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all">
              <MdAdd size={20} /> Yangi Raqam
           </button>
        </div>
      </header>

      {/* 2. MAIN GRID */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* LEFT: ACTIVE NUMBERS & STATUS */}
        <section className="col-span-12 lg:col-span-12 xl:col-span-8 flex flex-col gap-8">
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Online Raqamlar', value: '04', icon: MdCheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { title: 'Faol Qo\'ng\'iroqlar', value: '12', icon: MdPhone, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                { title: 'Xatolar (Bugun)', value: '01', icon: MdError, color: 'text-rose-500', bg: 'bg-rose-50' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-white p-8 rounded-[44px] border border-slate-100 shadow-sm transition-all hover:shadow-xl group">
                   <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center ${stat.color} mb-6 transition-transform group-hover:rotate-12`}>
                      <stat.icon size={28} />
                   </div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.title}</p>
                   <p className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                </div>
              ))}
           </div>

           <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm flex flex-col min-h-[400px]">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
                       <MdCloudQueue size={22} />
                    </div>
                    <h2 className="text-lg font-black text-slate-800 tracking-tight">Faol Integratsiyalar</h2>
                 </div>
                 <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                    <MdRefresh size={20} />
                 </button>
              </div>

              <div className="p-6 overflow-y-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="text-[10px] font-black text-slate-300 uppercase tracking-widest border-b border-slate-50">
                          <th className="px-6 py-6 w-1/3">Provider & Login</th>
                          <th className="px-6 py-6 text-center">Status</th>
                          <th className="px-6 py-6">Assigned To</th>
                          <th className="px-6 py-6 text-right">Amallar</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {configs.map((sip: SIPConfig, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-all group">
                             <td className="px-6 py-6">
                                <div className="flex items-center gap-4">
                                   <div className={`w-12 h-12 ${PROVIDERS.find((p: ProviderDef) => p.name === sip.provider)?.color || 'bg-slate-800'} rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg`}>
                                      {sip.provider[0]}
                                   </div>
                                   <div>
                                      <p className="text-md font-black text-slate-800 leading-none mb-2">{sip.provider}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{sip.server}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-6 text-center">
                                <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${sip.status === 'ONLINE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                   {sip.status}
                                </span>
                             </td>
                             <td className="px-6 py-6">
                                <div className="flex items-center gap-2">
                                   <div className="w-2 h-2 rounded-full bg-slate-200" />
                                   <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{sip.assignedTo}</p>
                                </div>
                             </td>
                             <td className="px-6 py-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                   <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100">
                                      <MdSettings size={18} />
                                   </button>
                                   <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100">
                                      <MdMoreVert size={18} />
                                   </button>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

        </section>

        {/* RIGHT: INTEGRATION WIZARD */}
        <section className="col-span-12 lg:col-span-12 xl:col-span-4 flex flex-col gap-8">
           
           <div className="bg-indigo-600 rounded-[48px] p-10 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
              <div className="relative z-10">
                 <MdSecurity size={40} className="mb-8 text-indigo-200" />
                 <h3 className="text-2xl font-black tracking-tight mb-4">Xavfsiz SIP Ulanish</h3>
                 <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest leading-relaxed opacity-80 mb-10">
                   Barcha ulanishlar SSL protokol bilan shifrlangan va xavfsiz kanallar orqali o'rnatiladi.
                 </p>
                 <button className="w-full py-5 bg-white text-indigo-600 rounded-[28px] font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">Integratsiyani Boshlash</button>
              </div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all" />
           </div>

           <div className="bg-white rounded-[44px] border border-slate-100 shadow-sm p-8">
              <SectionHeader icon={MdCloudQueue} title="Ommabop Provayderlar" subtitle="Tayyor Integratsiya" />
              <div className="grid grid-cols-2 gap-4 mt-6">
                 {PROVIDERS.map((p: ProviderDef, idx: number) => (
                    <div key={idx} className="p-6 bg-slate-50/50 border border-slate-50 rounded-3xl flex flex-col items-center justify-center text-center hover:bg-white hover:shadow-xl hover:border-slate-100 transition-all cursor-pointer group">
                       <div className={`w-12 h-12 ${p.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                          <span className="font-black text-md uppercase">{p.logo}</span>
                       </div>
                       <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest leading-none">{p.name}</p>
                    </div>
                 ))}
              </div>
              <div className="mt-8 pt-8 border-t border-slate-50">
                 <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center">Barcha ulanishlar Zadarma API orqali amalga oshiriladi</p>
              </div>
           </div>

        </section>

      </div>
    </div>
  );
}
