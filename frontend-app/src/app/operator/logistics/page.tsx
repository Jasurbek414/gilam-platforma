'use client';

import React, { useState, useEffect, Suspense, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  MdLocalShipping, MdChat, MdNotificationsActive, MdLocationOn,
  MdSend, MdPhone, MdTrendingUp, MdDirectionsCar, MdInfo,
  MdSpeed, MdQueryBuilder, MdTimeline, MdMap, MdKeyboardArrowRight,
  MdFilterList, MdSearch, MdMoreVert, MdAnalytics, MdGroup, MdFingerprint,
  MdRefresh, MdDescription, MdSettings, MdRestore
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Modal from '@/components/ui/Modal';

// High-Performance Map Layer
const DriverMap = dynamic(() => import('./DriverMap'), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-slate-50 flex items-center justify-center z-0">
    <div className="flex flex-col items-center gap-2">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} className="w-8 h-8 border-[2px] border-indigo-600 border-t-transparent rounded-full" />
      <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center">Loading...</span>
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
  const [isGlobalMoreOpen, setIsGlobalMoreOpen] = useState(false);
  
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsGlobalMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleRefreshTracking = () => {
    console.log('Refreshing Global Logistics Signals...');
    setIsGlobalMoreOpen(false);
  };

  const unreadCount = (id: number) => (messages[id] || []).filter(m => m.sender === 'driver').length;

  return (
    <div className="h-full flex flex-col font-sans">
      {/* 1. COMPACT HEADER */}
      <div className="shrink-0 h-[64px] bg-white border border-slate-100 rounded-[20px] mb-3 px-6 flex items-center justify-between shadow-sm relative z-50">
         <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-200" />
               <h1 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.25em]">Live Logistics Grid</h1>
            </div>
            
            <div className="h-6 w-[1px] bg-slate-100" />
            
            <button 
               onClick={() => setShowBroadcast(true)}
               className="flex items-center gap-2.5 px-6 py-2.5 bg-slate-950 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
               <MdNotificationsActive className="text-amber-400 text-lg" /> Broadcast
            </button>
         </div>

         <div className="flex items-center gap-3">
            <div className="hidden lg:flex px-6 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-indigo-600 uppercase tracking-widest">
               v4.5 Stable
            </div>
            <div className="relative" ref={moreMenuRef}>
               <button 
                  onClick={() => setIsGlobalMoreOpen(!isGlobalMoreOpen)}
                  className={`w-9 h-9 border rounded-xl flex items-center justify-center transition-all ${
                     isGlobalMoreOpen ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-950'
                  }`}
               >
                  <MdMoreVert size={20}/>
               </button>

               <AnimatePresence>
                  {isGlobalMoreOpen && (
                     <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-[48px] w-56 bg-white/90 backdrop-blur-2xl border border-white rounded-2xl shadow-2xl p-2 z-[9999]"
                     >
                        <button onClick={handleRefreshTracking} className="w-full p-3 rounded-xl flex items-center gap-3 hover:bg-indigo-50 group transition-all">
                           <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors"><MdRefresh size={18} /></div>
                           <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Refresh Grid</span>
                        </button>
                        <button onClick={() => setIsGlobalMoreOpen(false)} className="w-full p-3 rounded-xl flex items-center gap-3 hover:bg-slate-50 group transition-all">
                           <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-slate-950 transition-colors"><MdDescription size={18} /></div>
                           <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Export Logs</span>
                        </button>
                        <div className="h-[1px] bg-slate-50 mx-2 my-2" />
                        <button onClick={() => setIsGlobalMoreOpen(false)} className="w-full p-3 rounded-xl flex items-center gap-3 hover:bg-slate-50 group transition-all">
                           <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-slate-950 transition-colors"><MdSettings size={18} /></div>
                           <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Map Settings</span>
                        </button>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
         </div>
      </div>

      {/* 2. MAIN FEED CONTAINER */}
      <div className="relative flex-1 w-full overflow-hidden rounded-[20px] bg-slate-50 border border-slate-100 shadow-xl">
         
         {/* MAP BASE LAYER */}
         <div className="absolute inset-0 z-0">
            <DriverMap selected={selected} drivers={DRIVERS} onSelect={handleSelectDriver} />
         </div>

         {/* SLIM DRIVER LIST (Left) */}
         <div className="absolute top-3 left-3 bottom-3 w-[200px] z-20 pointer-events-none">
            <div className="h-full bg-white/30 backdrop-blur-3xl border border-white/50 rounded-[24px] shadow-2xl p-3 flex flex-col pointer-events-auto">
               <div className="mb-3">
                  <div className="relative">
                     <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-md" />
                     <input 
                       value={listFilter} onChange={e => setListFilter(e.target.value)}
                       placeholder="Filter..." 
                       className="w-full pl-8 pr-3 py-2 bg-white/60 border border-white/30 rounded-xl text-[9px] font-black text-slate-900 outline-none focus:bg-white transition-all shadow-inner placeholder:text-slate-400"
                     />
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                  {filteredDrivers.map(d => {
                     const uc = unreadCount(d.id);
                     const isActive = selected?.id === d.id;
                     const sc = STATUS_COLOR[d.status];

                     return (
                        <motion.div 
                           layout key={d.id} onClick={() => handleSelectDriver(d)}
                           className={`group p-2 rounded-xl border cursor-pointer transition-all ${
                              isActive ? 'bg-white shadow-xl border-white translate-x-1' : 'bg-transparent border-transparent hover:bg-white/20'
                           }`}
                        >
                           <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-black relative shrink-0 ${sc.bg} opacity-90 shadow-sm text-[9px]`}>
                                 {d.name[0]}
                                 {uc > 0 && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-500 rounded-full border border-white text-[6px] flex items-center justify-center font-black">{uc}</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <h4 className="text-[10px] font-black text-slate-800 truncate leading-none mb-1">{d.name}</h4>
                                 <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5 leading-none">
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

         {/* SLIM ACTION SIDEBAR (Right) */}
         <AnimatePresence>
            {selected && (
               <motion.div 
                  initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
                  className="absolute top-3 right-3 bottom-3 w-[280px] z-30 pointer-events-none"
               >
                  <div className="h-full flex flex-col gap-2.5 pointer-events-auto">
                     
                     <div className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[24px] shadow-2xl p-4 text-white relative overflow-hidden">
                        <div className="relative z-10 flex flex-col gap-4">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl border border-white/5">{selected.profileImg}</div>
                                 <div className="min-w-0">
                                    <h3 className="text-sm font-black tracking-tight truncate leading-none mb-1.5">{selected.name}</h3>
                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">{selected.car}</p>
                                 </div>
                              </div>
                              <a href={`tel:${selected.phone}`} className="w-8 h-8 bg-white text-slate-950 rounded-lg flex items-center justify-center hover:scale-110 shadow-lg"><MdPhone size={18}/></a>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-2">
                              <button 
                                 onClick={() => setIsChatOpen(!isChatOpen)} 
                                 className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-500 transition-all"
                              >
                                 {isChatOpen ? <><MdKeyboardArrowRight size={16}/> Stats</> : <><MdChat size={16}/> Chat</>}
                              </button>
                              <div className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center justify-center gap-2">
                                 #ID{selected.id}
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="flex-1 bg-white/30 backdrop-blur-3xl border border-white/50 rounded-[24px] shadow-2xl flex flex-col min-h-0 overflow-hidden">
                        {isChatOpen ? (
                           <div className="flex flex-col h-full">
                              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/10">
                                 <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Operator Chat</p>
                                 <button onClick={() => setIsChatOpen(false)} className="text-indigo-700 hover:text-slate-950 transition-all font-black text-[8px] uppercase">Close</button>
                              </div>
                              <div className="flex-1 overflow-y-auto p-6 space-y-3.5 custom-scrollbar">
                                 {(messages[selected.id] || []).map((m: any) => (
                                    <div key={m.id} className={`flex ${m.sender === 'operator' ? 'justify-end' : 'justify-start'}`}>
                                       <div className={`max-w-[90%] p-3.5 rounded-2xl ${m.sender === 'operator' ? 'bg-indigo-600 text-white shadow-xl rounded-br-md translate-y-0.5' : 'bg-white/80 text-slate-900 border border-white shadow-sm rounded-bl-md'}`}>
                                          <p className="text-[11px] font-medium leading-relaxed">{m.text}</p>
                                          <p className={`text-[6px] font-black mt-1.5 uppercase tracking-widest ${m.sender === 'operator' ? 'text-white/40' : 'text-slate-400'}`}>{m.time}</p>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        ) : (
                           <div className="p-6 h-full flex flex-col gap-6">
                              <div className="grid grid-cols-1 gap-3">
                                 <div className="bg-white/60 p-4 rounded-2xl border border-white flex flex-col gap-1">
                                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Live Efficiency</p>
                                    <p className="text-2xl font-black text-slate-900">92%</p>
                                    <MdTrendingUp className="text-indigo-600 text-lg" />
                                 </div>
                                 <div className="bg-white/60 p-4 rounded-2xl border border-white flex flex-col gap-1">
                                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Deliveries</p>
                                    <p className="text-2xl font-black text-slate-900">8</p>
                                    <MdLocalShipping className="text-amber-500 text-lg" />
                                 </div>
                              </div>
                              <button className="mt-auto w-full py-4 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">Complete Intelligence Report</button>
                           </div>
                        )}
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

      {/* 4. BROADCAST MODAL */}
      <Modal isOpen={showBroadcast} onClose={() => setShowBroadcast(false)}>
         <div className="p-10 space-y-8 bg-slate-50">
            <div className="flex flex-col items-center text-center">
               <div className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white text-3xl shadow-2xl animate-pulse mb-6">
                  <MdNotificationsActive />
               </div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-3">Broadcast Signal</h2>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emergency Dispatch to All Active Drivers</p>
            </div>

            <textarea 
               value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)}
               placeholder="Enter critical message here..."
               className="w-full h-40 p-6 bg-white border border-slate-100 rounded-[32px] text-sm font-bold text-slate-800 outline-none focus:border-indigo-600 transition-all shadow-inner resize-none placeholder:text-slate-300"
            />

            <div className="flex gap-4">
               <button onClick={() => setShowBroadcast(false)} className="flex-1 py-5 bg-white text-slate-400 font-black rounded-[24px] text-[10px] uppercase tracking-widest border border-slate-100 hover:bg-slate-50 transition-all">Cancel</button>
               <button onClick={sendBroadcast} className="flex-1 py-5 bg-indigo-600 text-white font-black rounded-[24px] text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">Transmit Signal</button>
            </div>
         </div>
      </Modal>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .backdrop-blur-4xl { backdrop-filter: blur(80px); }
      `}</style>
    </div>
  );
}

export default function OperatorLogisticsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LogisticsContent />
    </Suspense>
  );
}
