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
  loading: () => <div className="absolute inset-0 bg-slate-50 flex items-center justify-center z-50">
    <div className="flex flex-col items-center gap-4">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="w-12 h-12 border-[4px] border-indigo-600 border-t-transparent rounded-full" />
      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">MAP LOADING...</span>
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
    <div className="relative w-full h-[calc(100vh-100px)] overflow-hidden rounded-[44px] bg-slate-900 border border-slate-100/10 shadow-2xl">
      
      {/* 1. LAYER 0: TRUE FULLSCREEN MAP */}
      <div className="absolute inset-0 z-0 scale-105">
         <DriverMap selected={selected} drivers={DRIVERS} onSelect={handleSelectDriver} />
      </div>

      {/* 2. LAYER 1: FLOATING GLASS HEADER (Hovers above map) */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 w-max px-2">
         <div className="bg-white/40 backdrop-blur-3xl px-8 py-3.5 border border-white/40 rounded-full shadow-2xl flex items-center gap-10">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-lg shadow-xl shadow-indigo-200">
                  <MdLocalShipping />
               </div>
               <div>
                  <h2 className="text-[11px] font-black text-slate-900 tracking-tight leading-none mb-1">MArkazi Center</h2>
                  <p className="text-[8.5px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Feed
                  </p>
               </div>
            </div>
            
            <div className="h-8 w-[1px] bg-slate-900/5" />
            
            <button 
               onClick={() => setShowBroadcast(true)}
               className="group flex items-center gap-4 px-10 py-3.5 bg-slate-950 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all active:scale-95"
            >
               <MdNotificationsActive className="text-amber-400 text-lg group-hover:scale-125 transition-transform" /> Broadcast
            </button>

            <div className="h-8 w-[1px] bg-slate-900/5" />

            <div className="flex items-center gap-3">
               <div className="px-10 py-3 bg-white/50 border border-white/20 rounded-full shadow-sm text-[9px] font-black text-slate-800 uppercase tracking-[0.1em]">
                  Control Point v4.2
               </div>
               <button className="w-10 h-10 bg-white/50 border border-white/20 rounded-full flex items-center justify-center text-slate-800 hover:bg-white transition-all shadow-sm"><MdMoreVert size={22}/></button>
            </div>
         </div>
      </div>

      {/* 3. LAYER 2: FLOATING DRIVER LIST (Left) */}
      <div className="absolute top-6 left-6 bottom-6 w-[260px] z-30 pointer-events-none">
         <div className="h-full bg-white/20 backdrop-blur-3xl border border-white/40 rounded-[44px] shadow-2xl p-5 flex flex-col pointer-events-auto">
            <div className="mb-6">
               <div className="relative">
                  <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl" />
                  <input 
                    value={listFilter} onChange={e => setListFilter(e.target.value)}
                    placeholder="Quick Search..." 
                    className="w-full pl-12 pr-4 py-4 bg-white/50 border border-white/30 rounded-[28px] text-[10px] font-black text-slate-800 outline-none focus:bg-white transition-all shadow-inner placeholder:text-slate-500"
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
                        className={`group p-3 rounded-[30px] border cursor-pointer transition-all ${
                           isActive ? 'bg-white shadow-2xl border-white translate-x-3' : 'bg-transparent border-transparent hover:bg-white/10'
                        }`}
                     >
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black relative shrink-0 ${sc.bg} opacity-90 shadow-md text-[11px]`}>
                              {d.name[0]}
                              {uc > 0 && <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-rose-500 rounded-full border-2 border-white text-[7px] flex items-center justify-center font-black shadow-lg">{uc}</span>}
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="text-[12px] font-black text-slate-900 truncate leading-none mb-1.5">{d.name}</h4>
                              <p className="text-[7px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                 <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} /> {d.status}
                              </p>
                           </div>
                        </div>
                     </motion.div>
                  );
               })}
            </div>
         </div>
      </div>

      {/* 4. LAYER 3: FLOATING ACTION & STATS SIDEBAR (Right) */}
      <AnimatePresence>
         {selected && (
            <motion.div 
               initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }}
               className="absolute top-6 right-6 bottom-6 w-[360px] z-30 pointer-events-none"
            >
               <div className="h-full flex flex-col gap-6 pointer-events-auto">
                  
                  {/* SELETCED DRIVER QUICK VIEW */}
                  <div className="bg-slate-950/80 backdrop-blur-3xl border border-white/10 rounded-[44px] shadow-[0_50px_100px_rgba(0,0,0,0.5)] p-8 text-white relative overflow-hidden">
                     <div className="relative z-10 flex flex-col gap-8">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-5">
                              <div className="w-16 h-16 bg-white/10 rounded-[28px] flex items-center justify-center text-3xl border border-white/5 backdrop-blur-md">{selected.profileImg}</div>
                              <div className="min-w-0">
                                 <h3 className="text-xl font-black tracking-tight truncate leading-none mb-2">{selected.name}</h3>
                                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.25em]">{selected.car}</p>
                              </div>
                           </div>
                           <a href={`tel:${selected.phone}`} className="w-14 h-14 bg-white text-slate-950 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl"><MdPhone size={28}/></a>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                           <button 
                              onClick={() => setIsChatOpen(!isChatOpen)} 
                              className="flex-1 py-5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-indigo-500 transition-all"
                           >
                              {isChatOpen ? <><MdKeyboardArrowRight size={20}/> Statistics</> : <><MdChat size={20}/> Communications</>}
                           </button>
                           <div className="flex-1 py-5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center justify-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Tracking
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* DYNAMIC CONTENT CONTAINER */}
                  <div className="flex-1 bg-white/20 backdrop-blur-4xl border border-white/40 rounded-[44px] shadow-2xl flex flex-col min-h-0 overflow-hidden">
                     {isChatOpen ? (
                        <div className="flex flex-col h-full">
                           <div className="px-10 py-7 border-b border-white/10 flex items-center justify-between bg-white/10 backdrop-blur-xl">
                              <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                                 <MdFingerprint className="text-indigo-600 text-lg" /> Encrypted Session
                              </p>
                              <button onClick={() => setIsChatOpen(false)} className="text-indigo-700 hover:text-slate-950 transition-all font-black text-[10px] uppercase">Exit Chat</button>
                           </div>
                           <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar">
                              {(messages[selected.id] || []).map((m: any) => (
                                 <div key={m.id} className={`flex ${m.sender === 'operator' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-5 rounded-[28px] ${m.sender === 'operator' ? 'bg-indigo-600 text-white shadow-2xl rounded-br-md translate-y-1' : 'bg-white/80 text-slate-800 border border-white backdrop-blur-md rounded-bl-md shadow-lg'}`}>
                                       <p className="text-[13px] font-medium leading-relaxed font-sans">{m.text}</p>
                                       <p className={`text-[8px] font-black mt-2.5 uppercase tracking-widest ${m.sender === 'operator' ? 'text-white/40' : 'text-slate-400'}`}>{m.time}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                           <div className="p-6 bg-white/10 border-t border-white/10">
                              <div className="relative">
                                 <input 
                                    value={msg} onChange={e => setMsg(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendMsg()}
                                    placeholder="Type master message..." 
                                    className="w-full pl-8 pr-16 py-6 bg-white/80 border border-white rounded-[35px] outline-none focus:bg-white text-[13px] font-bold text-slate-800 transition-all shadow-2xl"
                                 />
                                 <button onClick={sendMsg} className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-slate-950 transition-all"><MdSend size={24}/></button>
                              </div>
                           </div>
                        </div>
                     ) : (
                        <div className="p-10 h-full flex flex-col gap-8">
                           <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.25em] border-b border-indigo-50 pb-6 flex items-center justify-between">
                              Efficiency Vector <span className="text-[10px] text-slate-500">Real-time Stream</span>
                           </h3>
                           <div className="grid grid-cols-1 gap-5">
                              {stats.map((s: any, i: number) => (
                                 <div key={i} className="p-6 bg-white/60 border border-white rounded-[40px] flex items-center gap-6 group hover:bg-white transition-all shadow-xl hover:-translate-y-1">
                                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-[22px] flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner"><s.icon size={26}/></div>
                                    <div>
                                       <p className="text-2xl font-black text-slate-900 leading-none mb-1.5">{s.val}</p>
                                       <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                           <div className="mt-auto p-10 bg-gradient-to-br from-slate-950 to-indigo-950 rounded-[44px] text-white overflow-hidden relative shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
                              <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-3 opacity-60">Strategic Performance</p>
                              <p className="text-xl font-black leading-tight text-indigo-100">Analytical feed indicates 98.4% route optimization.</p>
                              <MdAnalytics className="absolute -bottom-6 -right-6 text-[150px] text-white/5 rotate-12" />
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* 5. OVERLAY MODALS */}
      <Modal isOpen={showBroadcast} onClose={() => setShowBroadcast(false)} title="Broadcast Alert">
        <div className="p-10">
          <div className="flex items-center gap-10 mb-12">
            <div className="w-24 h-24 bg-slate-950 rounded-[35px] flex items-center justify-center shadow-[0_30px_50px_rgba(0,0,0,0.4)] border border-white/5">
              <MdNotificationsActive className="text-amber-400 text-5xl animate-pulse" />
            </div>
            <div>
               <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-3">Global Broadcast</h2>
               <p className="text-slate-500 text-md font-medium tracking-wide">Barcha haydovchilarga strategik xabar yuborish.</p>
            </div>
          </div>

          <form onSubmit={sendBroadcast} className="space-y-10">
            <textarea 
               required value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)}
               placeholder="Haydovchilar uchun muhim ko'rsatma..." rows={5}
               className="w-full p-10 bg-slate-50 border border-slate-100 rounded-[50px] outline-none focus:bg-white focus:border-indigo-400 font-bold text-xl text-slate-800 transition-all resize-none shadow-inner"
            />
            <div className="flex gap-6">
              <button type="button" onClick={() => setShowBroadcast(false)} className="flex-1 py-6 text-slate-400 font-black text-[12px] uppercase tracking-widest hover:text-slate-900 transition-all">Dismiss</button>
              <button type="submit" className="flex-2 w-[350px] py-6 bg-slate-950 text-white font-black rounded-full text-[12px] uppercase tracking-widest shadow-2xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-5">
                 <MdSend className="text-3xl" /> Transmit Signal
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 20px; }
        .backdrop-blur-4xl { backdrop-filter: blur(80px); }
      `}</style>
    </div>
  );
}

export default function OperatorLogisticsPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-slate-900 flex items-center justify-center text-white/20 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Initializing Hub...</div>}>
      <LogisticsContent />
    </Suspense>
  );
}
