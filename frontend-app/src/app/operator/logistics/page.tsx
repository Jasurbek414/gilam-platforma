'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  MdLocalShipping, MdChat, MdNotificationsActive, MdLocationOn,
  MdSend, MdPhone, MdTrendingUp, MdDirectionsCar, MdInfo,
  MdSpeed, MdQueryBuilder, MdTimeline, MdMap, MdKeyboardArrowRight,
  MdFilterList, MdSearch, MdMoreVert,
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import Modal from '@/components/ui/Modal';

const DriverMap = dynamic(() => import('./DriverMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-50 flex items-center justify-center animate-pulse">
    <div className="flex flex-col items-center gap-4">
      <MdMap className="text-6xl text-slate-200" />
      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Xarita yuklanmoqda...</span>
    </div>
  </div>
});

const DRIVERS = [
  { id: 1, name: 'Sardor Rahimov',  status: 'BUYURTMA OLMOQDA', phone: '+998 90 111 22 33', car: 'Damas 01A123BA',  location: 'Chilonzor 9-kv',  lat: 41.2995, lng: 69.2401, profileImg: '👤' },
  { id: 2, name: 'Jamshid Karimov', status: 'YETKAZIB BERMOQDA', phone: '+998 90 444 55 66', car: 'Labo 01B456CA',   location: 'Yunusobod 4-mv',  lat: 41.3411, lng: 69.3128, profileImg: '👤' },
  { id: 3, name: 'Bekzod Aliyev',   status: "BO'SH",             phone: '+998 93 777 88 99', car: 'Damas 01C789DA',  location: "Qo'yliq bozori",  lat: 41.2783, lng: 69.3591, profileImg: '👤' },
  { id: 4, name: "Otabek G'ulomov", status: 'OVQATLANISHDA',     phone: '+998 94 000 11 22', car: 'Damas 01D000EA',  location: 'Markaziy ofis',   lat: 41.3119, lng: 69.2796, profileImg: '👤' },
];

const STATUS_COLOR: Record<string, { bg: string; text: string; dot: string; icon: string }> = {
  "BO'SH": { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: 'bg-emerald-500 text-white' },
  'BUYURTMA OLMOQDA': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', icon: 'bg-amber-500 text-white' },
  'YETKAZIB BERMOQDA': { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500', icon: 'bg-indigo-500 text-white' },
  'OVQATLANISHDA': { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400', icon: 'bg-slate-400 text-white' },
};

const STAT_PRESETS: Record<string, any> = {
  daily:   { orders: 15,  active: '6s 12d', speed: 42 },
  weekly:  { orders: 84,  active: '42s',     speed: 38 },
  monthly: { orders: 320, active: '180s',    speed: 40 },
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

  const sendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const m = { id: Date.now(), text: `📢 ${broadcastMsg}`, sender: 'operator', time: t };
    setMessages(p => {
      const newHistory = { ...p };
      DRIVERS.forEach(d => {
        newHistory[d.id] = [...(newHistory[d.id] || []), m];
      });
      return newHistory;
    });
    setBroadcastMsg('');
    setShowBroadcast(false);
  };

  const stats = STAT_PRESETS[statPeriod] || STAT_PRESETS.daily;
  const unreadCount = (id: number) => (messages[id] || []).filter(m => m.sender === 'driver').length;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] space-y-16">
      
      {/* Dynamic Header Section */}
      <div className="flex items-center justify-between shrink-0 bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-indigo-700 rounded-[24px] flex items-center justify-center shadow-2xl shadow-indigo-100">
            <MdLocalShipping className="text-white text-3xl" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Logistika & Monitoring</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">Haydovchilar bilan real-vaqtdagi boshqaruv markazi</p>
          </div>
        </div>

        <div className="flex items-center gap-6 relative z-10">
          <div className="flex items-center gap-3">
             <div className="text-right mr-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-xs font-black text-emerald-600 uppercase">Tizim on-line</p>
                </div>
             </div>
             <button 
              onClick={() => setShowBroadcast(true)}
              className="px-8 py-4 bg-slate-950 text-white font-black rounded-3xl shadow-2xl shadow-slate-200 hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all active:scale-95 text-xs uppercase tracking-widest flex items-center gap-3"
            >
              <MdNotificationsActive className="text-indigo-400 text-lg" /> Umumiy xabar yuborish
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 opacity-40 blur-3xl"></div>
      </div>

      {/* Workspace Grid - NEW Balanced Grid Distribution */}
      <div className="flex-1 grid grid-cols-12 gap-10 min-h-0 overflow-hidden">
        
        {/* Column 1: Clean Driver List (25% Width) */}
        <div className="col-span-3 bg-white rounded-[56px] border border-slate-100 shadow-sm flex flex-col min-w-0">
          <div className="p-8 border-b border-slate-50 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                <MdFilterList className="text-indigo-600 text-xl" /> Haydovchilar jamoasi <span className="text-slate-300">({DRIVERS.length})</span>
              </h3>
            </div>
            <div className="relative group">
              <MdSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors text-lg" />
              <input 
                value={listFilter} onChange={e => setListFilter(e.target.value)}
                placeholder="Qidiruv..." 
                className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[28px] text-[14px] font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 ring-indigo-500/5 border border-transparent focus:border-indigo-100 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 custom-scrollbar">
            {filteredDrivers.map(d => {
              const uc = unreadCount(d.id);
              const color = STATUS_COLOR[d.status] || STATUS_COLOR["OVQATLANISHDA"];
              const isActive = selected?.id === d.id;
              
              return (
                <motion.div 
                  layout
                  key={d.id} 
                  onClick={() => handleSelectDriver(d)}
                  className={`group relative p-6 rounded-[36px] border cursor-pointer transition-all ${
                    isActive 
                      ? 'border-indigo-600 bg-white shadow-2xl shadow-indigo-100 scale-[1.02]' 
                      : 'border-slate-50 hover:border-indigo-200 bg-slate-50/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 transition-all duration-500 ${
                      isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 rotate-3' : 'bg-white text-slate-400 shadow-sm'
                    }`}>
                      <span className="text-xl font-black">{d.name[0]}</span>
                      {uc > 0 && <span className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 rounded-full border-4 border-white text-[10px] font-black text-white flex items-center justify-center animate-bounce">{uc}</span>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <h4 className={`text-base font-black truncate transition-colors ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>{d.name}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${color.dot} opacity-60`} />
                        <span className={`text-[9px] font-black uppercase tracking-widest ${color.text} truncate`}>
                          {d.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isActive && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex gap-3">
                        <a href={`tel:${d.phone}`} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 font-black rounded-2xl text-[10px] hover:bg-emerald-100 transition-all uppercase tracking-widest">
                          <MdPhone /> Qo'ng'iroq
                        </a>
                        <button onClick={() => setCenterTab('chat')} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 font-black rounded-2xl text-[10px] hover:bg-indigo-100 transition-all uppercase tracking-widest">
                          <MdChat /> Tanlash
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Detailed Info at bottom */}
          <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
             <div className="flex gap-4">
                <div className="text-center">
                   <p className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest">Jami</p>
                   <p className="text-lg font-black text-slate-700 leading-none">{DRIVERS.length}</p>
                </div>
                <div className="w-px h-6 bg-slate-200 mt-2" />
                <div className="text-center">
                   <p className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest">Bo'sh</p>
                   <p className="text-lg font-black text-emerald-500 leading-none">{DRIVERS.filter(d => d.status === "BO'SH").length}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Column 2: Spacious Map (50% Width) - Lowered specifically */}
        <div className="col-span-6 mt-8 bg-white rounded-[64px] overflow-hidden flex flex-col relative shadow-2xl shadow-indigo-900/10 border border-slate-100 transition-all hover:shadow-indigo-900/20">
          
          {/* Futuristic Control Center Tabs - Lowered */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex p-1.5 bg-white/70 backdrop-blur-3xl rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white/50">
            <button 
              onClick={() => setCenterTab('map')}
              className={`flex items-center gap-3 px-12 py-4 rounded-[36px] text-[13px] font-black uppercase tracking-[0.25em] transition-all duration-500 ${
                centerTab === 'map' ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/30' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <MdMap className="text-xl" /> Xarita
            </button>
            <button 
              onClick={() => setCenterTab('chat')}
              className={`flex items-center gap-3 px-12 py-4 rounded-[36px] text-[13px] font-black uppercase tracking-[0.25em] transition-all duration-500 relative ${
                centerTab === 'chat' ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/30' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <MdChat className="text-xl" /> Muloqot Markazi
              {selected && unreadCount(selected.id) > 0 && <span className="absolute top-2 right-8 w-3 h-3 bg-rose-500 rounded-full border-[3px] border-white shadow-lg" />}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {centerTab === 'map' ? (
              <motion.div key="map-view" initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="flex-1 w-full h-full relative">
                <DriverMap 
                  drivers={DRIVERS} 
                  selected={selected} 
                  onSelect={handleSelectDriver} 
                />
                
                {/* Floating Driver Info Card on Map */}
                {selected && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    className="absolute bottom-10 left-10 right-10 bg-white/80 backdrop-blur-2xl rounded-[40px] p-6 border border-white/50 shadow-2xl flex items-center justify-between z-10"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-indigo-600 text-white rounded-[20px] flex items-center justify-center text-2xl font-black shadow-xl shadow-indigo-200">
                        {selected.name[0]}
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-2">{selected.name}</h4>
                        <p className="text-xs text-slate-500 font-bold flex items-center gap-2 uppercase tracking-widest">
                          <MdLocationOn className="text-indigo-500 text-base" /> {selected.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setCenterTab('chat')} className="px-8 py-4 bg-slate-900 text-white font-black rounded-[24px] text-xs uppercase tracking-widest shadow-xl">
                        Muloqot qilish
                      </button>
                      <a href={`tel:${selected.phone}`} className="w-14 h-14 bg-emerald-500 text-white rounded-[24px] flex items-center justify-center shadow-xl hover:bg-emerald-600 transition-all">
                        <MdPhone className="text-2xl" />
                      </a>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div key="chat-view" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative">
                {selected ? (
                  <>
                    <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between shrink-0 bg-slate-900/60 backdrop-blur-3xl z-10">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center font-black text-white text-2xl border border-white/10 shadow-2xl">{selected.name[0]}</div>
                        <div>
                          <h4 className="text-2xl font-black text-white tracking-tight leading-none mb-2">{selected.name}</h4>
                          <div className="flex items-center gap-3">
                             <div className={`w-2 h-2 rounded-full ${STATUS_COLOR[selected.status]?.dot || 'bg-slate-500'} animate-pulse`} />
                             <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] font-mono">{selected.status}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right mr-4">
                           <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Muloqot</p>
                           <p className="text-[11px] font-bold text-indigo-400">Jonli liniya</p>
                        </div>
                        <a href={`tel:${selected.phone}`} className="w-14 h-14 bg-white/5 text-white/70 rounded-3xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all border border-white/10 group">
                          <MdPhone className="text-2xl group-hover:rotate-12 transition-transform" />
                        </a>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-10 py-12 space-y-8 flex flex-col custom-scrollbar relative">
                      {(messages[selected.id] || []).length === 0 && (
                        <div className="text-center py-20 opacity-10 flex flex-col items-center justify-center h-full">
                          <MdChat className="text-[120px] mb-8 text-white" />
                          <p className="font-black uppercase tracking-[0.4em] text-white text-xl">Xabarlar yo'q</p>
                        </div>
                      )}
                      {(messages[selected.id] || []).map((m: any) => (
                        <div key={m.id} className={`flex ${m.sender === 'operator' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] space-y-2 ${m.sender === 'operator' ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className={`px-8 py-6 rounded-[40px] text-base leading-relaxed ${
                              m.sender === 'operator' 
                                ? 'bg-indigo-600 text-white rounded-br-none shadow-[0_20px_40px_-12px_rgba(79,70,229,0.4)] border border-indigo-500' 
                                : 'bg-white/5 border border-white/10 text-white/90 rounded-bl-none backdrop-blur-xl'
                            }`}>
                              <p className="font-medium tracking-wide">{m.text}</p>
                            </div>
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] px-4 font-mono">{m.time} • {m.sender.toUpperCase()}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-10 bg-slate-900 border-t border-white/5 relative z-10">
                      <form onSubmit={e => { e.preventDefault(); sendMsg(); }} className="flex gap-4 relative">
                        <div className="flex-1 relative group">
                           <input 
                              value={msg} onChange={e => setMsg(e.target.value)}
                              placeholder="Haydovchiga topshiriq yoki xabar yo'llang..." 
                              className="w-full bg-white/5 border border-white/10 rounded-[40px] pl-10 pr-24 py-7 text-base text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all font-bold shadow-2xl"
                           />
                           <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                              <button 
                                type="submit" disabled={!msg.trim()}
                                className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-500 disabled:opacity-20 disabled:scale-90 transition-all shadow-[0_12px_24px_rgba(79,70,229,0.3)] active:scale-95"
                              >
                                <MdSend className="text-2xl" />
                              </button>
                           </div>
                        </div>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent pointer-events-none" />
                    <div className="w-32 h-32 bg-white/5 rounded-[48px] flex items-center justify-center border border-white/5 relative shadow-inner">
                      <div className="absolute inset-0 bg-indigo-500/10 blur-[60px] rounded-full" />
                      <MdChat className="text-6xl text-white/10 relative z-10" />
                    </div>
                    <div className="space-y-4 relative z-10 max-w-sm">
                      <h4 className="text-3xl font-black text-white uppercase tracking-[0.2em]">Muloqot</h4>
                      <p className="text-slate-500 text-base font-bold leading-relaxed">Operatsiyalarni muvofiqlashtirish uchun haydovchilardan biri bilan dialog sahifasini oching.</p>
                      <div className="pt-8">
                         <button onClick={() => setCenterTab('map')} className="px-10 py-4 bg-indigo-600/10 text-indigo-400 font-black rounded-3xl text-xs uppercase tracking-[0.15em] border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all shadow-glow">
                             Xaritadan tanlash
                         </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Column 3: Insights Radar (Right Side) (25% Width) */}
        <div className="col-span-3 flex flex-col gap-8 shrink-0">
          
          <div className="bg-white rounded-[56px] border border-slate-100 p-10 shadow-sm flex-1 flex flex-col relative overflow-hidden">
             
             <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center justify-between mb-10">
                   <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                      <MdTimeline className="text-indigo-600 text-2xl" /> Driver Insights
                   </h3>
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                </div>

                {selected ? (
                  <div className="space-y-10 flex flex-col flex-1">
                     <div className="bg-slate-50 rounded-[40px] p-8 border border-slate-100 flex flex-col items-center text-center relative group overflow-hidden">
                       <div className="w-20 h-20 bg-indigo-600 text-white rounded-[24px] flex items-center justify-center text-3xl font-black mb-6 shadow-2xl shadow-indigo-100 group-hover:scale-110 transition-transform duration-500 relative z-10">
                         {selected.name[0]}
                       </div>
                       <h4 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-2 relative z-10">{selected.name}</h4>
                       <p className="text-xs font-black text-indigo-400 font-mono tracking-[0.2em] relative z-10 uppercase">{selected.phone}</p>
                       
                       <div className="flex gap-2 mt-6 relative z-10">
                         <span className="text-[10px] font-black px-4 py-1.5 bg-white border border-slate-100 rounded-full text-slate-500 shadow-sm uppercase tracking-widest">{selected.car}</span>
                       </div>
                       <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl group-hover:bg-indigo-600/10 transition-colors" />
                     </div>

                     <div className="grid grid-cols-1 gap-6">
                        {[
                          { icon: MdTrendingUp, label: 'Buyurtmalar soni', val: stats.orders, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
                          { icon: MdSpeed, label: "O'rtacha tezlik", val: `${stats.speed} km/h`, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                          { icon: MdQueryBuilder, label: 'Aktivlik vaqti', val: stats.active, color: 'text-amber-600 bg-amber-50 border-amber-100' },
                        ].map((item) => (
                          <div key={item.label} className={`p-6 rounded-[32px] border flex items-center gap-6 group hover:translate-x-1 transition-all ${item.color}`}>
                             <div className="p-3 bg-white/50 rounded-2xl shadow-sm text-2xl"><item.icon /></div>
                             <div>
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 leading-none">{item.label}</p>
                                <p className="text-lg font-black leading-none tracking-tight">{item.val}</p>
                             </div>
                          </div>
                        ))}
                     </div>

                     <div className="mt-auto space-y-4 pt-10">
                        <button onClick={() => setCenterTab('chat')} className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 text-white font-black rounded-[28px] text-[11px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl active:scale-95">
                           <MdChat className="text-lg" /> Xabar yozish
                        </button>
                        <a href={`tel:${selected.phone}`} className="w-full flex items-center justify-center gap-3 py-5 bg-white border border-slate-100 text-slate-800 font-black rounded-[28px] text-[11px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all">
                           <MdPhone className="text-lg" /> Aloqaga chiqish
                        </a>
                     </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6 opacity-20 border-2 border-dashed border-slate-100 rounded-[40px]">
                     <MdInfo className="text-7xl text-slate-300" />
                     <p className="text-[11px] font-black uppercase tracking-[0.3em] font-mono leading-relaxed">Tahliliy ma'lumotlarni ko'rish uchun driverni tanlang</p>
                  </div>
                )}
             </div>
             <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50" />
          </div>
        </div>
      </div>

      {/* Modern Broadcast Portal */}
      <Modal isOpen={showBroadcast} onClose={() => setShowBroadcast(false)} title="Global Bildirishnoma">
        <div className="p-12">
          <div className="flex items-center gap-8 mb-12">
            <div className="w-20 h-20 bg-gradient-to-tr from-slate-900 to-slate-800 rounded-[28px] flex items-center justify-center shadow-2xl rotate-3">
              <MdNotificationsActive className="text-indigo-400 text-4xl" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Global Bildirishnoma</h2>
              <p className="text-slate-400 text-base font-medium mt-1">Hozirda {DRIVERS.length} ta haydovchiga tezkor topshiriq yo'llang</p>
            </div>
          </div>

          <form onSubmit={sendBroadcast} className="space-y-10">
            <div className="relative">
               <textarea 
                  required value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)}
                  placeholder="Xabar matnini kiriting (masalan: barcha uchun umumiy topshiriq)..." 
                  rows={6}
                  className="w-full p-10 bg-slate-50 border border-slate-100 rounded-[48px] outline-none focus:bg-white focus:border-indigo-400 font-bold text-xl text-slate-800 transition-all resize-none shadow-inner placeholder:text-slate-200"
               />
               <MdLocalShipping className="absolute bottom-8 right-10 text-6xl text-slate-100 opacity-50" />
            </div>
            
            <div className="flex gap-6">
              <button type="button" onClick={() => setShowBroadcast(false)} className="flex-1 py-6 text-slate-400 font-black text-[12px] uppercase tracking-[0.2em] hover:text-slate-700 transition-colors">
                Amalni bekor qilish
              </button>
              <button type="submit" className="flex-2 w-[340px] flex items-center justify-center gap-4 py-6 bg-slate-950 text-white font-black rounded-[32px] text-[12px] uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl shadow-slate-200">
                <MdSend className="text-2xl" /> Global Yuborish
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(203, 213, 225, 0.3);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(203, 213, 225, 0.6);
        }
        .shadow-glow {
          box-shadow: 0 0 20px rgba(79, 70, 229, 0.2);
        }
      `}</style>
    </div>
  );
}

export default function OperatorLogisticsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-6">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-16 h-16 border-[6px] border-indigo-600 border-t-transparent rounded-full" 
        />
        <div className="flex flex-col items-center">
           <p className="text-xl font-black text-slate-800 uppercase tracking-[0.2em]">Logistika Markazi</p>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    }>
      <LogisticsContent />
    </Suspense>
  );
}
