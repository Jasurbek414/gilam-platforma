'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  MdLocalShipping, MdChat, MdNotificationsActive, MdLocationOn,
  MdSend, MdPhone, MdTrendingUp, MdDirectionsCar, MdInfo,
  MdSpeed, MdQueryBuilder, MdTimeline, MdMap, MdKeyboardArrowRight,
  MdFilterList, MdSearch, MdMoreVert, MdAnalytics, MdGroup, MdFingerprint
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Modal from '@/components/ui/Modal';

// Barqaror Immersive Map qatlami
const DriverMap = dynamic(() => import('./DriverMap'), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-slate-50 flex items-center justify-center z-0">
    <div className="flex flex-col items-center gap-4">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="w-10 h-10 border-[3px] border-indigo-600 border-t-transparent rounded-full" />
      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center">Loading...</span>
    </div>
  </div>
});

const DRIVERS = [
  { id: 1, name: 'Sardor Rahimov',  status: 'BUYURTMA OLMOQDA', phone: '+998 90 111 22 33', car: 'Damas 01A123BA',  location: 'Chilonzor 9-kv',  lat: 41.2995, lng: 69.2401, profileImg: '👤' },
  { id: 2, name: 'Jamshid Karimov', status: 'YETKAZIB BERMOQDA', phone: '+998 90 444 55 66', car: 'Labo 01B456CA',   location: 'Yunusobod 4-mv',  lat: 41.3411, lng: 69.3128, profileImg: '👤' },
  { id: 3, name: 'Bekzod Aliyev',   status: "BO'SH",             phone: '+998 93 777 88 99', car: 'Damas 01C789DA',  location: "Qo'yliq bozori",  lat: 41.2783, lng: 69.3591, profileImg: '👤' },
  { id: 4, name: "Otabek G'ulomov", status: 'OVQATLANISHDA',     phone: '+998 94 000 11 22', car: 'Damas 01D000EA',  location: 'Markaziy ofis',   lat: 41.3119, lng: 69.2796, profileImg: '👤' },
];

const STATUS_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  "BO'SH": { bg: 'bg-emerald-500', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'BUYURTMA OLMOQDA': { bg: 'bg-amber-500', text: 'text-amber-700', dot: 'bg-amber-500' },
  'YETKAZIB BERMOQDA': { bg: 'bg-indigo-500', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  'OVQATLANISHDA': { bg: 'bg-slate-500', text: 'text-slate-500', dot: 'bg-slate-400' },
};

const STAT_PRESETS: Record<string, any> = {
  daily:   [
    { label: 'Orders', val: '15', icon: MdTrendingUp },
    { label: 'Efficiency', val: '94%', icon: MdSpeed },
    { label: 'Time', val: '6.2h', icon: MdQueryBuilder },
  ],
  weekly:  [
    { label: 'Orders', val: '84', icon: MdTimeline },
    { label: 'Efficiency', val: '88%', icon: MdSpeed },
    { label: 'Time', val: '42h', icon: MdQueryBuilder },
  ],
};

function LogisticsContent() {
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<any>(null);
  const [messages, setMessages] = useState<Record<number, any[]>>({
    1: [{ id: 1, text: "Mijoz telefoniga javob bermayapti.", sender: 'driver', time: '12:30' }],
    2: [{ id: 1, text: "Yunusobodda tirbandlik, 14 daqiqa kechikaman.", sender: 'driver', time: '13:05' }],
  });
  const [msg, setMsg] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [statPeriod, setStatPeriod] = useState('daily');
  const [listFilter, setListFilter] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const id = searchParams.get('driverId');
    if (id) {
      const d = DRIVERS.find(d => d.id === parseInt(id));
      if (d) { setSelected(d); }
    }
  }, [searchParams]);

  const filteredDrivers = useMemo(() => 
    DRIVERS.filter(d => d.name.toLowerCase().includes(listFilter.toLowerCase()) || d.car.toLowerCase().includes(listFilter.toLowerCase())), 
  [listFilter]);

  const handleSelectDriver = (d: any) => {
    setSelected(d);
    setIsChatOpen(false); 
  };

  const sendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const m = { id: Date.now(), text: `📢 ${broadcastMsg}`, sender: 'operator', time: t };
    setMessages(p => {
      const nh = { ...p };
      DRIVERS.forEach(dr => { nh[dr.id] = [...(nh[dr.id] || []), m]; });
      return nh;
    });
    setBroadcastMsg('');
    setShowBroadcast(false);
  };

  const sendMsg = () => {
    if (!msg.trim() || !selected) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(p => ({ ...p, [selected.id]: [...(p[selected.id] || []), { id: Date.now(), text: msg, sender: 'operator', time: now }] }));
    setMsg('');
    setTimeout(() => {
      const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(p => ({ ...p, [selected.id]: [...(p[selected.id] || []), { id: Date.now(), text: "Tushunarli ✅ Ishlayapmiz.", sender: 'driver', time: t }] }));
    }, 1500);
  };

  const stats = STAT_PRESETS[statPeriod] || STAT_PRESETS.daily;
  const unreadCount = (id: number) => (messages[id] || []).filter(m => m.sender === 'driver').length;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] w-full gap-3">
      
      {/* 1. COMPACT EXTERNAL HEADER */}
      <div className="bg-white/90 backdrop-blur-3xl px-8 py-3 border border-slate-100 rounded-[32px] shadow-sm flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-lg shadow-xl shadow-indigo-100">
                  <MdLocalShipping />
               </div>
               <div>
                  <h2 className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1">Markazi Monitoring</h2>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 opacity-60">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Feed
                  </p>
               </div>
            </div>
            
            <div className="h-8 w-[1px] bg-slate-100" />
            
            <button 
               onClick={() => setShowBroadcast(true)}
               className="flex items-center gap-3 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all active:scale-95"
            >
               <MdNotificationsActive className="text-amber-400 text-lg" /> Broadcast Alert
            </button>
         </div>

         <div className="flex items-center gap-4">
            <div className="flex p-0.5 bg-slate-50 border border-slate-100 rounded-full">
               <div className="px-6 py-2 bg-white border border-slate-50 rounded-full shadow-sm text-[9px] font-black text-indigo-600 uppercase tracking-widest opacity-80">
                  Logistic Hub V3
               </div>
            </div>
            <button className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm"><MdMoreVert size={20}/></button>
         </div>
      </div>

      {/* 2. MAIN IMMERSIVE CONTENT (Expanded Map Visibility) */}
      <div className="relative flex-1 w-full overflow-hidden rounded-[32px] bg-slate-50 border border-slate-100 shadow-2xl">
        
         {/* MAP BASE LAYER */}
         <div className="absolute inset-0 z-0">
            <DriverMap selected={selected} drivers={DRIVERS} onSelect={handleSelectDriver} />
         </div>

         {/* ULTRA-COMPACT DRIVER LIST (Left Overlay) */}
         <div className="absolute top-4 left-4 bottom-4 w-[220px] z-20 pointer-events-none">
            <div className="h-full bg-white/20 backdrop-blur-3xl border border-white/40 rounded-[32px] shadow-2xl p-4 flex flex-col pointer-events-auto overflow-hidden">
               <div className="mb-4">
                  <div className="relative">
                     <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                     <input 
                       value={listFilter} onChange={e => setListFilter(e.target.value)}
                       placeholder="Quick search..." 
                       className="w-full pl-9 pr-3 py-2.5 bg-white/40 border border-white/20 rounded-xl text-[9px] font-black text-slate-800 outline-none focus:bg-white transition-all shadow-inner placeholder:text-slate-400"
                     />
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                  {filteredDrivers.map(d => {
                     const uc = unreadCount(d.id);
                     const isActive = selected?.id === d.id;
                     const sc = STATUS_COLOR[d.status];

                     return (
                        <motion.div 
                           layout key={d.id} onClick={() => handleSelectDriver(d)}
                           className={`group p-2 rounded-2xl border cursor-pointer transition-all ${
                              isActive ? 'bg-white shadow-xl border-white translate-x-1' : 'bg-transparent border-transparent hover:bg-white/10'
                           }`}
                        >
                           <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black relative shrink-0 ${sc.bg} opacity-90 shadow-sm text-[10px]`}>
                                 {d.name[0]}
                                 {uc > 0 && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white text-[6px] flex items-center justify-center font-black shadow-lg">{uc}</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <h4 className="text-[10px] font-black text-slate-800 truncate leading-none mb-1">{d.name}</h4>
                                 <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <div className={`w-1 h-1 rounded-full ${sc.dot}`} /> {d.status}
                                 </p>
                              </div>
                           </div>
                        </motion.div>
                     );
                  })}
               </div>
            </div>
         </div>

         {/* ULTRA-COMPACT SIDEBAR (Right Overlay) */}
         <AnimatePresence>
            {selected && (
               <motion.div 
                  initial={{ x: 200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 200, opacity: 0 }}
                  className="absolute top-4 right-4 bottom-4 w-[280px] z-30 pointer-events-none"
               >
                  <div className="h-full flex flex-col gap-3 pointer-events-auto">
                     
                     {/* DRIVER QUICK VIEW */}
                     <div className="bg-slate-950/80 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-2xl p-5 text-white relative overflow-hidden">
                        <div className="relative z-10 flex flex-col gap-4">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl border border-white/5 backdrop-blur-md">{selected.profileImg}</div>
                                 <div className="min-w-0">
                                    <h3 className="text-md font-black tracking-tight truncate leading-none mb-1">{selected.name}</h3>
                                    <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">{selected.car}</p>
                                 </div>
                              </div>
                              <a href={`tel:${selected.phone}`} className="w-10 h-10 bg-white text-slate-950 rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl"><MdPhone size={20}/></a>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-2">
                              <button 
                                 onClick={() => setIsChatOpen(!isChatOpen)} 
                                 className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-indigo-500 transition-all"
                              >
                                 {isChatOpen ? <><MdKeyboardArrowRight size={16}/> Stats</> : <><MdChat size={16}/> Chat</>}
                              </button>
                              <div className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center justify-center gap-1.5 opacity-60">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* DYNAMIC CONTENT CONTEXT */}
                     <div className="flex-1 bg-white/20 backdrop-blur-3xl border border-white/40 rounded-[32px] shadow-2xl flex flex-col min-h-0 overflow-hidden">
                        {isChatOpen ? (
                           <div className="flex flex-col h-full">
                              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/10 backdrop-blur-xl">
                                 <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest">Operator Chat</p>
                                 <button onClick={() => setIsChatOpen(false)} className="text-indigo-600 hover:text-slate-950 transition-all font-black text-[8px] uppercase">Close</button>
                              </div>
                              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                                 {(messages[selected.id] || []).map((m: any) => (
                                    <div key={m.id} className={`flex ${m.sender === 'operator' ? 'justify-end' : 'justify-start'}`}>
                                       <div className={`max-w-[85%] p-3.5 rounded-2xl ${m.sender === 'operator' ? 'bg-indigo-600 text-white shadow-lg rounded-br-md' : 'bg-white/60 text-slate-800 border border-white/60 backdrop-blur-md rounded-bl-md shadow-sm'}`}>
                                          <p className="text-[11px] font-medium leading-relaxed">{m.text}</p>
                                          <p className={`text-[6px] font-black mt-1.5 uppercase tracking-widest ${m.sender === 'operator' ? 'text-white/40' : 'text-slate-400'}`}>{m.time}</p>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                              <div className="p-3 bg-white/10 border-t border-white/10">
                                 <div className="relative">
                                    <input 
                                       value={msg} onChange={e => setMsg(e.target.value)}
                                       onKeyDown={e => e.key === 'Enter' && sendMsg()}
                                       placeholder="Message..." 
                                       className="w-full pl-5 pr-12 py-3.5 bg-white/60 border border-white/40 rounded-2xl outline-none focus:bg-white text-[11px] font-bold text-slate-800 transition-all shadow-inner"
                                    />
                                    <button onClick={sendMsg} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-xl hover:bg-slate-950 transition-all"><MdSend size={18}/></button>
                                 </div>
                              </div>
                           </div>
                        ) : (
                           <div className="p-6 h-full flex flex-col gap-4">
                              <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-indigo-50 pb-3 flex items-center justify-between">
                                 Efficiency <span className="text-[8px] text-slate-400">Monitoring Active</span>
                              </h3>
                              <div className="grid grid-cols-1 gap-3">
                                 {stats.map((s: any, i: number) => (
                                    <div key={i} className="p-4 bg-white/40 border border-white/60 rounded-[28px] flex items-center gap-4 group hover:bg-white transition-all shadow-sm">
                                       <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm"><s.icon size={18}/></div>
                                       <div>
                                          <p className="text-md font-black text-slate-800 leading-none mb-1">{s.val}</p>
                                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">{s.label}</p>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                              <div className="mt-auto p-5 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[32px] text-white overflow-hidden relative shadow-xl">
                                 <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">Status Feed</p>
                                 <p className="text-sm font-black leading-tight">Driver is performing above average.</p>
                                 <MdTrendingUp className="absolute -bottom-4 -right-4 text-7xl text-white/5 rotate-12" />
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

      </div>

      {/* COMPACT BROADCAST MODAL */}
      <Modal isOpen={showBroadcast} onClose={() => setShowBroadcast(false)} title="Broadcast Alert">
        <div className="p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-16 h-16 bg-slate-950 rounded-[24px] flex items-center justify-center shadow-2xl">
              <MdNotificationsActive className="text-amber-400 text-3xl animate-pulse" />
            </div>
            <div>
               <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">Global Alert</h2>
               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Oltin xabar tizimi</p>
            </div>
          </div>

          <form onSubmit={sendBroadcast} className="space-y-6">
            <textarea 
               required value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)}
               placeholder="Haydovchilar uchun muhim xabar..." rows={4}
               className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[32px] outline-none focus:bg-white focus:border-indigo-400 font-bold text-md text-slate-800 transition-all resize-none shadow-inner"
            />
            <div className="flex gap-4">
              <button type="button" onClick={() => setShowBroadcast(false)} className="flex-1 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">Cancel</button>
              <button type="submit" className="flex-2 w-[220px] py-4 bg-slate-950 text-white font-black rounded-[24px] text-[10px] uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3">
                 <MdSend className="text-xl" /> Send Alert
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}

export default function OperatorLogisticsPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <LogisticsContent />
    </Suspense>
  );
}
