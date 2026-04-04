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

// Immersive Map - Base Layer
const DriverMap = dynamic(() => import('./DriverMap'), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-6">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-16 h-16 border-[6px] border-indigo-600 border-t-transparent rounded-full" />
      <span className="text-[12px] font-black text-slate-300 uppercase tracking-widest">Xarita yuklanmoqda...</span>
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
  const [centerTab, setCenterTab] = useState<'map' | 'chat'>('map');
  const [messages, setMessages] = useState<Record<number, any[]>>({
    1: [{ id: 1, text: "Mijoz telefoniga javob bermayapti.", sender: 'driver', time: '12:30' }],
    2: [{ id: 1, text: "Yunusobodda tirbandlik, 14 daqiqa kechikaman.", sender: 'driver', time: '13:05' }],
  });
  const [msg, setMsg] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [statPeriod, setStatPeriod] = useState('daily');
  const [listFilter, setListFilter] = useState('');

  useEffect(() => {
    const id = searchParams.get('driverId');
    if (id) {
      const d = DRIVERS.find(d => d.id === parseInt(id));
      if (d) { setSelected(d); setCenterTab('map'); }
    }
  }, [searchParams]);

  const filteredDrivers = useMemo(() => 
    DRIVERS.filter(d => d.name.toLowerCase().includes(listFilter.toLowerCase()) || d.car.toLowerCase().includes(listFilter.toLowerCase())), 
  [listFilter]);

  const handleSelectDriver = (d: any) => {
    setSelected(d);
    setCenterTab('map');
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
    <div className="relative h-[calc(100vh-140px)] w-full overflow-hidden rounded-[48px] bg-white border border-slate-100 shadow-2xl">
      
      {/* BASE LAYER: Full Screen Map */}
      <div className="absolute inset-0 z-0">
         <DriverMap selected={selected} drivers={DRIVERS} onSelect={handleSelectDriver} />
      </div>

      {/* OVERLAY: Top Navigation Header */}
      <div className="absolute top-8 left-8 right-8 z-20 flex items-center justify-between pointer-events-none">
         <div className="flex items-center gap-6 pointer-events-auto">
            <div className="bg-white/80 backdrop-blur-3xl p-4 rounded-[28px] border border-white/50 shadow-[0_12px_48px_rgba(0,0,0,0.12)] flex items-center gap-5">
               <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-600/30">
                  <MdLocalShipping />
               </div>
               <div>
                  <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1">Logistika Markazi</h2>
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tizim on-line</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-4 pointer-events-auto">
            <button 
              onClick={() => setShowBroadcast(true)}
              className="bg-slate-950 text-white px-8 py-4 rounded-[28px] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-slate-900/40 hover:bg-indigo-600 transition-all active:scale-95"
            >
              <MdNotificationsActive className="text-indigo-400 text-lg" /> Broadcast
            </button>
            <div className="bg-white/80 backdrop-blur-3xl p-1.5 rounded-[24px] border border-white/50 shadow-xl flex items-center">
               <button onClick={() => setCenterTab('map')} className={`px-6 py-2.5 rounded-2xl text-[10px] font-extrabold uppercase tracking-[0.2em] transition-all ${centerTab === 'map' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-700'}`}>Map</button>
               <button onClick={() => setCenterTab('chat')} className={`px-6 py-2.5 rounded-2xl text-[10px] font-extrabold uppercase tracking-[0.2em] transition-all relative ${centerTab === 'chat' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-700'}`}>
                  Chat {selected && unreadCount(selected.id) > 0 && <span className="absolute top-1 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />}
               </button>
            </div>
         </div>
      </div>

      {/* FLOATING LEFT: Driver Selection List */}
      <div className="absolute top-32 left-8 bottom-32 w-80 z-20 pointer-events-none">
         <div className="h-full bg-white/70 backdrop-blur-3xl border border-white/50 rounded-[40px] shadow-2xl p-6 flex flex-col pointer-events-auto overflow-hidden group">
            <div className="mb-6 px-2">
               <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-5">Haydovchilar</h3>
               <div className="relative">
                  <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                  <input 
                    value={listFilter} onChange={e => setListFilter(e.target.value)}
                    placeholder="Qidiruv..." 
                    className="w-full pl-12 pr-4 py-4 bg-white/50 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:bg-white transition-all border border-transparent focus:border-indigo-100"
                  />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
               {filteredDrivers.map(d => {
                  const uc = unreadCount(d.id);
                  const isActive = selected?.id === d.id;
                  const sc = STATUS_COLOR[d.status];

                  return (
                     <motion.div 
                        layout key={d.id} onClick={() => handleSelectDriver(d)}
                        className={`p-4 rounded-[28px] border cursor-pointer transition-all ${
                           isActive ? 'bg-white shadow-xl border-indigo-100' : 'bg-transparent border-transparent hover:bg-white/40'
                        }`}
                     >
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black relative shrink-0 ${sc.bg}`}>
                              {d.name[0]}
                              {uc > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-4 border-white text-[8px] flex items-center justify-center">{uc}</span>}
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="text-[13px] font-black text-slate-800 truncate mb-1">{d.name}</h4>
                              <div className="flex items-center gap-2">
                                 <div className={`w-1 h-1 rounded-full ${sc.dot}`} />
                                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{d.status}</span>
                              </div>
                           </div>
                        </div>
                     </motion.div>
                  );
               })}
            </div>
         </div>
      </div>

      {/* FLOATING RIGHT: Selected Driver Stats */}
      <AnimatePresence>
         {selected && centerTab === 'map' && (
            <motion.div 
               initial={{ x: 100, opacity: 0 }} 
               animate={{ x: 0, opacity: 1 }} 
               exit={{ x: 100, opacity: 0 }}
               className="absolute top-32 right-8 w-80 z-20"
            >
               <div className="bg-white/80 backdrop-blur-3xl border border-white/50 rounded-[40px] shadow-2xl p-8 space-y-8">
                  <div className="flex items-center justify-between">
                     <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em]">Insights</h3>
                     <div className="flex bg-slate-50 p-1 rounded-xl">
                        {['daily', 'weekly'].map(p => (
                           <button 
                             key={p} onClick={() => setStatPeriod(p)}
                             className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${statPeriod === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                           >
                              {p}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     {stats.map((s: any, i: number) => (
                        <div key={i} className="p-5 bg-white/40 rounded-[28px] border border-white/40 group hover:border-indigo-200 transition-all">
                           <s.icon className="text-slate-300 group-hover:text-indigo-500 mb-3 text-lg" />
                           <p className="text-xl font-black text-slate-800 mb-0.5">{s.val}</p>
                           <p className="text-[9px] font-black text-slate-400 uppercase">{s.label}</p>
                        </div>
                     ))}
                  </div>

                  <div className="bg-indigo-600 rounded-[32px] p-6 text-white relative overflow-hidden">
                     <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-lg">{selected.profileImg}</div>
                           <p className="text-sm font-black">{selected.name}</p>
                        </div>
                        <div className="flex items-end justify-between">
                           <div>
                              <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest mb-1">Rating</p>
                              <p className="text-2xl font-black">4.9</p>
                           </div>
                           <a href={`tel:${selected.phone}`} className="w-10 h-10 bg-white text-indigo-600 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all">
                              <MdPhone />
                           </a>
                        </div>
                     </div>
                     <MdAnalytics className="absolute -bottom-6 -right-6 text-[120px] text-white/5 rotate-12" />
                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* FLOATING BOTTOM: Selected Driver Chat or Quick View */}
      <AnimatePresence>
         {selected && (
            <motion.div 
               initial={{ y: 100, opacity: 0 }} 
               animate={{ y: 0, opacity: 1 }} 
               exit={{ y: 100, opacity: 0 }}
               className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-6"
            >
               <div className="bg-slate-900 border border-white/10 rounded-[44px] shadow-[0_32px_84px_rgba(0,0,0,0.5)] p-2 backdrop-blur-2xl overflow-hidden">
                  {centerTab === 'chat' ? (
                     <div className="flex flex-col h-[400px]">
                        <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black">{selected.name[0]}</div>
                              <div>
                                 <h4 className="text-sm font-black text-white">{selected.name}</h4>
                                 <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Active Chat</p>
                              </div>
                           </div>
                           <button onClick={() => setCenterTab('map')} className="text-white/20 hover:text-white transition-colors"><MdKeyboardArrowRight className="text-2xl" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                           {(messages[selected.id] || []).map((m: any) => (
                              <div key={m.id} className={`flex ${m.sender === 'operator' ? 'justify-end' : 'justify-start'}`}>
                                 <div className={`max-w-[70%] p-5 rounded-[28px] ${m.sender === 'operator' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white/10 text-white rounded-bl-sm'}`}>
                                    <p className="text-xs font-medium leading-relaxed">{m.text}</p>
                                    <p className="text-[8px] font-black mt-2 uppercase text-white/40">{m.time}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                        <div className="p-6 bg-white/5">
                           <div className="relative">
                              <input 
                                 value={msg} onChange={e => setMsg(e.target.value)}
                                 onKeyDown={e => e.key === 'Enter' && sendMsg()}
                                 placeholder="Xabar yozing..." 
                                 className="w-full pl-8 pr-20 py-4 bg-white/10 border border-white/5 rounded-3xl outline-none focus:bg-white/20 font-bold text-white transition-all text-xs"
                              />
                              <button onClick={sendMsg} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white text-slate-900 rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all">
                                 <MdSend />
                              </button>
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-6 px-4">
                           <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-xl">{selected.profileImg}</div>
                           <div>
                              <h4 className="text-lg font-black text-white">{selected.name}</h4>
                              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{selected.car}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <button onClick={() => setCenterTab('chat')} className="px-8 py-4 bg-white/10 text-white border border-white/10 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">Open Chat</button>
                           <a href={`tel:${selected.phone}`} className="px-8 py-4 bg-emerald-500 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">Call Driver</a>
                        </div>
                     </div>
                  )}
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      <Modal isOpen={showBroadcast} onClose={() => setShowBroadcast(false)} title="Broadcast Message">
        <div className="p-12">
          <div className="flex items-center gap-8 mb-12">
            <div className="w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center shadow-2xl">
              <MdNotificationsActive className="text-white text-4xl" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Global Alert</h2>
              <p className="text-slate-400 text-base font-medium mt-1">Send a priority message to all {DRIVERS.length} active drivers.</p>
            </div>
          </div>

          <form onSubmit={sendBroadcast} className="space-y-8">
            <textarea 
               required value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)}
               placeholder="Xabar matni..." rows={5}
               className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[32px] outline-none focus:bg-white focus:border-indigo-400 font-bold text-lg text-slate-800 transition-all resize-none shadow-inner"
            />
            <div className="flex gap-4">
              <button type="button" onClick={() => setShowBroadcast(false)} className="flex-1 py-5 text-slate-400 font-black text-[11px] uppercase tracking-widest">Cancel</button>
              <button type="submit" className="flex-2 w-[300px] py-5 bg-indigo-600 text-white font-black rounded-3xl text-[11px] uppercase tracking-widest shadow-2xl shadow-indigo-200 active:scale-95 transition-all outline-none">Broadcast Now</button>
            </div>
          </form>
        </div>
      </Modal>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.1); }
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
