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
    <div className="relative h-[calc(100vh-140px)] w-full overflow-hidden rounded-[40px] bg-white border border-slate-100 shadow-2xl">
      
      {/* MAP BASE LAYER */}
      <div className="absolute inset-0 z-0">
         <DriverMap selected={selected} drivers={DRIVERS} onSelect={handleSelectDriver} />
      </div>

      {/* COMPACT UNIFIED TOP HEADER */}
      <div className="absolute top-6 left-6 right-6 z-30 pointer-events-none">
         <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-3xl p-2.5 border border-indigo-100/30 rounded-[32px] shadow-2xl flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-4 px-4 border-r border-slate-100">
               <div className="w-11 h-11 bg-indigo-600 rounded-[18px] flex items-center justify-center text-white text-lg shadow-lg">
                  <MdLocalShipping />
               </div>
               <div>
                  <h2 className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1">MArkazi</h2>
                  <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">LIVE</p>
                  </div>
               </div>
            </div>

            <div className="flex-1 flex justify-center">
               <button 
                  onClick={() => setShowBroadcast(true)}
                  className="px-6 py-3 bg-slate-950 text-white rounded-[20px] text-[10px] font-black uppercase tracking-[0.1em] flex items-center gap-3 transition-all hover:bg-slate-900 active:scale-95 shadow-xl"
               >
                  <MdNotificationsActive className="text-amber-400 text-lg" /> Broadcast
               </button>
            </div>

            <div className="bg-slate-100/50 p-1 rounded-[22px] flex items-center border border-slate-100 mr-2">
               <button onClick={() => setCenterTab('map')} className={`px-6 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${centerTab === 'map' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-700'}`}>Map</button>
               <button onClick={() => setCenterTab('chat')} className={`px-6 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all relative ${centerTab === 'chat' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-700'}`}>
                  Chat {selected && unreadCount(selected.id) > 0 && <span className="absolute top-1 right-3 w-3 h-3 bg-rose-500 rounded-full border-2 border-white shadow-sm" />}
               </button>
            </div>
         </div>
      </div>

      {/* COMPACT LEFT PANELS */}
      <div className="absolute top-[120px] left-6 bottom-32 w-[300px] z-20 pointer-events-none">
         <div className="h-full bg-white/70 backdrop-blur-3xl border border-indigo-50/50 rounded-[40px] shadow-2xl p-6 flex flex-col pointer-events-auto overflow-hidden">
            <div className="mb-6 px-1">
               <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-indigo-600 rounded-full" /> Haydovchilar
               </h3>
               <div className="relative">
                  <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xl" />
                  <input 
                    value={listFilter} onChange={e => setListFilter(e.target.value)}
                    placeholder="Search..." 
                    className="w-full pl-11 pr-4 py-4 bg-white/50 border border-slate-50 rounded-2xl text-[12px] font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-100 transition-all shadow-inner placeholder:text-slate-200"
                  />
               </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
               {filteredDrivers.map(d => {
                  const uc = unreadCount(d.id);
                  const isActive = selected?.id === d.id;
                  const sc = STATUS_COLOR[d.status];

                  return (
                     <motion.div 
                        layout key={d.id} onClick={() => handleSelectDriver(d)}
                        className={`group p-3 rounded-[24px] border cursor-pointer transition-all ${
                           isActive ? 'bg-white shadow-xl border-indigo-100' : 'bg-transparent border-transparent hover:bg-white/40'
                        }`}
                     >
                        <div className="flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black relative shrink-0 ${sc.bg}`}>
                              {d.name[0]}
                              {uc > 0 && <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-rose-500 rounded-full border-2 border-white text-[7px] flex items-center justify-center font-black">{uc}</span>}
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="text-[12px] font-bold text-slate-800 truncate">{d.name}</h4>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                                 <div className={`w-1 h-1 rounded-full ${sc.dot}`} /> {d.status}
                              </p>
                           </div>
                           <AnimatePresence>
                              {isActive && (
                                 <motion.button 
                                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                                    onClick={(e) => { e.stopPropagation(); setCenterTab('chat'); }}
                                    className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                 >
                                    <MdChat className="text-sm" />
                                 </motion.button>
                              )}
                           </AnimatePresence>
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
               initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 50, opacity: 0 }}
               className="absolute top-[120px] right-6 w-[280px] z-20 pointer-events-none"
            >
               <div className="bg-white/80 backdrop-blur-3xl border border-indigo-50/50 rounded-[40px] shadow-2xl p-6 space-y-6 pointer-events-auto">
                  <div className="flex items-center justify-between">
                     <h3 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" /> Stats
                     </h3>
                     <div className="flex bg-slate-100/50 p-1 rounded-lg">
                        {['daily', 'weekly'].map(p => (
                           <button 
                             key={p} onClick={() => setStatPeriod(p)}
                             className={`px-3 py-1 rounded-md text-[7px] font-black uppercase transition-all ${statPeriod === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                           >
                              {p}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                     {stats.slice(0, 3).map((s: any, i: number) => (
                        <div key={i} className="px-4 py-3 bg-white/40 rounded-2xl border border-white/50 flex items-center gap-4 group hover:bg-white hover:border-indigo-100 transition-all">
                           <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 group-hover:text-indigo-500 transition-colors">
                              <s.icon className="text-base" />
                           </div>
                           <div>
                              <p className="text-[14px] font-black text-slate-800 leading-none">{s.val}</p>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-wide mt-1">{s.label}</p>
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[32px] p-5 text-white relative overflow-hidden shadow-2xl">
                     <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl backdrop-blur-md">{selected.profileImg}</div>
                           <p className="text-[12px] font-black">{selected.name}</p>
                        </div>
                        <a href={`tel:${selected.phone}`} className="w-9 h-9 bg-white text-indigo-600 rounded-xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all">
                           <MdPhone className="text-lg" />
                        </a>
                     </div>
                     <MdAnalytics className="absolute -bottom-8 -right-8 text-7xl text-white/5 rotate-12" />
                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* FLOATING BOTTOM: Selected Driver Chat or Quick View */}
      <AnimatePresence>
         {selected && (
            <motion.div 
               initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
               className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 pointer-events-none"
            >
               <div className="bg-slate-950/95 border border-white/10 rounded-[40px] shadow-[0_32px_80px_rgba(0,0,0,0.6)] p-2 backdrop-blur-3xl overflow-hidden pointer-events-auto">
                  {centerTab === 'chat' ? (
                     <div className="flex flex-col h-[350px]">
                        <div className="px-8 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                           <div className="flex items-center gap-4">
                              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg">{selected.name[0]}</div>
                              <p className="text-xs font-black text-white">{selected.name}</p>
                           </div>
                           <button onClick={() => setCenterTab('map')} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 transition-all"><MdKeyboardArrowRight className="text-xl" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
                           {(messages[selected.id] || []).map((m: any) => (
                              <div key={m.id} className={`flex ${m.sender === 'operator' ? 'justify-end' : 'justify-start'}`}>
                                 <div className={`max-w-[75%] p-4 rounded-2xl ${m.sender === 'operator' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white/10 text-white rounded-bl-sm border border-white/5'}`}>
                                    <p className="text-[12px] font-medium leading-relaxed">{m.text}</p>
                                    <p className="text-[7px] font-black mt-2 uppercase text-white/30 tracking-widest">{m.time}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                        <div className="p-4 bg-white/[0.03] border-t border-white/5">
                           <div className="relative">
                              <input 
                                 value={msg} onChange={e => setMsg(e.target.value)}
                                 onKeyDown={e => e.key === 'Enter' && sendMsg()}
                                 placeholder="Type a message..." 
                                 className="w-full pl-6 pr-14 py-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:bg-white/10 font-bold text-white transition-all text-xs"
                              />
                              <button onClick={sendMsg} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white text-slate-900 rounded-xl flex items-center justify-center shadow-xl font-black">
                                 <MdSend />
                              </button>
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-5 px-3">
                           <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl border border-white/5">{selected.profileImg}</div>
                           <div>
                              <h4 className="text-md font-black text-white leading-none mb-1.5">{selected.name}</h4>
                              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{selected.car}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 pr-2">
                           <button onClick={() => setCenterTab('chat')} className="px-6 py-3.5 bg-white/5 text-white border border-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Chat</button>
                           <a href={`tel:${selected.phone}`} className="px-6 py-3.5 bg-indigo-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-500 transition-all">Call</a>
                        </div>
                     </div>
                  )}
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      <Modal isOpen={showBroadcast} onClose={() => setShowBroadcast(false)} title="Global Alert">
        <div className="p-10">
          <div className="flex items-center gap-8 mb-10">
            <div className="w-20 h-20 bg-slate-900 rounded-[28px] flex items-center justify-center shadow-2xl border border-white/10">
              <MdNotificationsActive className="text-amber-400 text-4xl animate-pulse" />
            </div>
            <div>
               <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">Global Alert</h2>
               <p className="text-slate-400 text-sm font-medium">Barcha haydovchilarga tezkor xabar yuborish.</p>
            </div>
          </div>

          <form onSubmit={sendBroadcast} className="space-y-8">
            <textarea 
               required value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)}
               placeholder="Xabar matni..." rows={5}
               className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[32px] outline-none focus:bg-white focus:border-indigo-400 font-bold text-lg text-slate-800 transition-all resize-none shadow-inner"
            />
            <div className="flex gap-4">
              <button type="button" onClick={() => setShowBroadcast(false)} className="flex-1 py-5 text-slate-400 font-black text-[10px] uppercase tracking-widest">Cancel</button>
              <button type="submit" className="flex-2 w-[280px] py-5 bg-slate-950 text-white font-black rounded-[28px] text-[10px] uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3">
                 <MdSend className="text-xl" /> Send Alert
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
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
