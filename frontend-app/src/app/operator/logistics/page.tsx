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
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="w-12 h-12 border-[4px] border-indigo-600 border-t-transparent rounded-full" />
      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Map Loading...</span>
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
    // Un-select logic if same clicked but let's keep it simple
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
    <div className="relative h-[calc(100vh-140px)] w-full overflow-hidden rounded-[44px] bg-slate-50 border border-slate-100 shadow-2xl">
      
      {/* MAP BASE LAYER */}
      <div className="absolute inset-0 z-0">
         <DriverMap selected={selected} drivers={DRIVERS} onSelect={handleSelectDriver} />
      </div>

      {/* MINIMALIST IMMERSIVE HEADER */}
      <div className="absolute top-4 left-0 right-0 z-30 pointer-events-none flex justify-center">
         <div className="bg-white/40 backdrop-blur-2xl px-6 py-2 border border-white/40 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.1)] flex items-center gap-8 pointer-events-auto">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-md shadow-lg shadow-indigo-200">
                  <MdLocalShipping />
               </div>
               <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Markazi</h2>
            </div>

            <div className="h-4 w-[1px] bg-slate-200" />

            <button 
               onClick={() => setShowBroadcast(true)}
               className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-all group"
            >
               <MdNotificationsActive className="text-amber-400 group-hover:animate-bounce" size={16} /> Broadcast Alert
            </button>

            <div className="h-4 w-[1px] bg-slate-200" />

            <div className="flex bg-slate-50/50 p-1 rounded-full border border-slate-100">
               <button onClick={() => setCenterTab('map')} className={`px-5 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${centerTab === 'map' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Map</button>
               <button onClick={() => setCenterTab('chat')} className={`px-5 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all relative ${centerTab === 'chat' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                  Chat {selected && unreadCount(selected.id) > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border border-white" />}
               </button>
            </div>
         </div>
      </div>

      {/* ULTRA-COMPACT LEFT PANEL (Drivers) */}
      <div className="absolute top-[80px] left-6 bottom-6 w-[240px] z-20 pointer-events-none">
         <div className="h-full bg-white/20 backdrop-blur-3xl border border-white/30 rounded-[44px] shadow-xl p-4 flex flex-col pointer-events-auto overflow-hidden">
            <div className="mb-4 px-1">
               <div className="relative">
                  <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-lg" />
                  <input 
                    value={listFilter} onChange={e => setListFilter(e.target.value)}
                    placeholder="Search..." 
                    className="w-full pl-10 pr-4 py-3 bg-white/30 border border-white/20 rounded-2xl text-[10px] font-black text-slate-800 outline-none focus:bg-white/50 focus:border-white transition-all shadow-inner placeholder:text-slate-400"
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
                        className={`group p-2.5 rounded-[22px] border cursor-pointer transition-all ${
                           isActive ? 'bg-white shadow-xl border-white' : 'bg-transparent border-transparent hover:bg-white/10'
                        }`}
                     >
                        <div className="flex items-center gap-2.5">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black relative shrink-0 ${sc.bg} opacity-80`}>
                              {d.name[0]}
                              {uc > 0 && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 rounded-full border border-white text-[6px] flex items-center justify-center font-black">{uc}</span>}
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="text-[10px] font-black text-slate-800 truncate leading-none mb-1">{d.name}</h4>
                              <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
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

      {/* ULTRA-COMPACT RIGHT PANEL (Stats) */}
      <AnimatePresence>
         {selected && centerTab === 'map' && (
            <motion.div 
               initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 50, opacity: 0 }}
               className="absolute top-[80px] right-6 w-[200px] z-20 pointer-events-none"
            >
               <div className="bg-white/20 backdrop-blur-3xl border border-white/30 rounded-[44px] shadow-xl p-4 space-y-3 pointer-events-auto">
                  <div className="grid grid-cols-1 gap-2">
                     {stats.slice(0, 3).map((s: any, i: number) => (
                        <div key={i} className="px-3 py-2 bg-white/30 rounded-2xl border border-white/20 flex items-center gap-3 transition-all hover:bg-white/40">
                           <div className="w-6 h-6 bg-slate-50/50 rounded-lg flex items-center justify-center text-slate-400">
                              <s.icon size={14} />
                           </div>
                           <div>
                              <p className="text-[11px] font-black text-slate-800 leading-none">{s.val}</p>
                              <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="bg-slate-950/80 rounded-[28px] p-3 text-white backdrop-blur-lg">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-lg">{selected.profileImg}</div>
                        <div>
                           <p className="text-[10px] font-black leading-none mb-1 truncate">{selected.name}</p>
                           <p className="text-[6px] font-black text-indigo-400 uppercase tracking-widest">{selected.car}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* ACTION BAR (Compacted Overlay) */}
      <AnimatePresence>
         {selected && (
            <motion.div 
               initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
               className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4 pointer-events-none"
            >
               <div className="bg-slate-950/80 border border-white/10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.4)] p-1.5 backdrop-blur-3xl pointer-events-auto">
                  {centerTab === 'chat' ? (
                     <div className="flex flex-col h-[280px]">
                        <div className="px-4 py-2 flex items-center justify-between border-b border-white/5">
                           <div className="flex items-center gap-3">
                              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-[10px]">{selected.name[0]}</div>
                              <p className="text-[10px] font-black text-white">{selected.name}</p>
                           </div>
                           <button onClick={() => setCenterTab('map')} className="w-7 h-7 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 transition-all flex items-center justify-center"><MdKeyboardArrowRight size={16} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                           {(messages[selected.id] || []).map((m: any) => (
                              <div key={m.id} className={`flex ${m.sender === 'operator' ? 'justify-end' : 'justify-start'}`}>
                                 <div className={`max-w-[80%] p-2.5 rounded-2xl ${m.sender === 'operator' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white/10 text-white rounded-bl-sm border border-white/5'}`}>
                                    <p className="text-[10px] font-medium leading-relaxed">{m.text}</p>
                                    <p className="text-[6px] font-black mt-1 uppercase text-white/30 tracking-widest">{m.time}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                        <div className="p-2 border-t border-white/5">
                           <div className="relative">
                              <input 
                                 value={msg} onChange={e => setMsg(e.target.value)}
                                 onKeyDown={e => e.key === 'Enter' && sendMsg()}
                                 placeholder="Message..." 
                                 className="w-full pl-5 pr-10 py-3 bg-white/5 border border-white/5 rounded-full outline-none focus:bg-white/10 font-bold text-white transition-all text-[10px]"
                              />
                              <button onClick={sendMsg} className="absolute right-1 w-8 h-8 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-xl font-black">
                                 <MdSend size={14} />
                              </button>
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div className="flex items-center justify-between pl-4 pr-1">
                        <div className="flex items-center gap-3 min-w-0">
                           <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-lg">{selected.profileImg}</div>
                           <div className="min-w-0">
                              <h4 className="text-[10px] font-black text-white truncate">{selected.name}</h4>
                              <p className="text-[6px] font-black text-indigo-400 uppercase tracking-widest">{selected.car}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <button onClick={() => setCenterTab('chat')} className="px-5 py-2.5 bg-white/5 text-white rounded-full text-[8px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Chat</button>
                           <a href={`tel:${selected.phone}`} className="px-5 py-2.5 bg-indigo-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-500 transition-all">Call</a>
                        </div>
                     </div>
                  )}
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      <Modal isOpen={showBroadcast} onClose={() => setShowBroadcast(false)} title="Broadcast Alert">
        <div className="p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center border border-white/10">
              <MdNotificationsActive className="text-amber-400 text-3xl animate-pulse" />
            </div>
            <div>
               <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-2">Global Alert</h2>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Barcha haydovchilar uchun</p>
            </div>
          </div>

          <form onSubmit={sendBroadcast} className="space-y-6">
            <textarea 
               required value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)}
               placeholder="Xabar matni..." rows={4}
               className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:bg-white focus:border-indigo-400 font-bold text-md text-slate-800 transition-all resize-none"
            />
            <div className="flex gap-4">
              <button type="button" onClick={() => setShowBroadcast(false)} className="flex-1 py-4 text-slate-400 font-black text-[9px] uppercase tracking-widest">Cancel</button>
              <button type="submit" className="flex-2 w-[220px] py-4 bg-slate-950 text-white font-black rounded-full text-[9px] uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all">Send Alert</button>
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
