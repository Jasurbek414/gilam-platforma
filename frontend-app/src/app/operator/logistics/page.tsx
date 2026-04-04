'use client';

import React, { useState, useEffect, Suspense, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  MdLocalShipping, MdChat, MdNotificationsActive, MdLocationOn,
  MdSend, MdPhone, MdTrendingUp, MdDirectionsCar, MdInfo,
  MdSpeed, MdQueryBuilder, MdTimeline, MdMap, MdKeyboardArrowRight,
  MdFilterList, MdSearch, MdMoreVert, MdAnalytics, MdGroup, MdFingerprint,
  MdRefresh, MdDescription, MdSettings, MdRestore, MdSatellite, MdTerrain
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
  const [listFilter, setListFilter] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGlobalMoreOpen, setIsGlobalMoreOpen] = useState(false);
  const [mapType, setMapType] = useState<'streets' | 'satellite' | 'terrain'>('streets');
  const [showTraffic, setShowTraffic] = useState(false);
  
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
    const m = { id: Date.now(), text: msg, sender: 'operator', time: now };
    setMessages(p => ({ ...p, [selected.id]: [...(p[selected.id] || []), m] }));
    setMsg('');
  };

  const unreadCount = (id: number) => (messages[id] || []).filter(m => m.sender === 'driver').length;

  return (
    <div className="flex-1 flex flex-col font-sans -m-4 bg-slate-50 overflow-hidden relative min-h-[600px]">
      
      {/* 1. OVERLAY HEADER (Floating on Map) */}
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
         <div className="flex items-center gap-3 pointer-events-auto">
            <div className="h-[52px] bg-white/40 backdrop-blur-3xl border border-white/60 px-6 rounded-[24px] flex items-center gap-4 shadow-2xl">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-sm" />
               <h1 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.25em]">Live Command Hub</h1>
               <div className="h-4 w-[1px] bg-slate-200" />
               <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">v4.5 Stable</span>
            </div>
            
            <button 
               onClick={() => setShowBroadcast(true)}
               className="h-[52px] px-8 bg-slate-950 text-white rounded-[24px] text-[9px] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all flex items-center gap-3 pointer-events-auto"
            >
               <MdNotificationsActive className="text-amber-400 text-lg" /> Broadcast
            </button>
         </div>

         <div className="flex items-center gap-3 pointer-events-auto" ref={moreMenuRef}>
            <div className="relative">
               <button 
                  onClick={() => setIsGlobalMoreOpen(!isGlobalMoreOpen)}
                  className={`w-12 h-12 rounded-[22px] flex items-center justify-center transition-all bg-white/40 backdrop-blur-3xl border border-white/60 shadow-2xl ${
                     isGlobalMoreOpen ? 'text-indigo-600 scale-105' : 'text-slate-500 hover:text-slate-950'
                  }`}
               >
                  <MdMoreVert size={22}/>
               </button>

               <AnimatePresence>
                  {isGlobalMoreOpen && (
                     <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-[60px] w-56 bg-white/80 backdrop-blur-4xl border border-white rounded-[28px] shadow-2xl p-2.5 z-[100]"
                     >
                        <button onClick={() => { console.log('Refreshing...'); setIsGlobalMoreOpen(false); }} className="w-full p-4 rounded-2xl flex items-center gap-4 hover:bg-indigo-50 group transition-all">
                           <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-600"><MdRefresh size={20} /></div>
                           <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Refresh Tracking</span>
                        </button>
                        <button onClick={() => setIsGlobalMoreOpen(false)} className="w-full p-4 rounded-2xl flex items-center gap-4 hover:bg-slate-50 group transition-all">
                           <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400"><MdDescription size={20} /></div>
                           <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Generate Logs</span>
                        </button>
                        <div className="h-[1px] bg-slate-50 mx-2 my-2" />
                        <button onClick={() => setIsGlobalMoreOpen(false)} className="w-full p-4 rounded-2xl flex items-center gap-4 hover:bg-slate-50 group transition-all">
                           <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400"><MdSettings size={20} /></div>
                           <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">GIS Settings</span>
                        </button>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
         </div>
      </div>

      {/* 2. EDGE-TO-EDGE MAP BASE LAYER */}
      <div className="absolute inset-0 z-0">
         <DriverMap selected={selected} drivers={DRIVERS} onSelect={handleSelectDriver} mapType={mapType} showTraffic={showTraffic} />
         
         {/* FLOATING MAP SWITCHER (Bottom Center/Left) */}
         <div className="absolute bottom-6 left-[280px] z-50 flex gap-2">
            {[
               { id: 'streets', icon: MdMap, label: 'Default' },
               { id: 'satellite', icon: MdSatellite, label: 'Satellite' },
               { id: 'terrain', icon: MdTerrain, label: 'Terrain' }
            ].map(type => (
               <button 
                  key={type.id} onClick={() => setMapType(type.id as any)}
                  className={`px-4 py-3 rounded-2xl backdrop-blur-3xl border border-white/60 shadow-2xl flex items-center gap-3 transition-all ${
                     mapType === type.id ? 'bg-indigo-600 text-white border-indigo-500 scale-105' : 'bg-white/40 text-slate-600 hover:bg-white/60'
                  }`}
               >
                  <type.icon size={18} />
                  <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">{type.label}</span>
               </button>
            ))}

            <div className="w-[2px] bg-white/20 mx-1" />

            <button 
               onClick={() => setShowTraffic(!showTraffic)}
               className={`px-4 py-3 rounded-2xl backdrop-blur-3xl border border-white/60 shadow-2xl flex items-center gap-3 transition-all ${
                  showTraffic ? 'bg-emerald-600 text-white border-emerald-500 scale-105' : 'bg-white/40 text-slate-600 hover:bg-white/60'
               }`}
            >
               <span className="text-lg">🚦</span>
               <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Traffic</span>
            </button>
         </div>
      </div>

      {/* 3. FLOATING OVERLAYS: DRIVER LIST (Left) */}
      <div className="absolute top-[80px] left-4 bottom-6 w-[220px] lg:w-[260px] z-20 pointer-events-none">
         <div className="h-full bg-white/30 backdrop-blur-3xl border border-white/50 rounded-[32px] shadow-2xl p-4 lg:p-5 flex flex-col pointer-events-auto">
            <div className="mb-5">
               <div className="relative group">
                  <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-within:text-indigo-600 transition-colors" />
                  <input 
                    value={listFilter} onChange={e => setListFilter(e.target.value)}
                    placeholder="Search Grid..." 
                    className="w-full pl-11 pr-4 py-3 bg-white/60 border border-white/40 rounded-2xl text-[10px] font-black text-slate-900 outline-none focus:bg-white transition-all shadow-inner placeholder:text-slate-400"
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
                        className={`group p-3 rounded-2xl border cursor-pointer transition-all ${
                           isActive ? 'bg-white shadow-2xl border-white translate-x-2' : 'bg-transparent border-transparent hover:bg-white/40 shadow-sm'
                        }`}
                     >
                        <div className="flex items-center gap-3.5">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black relative shrink-0 ${sc.bg} shadow-lg text-[11px]`}>
                              {d.name[0]}
                              {uc > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 rounded-full border-2 border-white text-[7px] flex items-center justify-center font-black animate-bounce">{uc}</span>}
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="text-[11px] font-black text-slate-800 truncate mb-1">{d.name}</h4>
                              <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 leading-none">
                                 <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} /> {d.status}
                              </div>
                           </div>
                        </div>
                     </motion.div>
                  );
               })}
            </div>
         </div>
      </div>

      {/* 4. FLOATING OVERLAYS: ACTION SIDEBAR (Right) */}
      <AnimatePresence>
         {selected && (
            <motion.div 
               initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
               className="absolute top-[80px] right-4 bottom-6 w-[320px] lg:w-[360px] z-30 pointer-events-none"
            >
               <div className="h-full flex flex-col gap-4 pointer-events-auto">
                  
                  <div className="bg-slate-950/90 backdrop-blur-3xl border border-white/5 rounded-[32px] shadow-2xl p-6 text-white relative overflow-hidden group">
                     <div className="relative z-10 flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-3xl border border-white/5 shadow-inner">{selected.profileImg}</div>
                              <div className="min-w-0">
                                 <h3 className="text-lg font-black tracking-tight truncate mb-1">{selected.name}</h3>
                                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{selected.car}</p>
                              </div>
                           </div>
                           <a href={`tel:${selected.phone}`} className="w-12 h-12 bg-white text-slate-950 rounded-2xl flex items-center justify-center hover:scale-110 shadow-2xl transition-transform active:rotate-12"><MdPhone size={24}/></a>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                           <button 
                              onClick={() => setIsChatOpen(!isChatOpen)} 
                              className="flex-1 py-4.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-indigo-500 transition-all"
                           >
                              {isChatOpen ? <><MdKeyboardArrowRight size={20}/> Status Grid</> : <><MdChat size={20}/> Chat Link</>}
                           </button>
                           <div className="flex-1 py-4.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center justify-center gap-3">
                              FINGERPRINT: #{selected.id}00
                           </div>
                        </div>
                     </div>
                     <MdFingerprint className="absolute -bottom-4 -right-4 text-7xl text-white/5 rotate-12 transition-transform group-hover:rotate-0 duration-700" />
                  </div>

                  <div className="flex-1 bg-white/40 backdrop-blur-4xl border border-white/60 rounded-[32px] shadow-2xl flex flex-col min-h-0 overflow-hidden">
                     {isChatOpen ? (
                        <div className="flex flex-col h-full">
                           <div className="px-8 py-5 border-b border-white/20 flex items-center justify-between bg-white/10">
                              <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" /> Operator Signal</div>
                              <button onClick={() => setIsChatOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-all"><MdKeyboardArrowRight size={20}/></button>
                           </div>
                           <div className="flex-1 overflow-y-auto p-8 space-y-5 custom-scrollbar">
                              {(messages[selected.id] || []).map((m: any) => (
                                 <div key={m.id} className={`flex ${m.sender === 'operator' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-[22px] shadow-sm ${m.sender === 'operator' ? 'bg-indigo-600 text-white shadow-xl rounded-br-md' : 'bg-white text-slate-900 border border-white/40 rounded-bl-md'}`}>
                                       <p className="text-[11px] lg:text-[12px] font-bold leading-relaxed">{m.text}</p>
                                       <p className={`text-[7px] font-black mt-2 uppercase tracking-widest opacity-40`}>{m.time}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                           <div className="p-6 bg-white/20 border-t border-white/20">
                              <div className="bg-white/90 border border-white rounded-2xl p-1.5 flex items-center gap-3 shadow-2xl">
                                 <input 
                                   value={msg} onChange={e => setMsg(e.target.value)}
                                   onKeyDown={e => e.key === 'Enter' && sendMsg()}
                                   placeholder="Transmit signal code..." 
                                   className="flex-1 px-4 py-3 bg-transparent text-[11px] font-black text-slate-900 outline-none placeholder:text-slate-400 uppercase tracking-tight"
                                 />
                                 <button onClick={sendMsg} className="w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-2xl hover:bg-indigo-500 transition-all"><MdSend size={20}/></button>
                              </div>
                           </div>
                        </div>
                     ) : (
                        <div className="p-8 h-full flex flex-col gap-6">
                           <div className="grid grid-cols-2 gap-4">
                              <div className="bg-slate-950 text-white p-5 rounded-[24px] shadow-2xl flex flex-col gap-2 relative overflow-hidden">
                                 <p className="text-[8px] font-black text-white/40 uppercase tracking-widest relative z-10">Efficiency</p>
                                 <p className="text-3xl font-black relative z-10 tracking-tighter">94%</p>
                                 <MdTrendingUp className="absolute -bottom-2 -right-2 text-5xl text-white/5 -rotate-12" />
                              </div>
                              <div className="bg-white/80 p-5 rounded-[24px] border border-white shadow-xl flex flex-col gap-2">
                                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Load</p>
                                 <p className="text-3xl font-black text-slate-900 tracking-tighter">0.8 <span className="text-[10px] opacity-40">t.</span></p>
                              </div>
                           </div>
                           
                           <div className="flex-1 bg-white/40 rounded-[24px] border border-white/60 p-6 shadow-inner flex flex-col gap-4">
                              <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-2 border-b border-white pb-3">Fleet Intelligence Feed</p>
                              {[1,2,3].map(i => (
                                 <div key={i} className="flex gap-4 group">
                                    <div className="h-10 w-[1px] bg-indigo-200 group-hover:bg-indigo-600 transition-colors" />
                                    <div>
                                       <p className="text-[10px] font-black text-slate-800 truncate mb-1 uppercase tracking-tight">Signal Verified #{i}942</p>
                                       <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">LOGISTICS CLOUD • NOV 04</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                           
                           <button className="w-full py-5 bg-slate-950 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-2xl">Complete Deployment Report</button>
                        </div>
                     )}
                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* 5. BROADCAST MODAL */}
      <Modal isOpen={showBroadcast} onClose={() => setShowBroadcast(false)} title="Emergency Broadcast Hub">
         <div className="p-10 space-y-8 bg-slate-50">
            <div className="flex flex-col items-center text-center">
               <div className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white text-3xl shadow-2xl animate-pulse mb-6">
                  <MdNotificationsActive />
               </div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-3">Broadcast Signal</h2>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose max-w-[280px]">Transmit critical operational data to all active fleet members.</p>
            </div>

            <textarea 
               value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)}
               placeholder="Enter encrypted signal payload..."
               className="w-full h-44 p-8 bg-white border border-slate-100 rounded-[40px] text-sm font-bold text-slate-800 outline-none focus:border-indigo-600 transition-all shadow-inner resize-none placeholder:text-slate-300"
            />

            <div className="flex gap-4">
               <button onClick={() => setShowBroadcast(false)} className="flex-1 py-5 bg-white text-slate-400 font-black rounded-[28px] text-[10px] uppercase tracking-widest border border-slate-100 hover:bg-slate-50 transition-all">Cancel</button>
               <button onClick={sendBroadcast} className="flex-1 py-5 bg-indigo-600 text-white font-black rounded-[28px] text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">Transmit Data</button>
            </div>
         </div>
      </Modal>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .backdrop-blur-4xl { backdrop-filter: blur(120px); }
      `}</style>
    </div>
  );
}

export default function OperatorLogisticsPage() {
  return (
    <div className="w-full h-full flex flex-col min-h-[calc(100vh-140px)]">
      <Suspense fallback={<div className="flex-1 bg-slate-50 flex items-center justify-center font-black text-slate-300 uppercase tracking-widest text-[10px]">Loading Interface...</div>}>
        <LogisticsContent />
      </Suspense>
    </div>
  );
}
