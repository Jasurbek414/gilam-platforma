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
  daily:   [
    { label: 'Kunlik buyurtmalar', val: '15 ta', icon: MdTrendingUp },
    { label: 'Yoqilg\'i sarfi', val: '6.2 L', icon: MdDirectionsCar },
    { label: 'O\'rtacha tezlik', val: '42 km/h', icon: MdSpeed },
    { label: 'Aktiv vaqt', val: '6s 12d', icon: MdQueryBuilder },
  ],
  weekly:  [
    { label: 'Haftalik buyurtmalar', val: '84 ta', icon: MdTimeline },
    { label: 'Yoqilg\'i sarfi', val: '42 L', icon: MdDirectionsCar },
    { label: 'O\'rtacha tezlik', val: '38 km/h', icon: MdSpeed },
    { label: 'Aktiv vaqt', val: '42s', icon: MdQueryBuilder },
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
    <div className="flex flex-col space-y-24 pb-20">
      
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

      {/* Workspace Grid - NEW Top-Bottom Distribution */}
      <div className="grid grid-cols-12 gap-10">
        
        {/* TOP ROW: Column 1: Clean Driver List (Span 8) */}
        <div className="col-span-8 bg-white rounded-[56px] border border-slate-100 shadow-sm flex flex-col min-w-0 min-h-[500px]">
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

          <div className="p-8 grid grid-cols-2 gap-6">
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
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 pt-6 border-t border-slate-50 flex items-center gap-3">
                      <a href={`tel:${d.phone}`} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 font-black rounded-2xl text-[10px] hover:bg-emerald-100 transition-all uppercase tracking-widest">
                        <MdPhone /> Qo'ng'iroq
                      </a>
                      <button onClick={() => setCenterTab('chat')} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 font-black rounded-2xl text-[10px] hover:bg-indigo-100 transition-all uppercase tracking-widest">
                        <MdChat /> Tanlash
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/20 mt-auto">
             <div className="flex gap-8">
                <div className="text-center">
                   <p className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest">Jami jamoa</p>
                   <p className="text-lg font-black text-slate-700 leading-none">{DRIVERS.length}</p>
                </div>
                <div className="w-px h-6 bg-slate-200 mt-2" />
                <div className="text-center">
                   <p className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest">Aktiv</p>
                   <p className="text-lg font-black text-indigo-500 leading-none">{DRIVERS.filter(d => d.status !== "BO'SH").length}</p>
                </div>
                <div className="w-px h-6 bg-slate-200 mt-2" />
                <div className="text-center">
                   <p className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest">Bo'sh</p>
                   <p className="text-lg font-black text-emerald-500 leading-none">{DRIVERS.filter(d => d.status === "BO'SH").length}</p>
                </div>
             </div>
          </div>
        </div>

        {/* TOP ROW: Column 3: Insights Radar (Span 4) */}
        <div className="col-span-4 flex flex-col gap-8">
          <div className="bg-white rounded-[56px] border border-slate-100 p-10 shadow-sm flex-1 flex flex-col relative overflow-hidden min-h-[500px]">
             <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-10">
                   <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
                      <MdAnalytics className="text-indigo-600 text-xl" /> Haydovchi Tahlili
                   </h3>
                   <div className="flex p-1 bg-slate-50 rounded-xl">
                      {['daily', 'weekly'].map(p => (
                        <button 
                          key={p} onClick={() => setStatPeriod(p as any)}
                          className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                            statPeriod === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
                          }`}
                        >
                          {p === 'daily' ? 'Kunlik' : 'Haftalik'}
                        </button>
                      ))}
                   </div>
                </div>

                <AnimatePresence mode="wait">
                  {selected ? (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10 flex-1 flex flex-col">
                       <div className="grid grid-cols-2 gap-4">
                          {stats.map((s: any, i: number) => (
                            <div key={i} className="p-6 bg-slate-50 rounded-[32px] border border-slate-50 group hover:border-indigo-100 transition-all">
                               <div className="flex items-center justify-between mb-4">
                                  <s.icon className="text-slate-300 text-xl group-hover:text-indigo-500 transition-colors" />
                                  <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Jonli</span>
                               </div>
                               <p className="text-2xl font-black text-slate-800">{s.val}</p>
                               <p className="text-[10px] font-bold text-slate-400 mt-1">{s.label}</p>
                            </div>
                          ))}
                       </div>
                       
                       <div className="flex-1 bg-indigo-600 rounded-[40px] p-8 text-white relative overflow-hidden group">
                          <div className="relative z-10">
                             <h4 className="text-lg font-black tracking-tight mb-2">{selected.name}</h4>
                             <p className="text-indigo-100/60 text-xs font-medium mb-8 leading-relaxed">Ushbu haydovchining ballari va reytingi doimiy monitoring qilinadi.</p>
                             <div className="flex items-center gap-4">
                                <div className="px-5 py-3 bg-white/10 rounded-2xl border border-white/5 backdrop-blur-xl">
                                   <p className="text-[8px] font-black text-indigo-200 uppercase mb-1">Reyting</p>
                                   <div className="flex items-center gap-2">
                                      <span className="text-xl font-black">4.9</span>
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                   </div>
                                </div>
                             </div>
                          </div>
                          <MdGroup className="absolute -bottom-10 -right-10 text-[200px] text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
                       </div>
                    </motion.div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-30">
                       <MdFingerprint className="text-[100px] text-slate-200 mb-8" />
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-loose max-w-[200px]">Tahliliy ma'lumotlarni ko'rish uchun haydovchini tanlang</p>
                    </div>
                  )}
                </AnimatePresence>
             </div>
          </div>
        </div>

        {/* BOTTOM ROW: Column 2: Spacious Map (Span 12) - IMMERSIVE WIDTH */}
        <div className="col-span-12 bg-white rounded-[64px] overflow-hidden flex flex-col relative shadow-2xl shadow-indigo-900/10 border border-slate-100 h-[600px] transition-all hover:shadow-indigo-900/20">
          
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 w-full h-full relative">
                <DriverMap selected={selected} drivers={DRIVERS} onSelect={handleSelectDriver} />
                <AnimatePresence>
                  {selected && (
                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4">
                      <div className="bg-white/80 backdrop-blur-3xl p-6 rounded-[32px] border border-white shadow-2xl flex items-center justify-between">
                         <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-2xl shadow-xl">
                               {selected.profileImg}
                            </div>
                            <div>
                               <h4 className="text-lg font-black text-slate-800">{selected.name}</h4>
                               <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{selected.car}</p>
                            </div>
                         </div>
                         <a href={`tel:${selected.phone}`} className="flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
                            <MdPhone className="text-lg" /> Aloqaga chiqish
                         </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col bg-slate-50/50 p-10 min-h-[500px]">
                {selected ? (
                   <div className="flex flex-col h-full bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden">
                      <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">{selected.name[0]}</div>
                            <h4 className="font-black text-slate-800 tracking-tight">{selected.name} bilan muloqot</h4>
                         </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar">
                         {(messages[selected.id] || []).map((m: any) => (
                           <div key={m.id} className={`flex ${m.sender === 'operator' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] p-6 rounded-[28px] ${m.sender === 'operator' ? 'bg-slate-900 text-white rounded-br-sm shadow-xl' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
                                 <p className="text-sm font-medium leading-relaxed">{m.text}</p>
                                 <p className={`text-[9px] font-black mt-2 uppercase tracking-widest opacity-50 ${m.sender === 'operator' ? 'text-indigo-200' : 'text-slate-400'}`}>{m.time}</p>
                              </div>
                           </div>
                         ))}
                      </div>
                      <div className="p-8 border-t border-slate-50 bg-slate-50/20">
                         <div className="relative">
                            <input 
                              value={msg} onChange={e => setMsg(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && sendMsg()}
                              placeholder="Xabar yozing..." 
                              className="w-full pl-8 pr-20 py-5 bg-white border border-slate-100 rounded-[28px] outline-none focus:border-indigo-400 font-bold transition-all shadow-sm"
                            />
                            <button onClick={sendMsg} className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-indigo-500/40 transition-all active:scale-90">
                               <MdSend className="text-xl" />
                            </button>
                         </div>
                      </div>
                   </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6 opacity-20 border-2 border-dashed border-slate-100 rounded-[40px]">
                     <MdInfo className="text-7xl text-slate-300" />
                     <p className="text-[11px] font-black uppercase tracking-[0.3em] font-mono leading-relaxed">Muloqot qilish uchun haydovchini tanlang</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
