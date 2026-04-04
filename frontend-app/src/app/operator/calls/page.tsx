'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  MdCall, MdCallEnd, MdPerson, MdPhone, MdSearch, MdHistory, 
  MdMic, MdMicOff, MdPause, MdPlayArrow, MdDialpad, MdSettings,
  MdBackspace, MdNotificationsActive, MdArrowForward, MdFiberManualRecord
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { telephonyApi, getUser } from '@/lib/api';

// --- TYPES ---
type CallStatus = 'COMPLETED' | 'MISSED' | 'BUSY' | 'IN_PROGRESS' | 'CONNECTED';
interface CallRecord {
  id: number; phone: string; customer: string; status: CallStatus; duration: string; time: string;
}

// --- STYLES ---
const STATUS_STLYES: Record<CallStatus, string> = {
  COMPLETED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  MISSED: 'bg-rose-50 text-rose-600 border-rose-100',
  BUSY: 'bg-amber-50 text-amber-600 border-amber-100',
  IN_PROGRESS: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  CONNECTED: 'bg-indigo-600 text-white border-indigo-500',
};

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
  <div className="flex items-center gap-4 mb-4">
    <div className="w-9 h-9 bg-white/60 border border-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
      <Icon className="text-xl" />
    </div>
    <div className="min-w-0">
      <h2 className="text-[11px] font-black text-slate-800 tracking-tight leading-none uppercase truncate">{title}</h2>
      {subtitle && <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1.5 truncate">{subtitle}</p>}
    </div>
  </div>
);

export default function OperatorCallsPage() {
  const [activeCall, setActiveCall] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [dialNum, setDialNum] = useState('');
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [listFilter, setListFilter] = useState('');
  const [sipConfig, setSipConfig] = useState<any>(null);
  const [sipLoading, setSipLoading] = useState(true);
  
  const longPressTimer = useRef<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = getUser();

  useEffect(() => {
    const fetchSip = async () => {
      if (!user?.companyId) return;
      try {
        setSipLoading(true);
        const config = await telephonyApi.getConfig(user.companyId);
        setSipConfig(config);
      } catch (error) {
        console.error('SIP Fetch Error:', error);
      } finally {
        setSipLoading(false);
      }
    };
    fetchSip();
  }, []);

  const callLog: CallRecord[] = useMemo(() => [
    { id: 1, phone: '+998 90 123 45 67', customer: 'Aliyev Vali', status: 'COMPLETED', duration: '02:45', time: 'Bugun, 10:15' },
    { id: 2, phone: '+998 93 321 65 43', customer: 'Yangi raqam', status: 'MISSED', duration: '00:00', time: 'Bugun, 11:30' },
    { id: 3, phone: '+998 99 888 77 66', customer: 'Rasulova Jamila', status: 'COMPLETED', duration: '05:12', time: 'Bugun, 12:05' },
  ], []);

  // Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9+*#]$/.test(e.key)) {
        if (dialNum.length < 13) setDialNum(p => p + e.key);
      } else if (e.key === 'Backspace') {
        setDialNum(p => p.slice(0, -1));
      } else if (e.key === 'Enter') {
        if (dialNum) startCall(dialNum);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialNum]);

  useEffect(() => {
    const phone = searchParams.get('phone');
    if (phone) setDialNum(phone);
  }, [searchParams]);

  const handleDial = (num: string) => dialNum.length < 13 && setDialNum(p => p + num);

  const startCall = (num: string) => { 
    if (!num) return; 
    setActiveCall({ phone: num, customer: 'Outgoing Call', status: 'CONNECTED' }); 
    setDialNum(''); 
  };
  const endCall = () => { setActiveCall(null); setIsMuted(false); setIsOnHold(false); };

  const matches = useMemo(() => {
    if (!dialNum) return [];
    return callLog.filter(c => c.phone.replace(/\s/g, '').includes(dialNum.replace(/\s/g, ''))).slice(0, 3);
  }, [dialNum, callLog]);

  const handle0PointerDown = () => {
    longPressTimer.current = setTimeout(() => {
      handleDial('+');
      longPressTimer.current = null;
    }, 600);
  };
  const handle0PointerUp = (e: any) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      handleDial('0');
      longPressTimer.current = null;
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-4 lg:gap-6 pb-12 font-sans overflow-hidden">
      
      {/* 1. STATUS HEADER (Compact & Pro) */}
      <div className="flex items-center justify-between px-1 shrink-0">
        <div className="flex items-center gap-4 bg-white/40 backdrop-blur-xl border border-white/40 px-5 py-2.5 rounded-[22px] shadow-sm">
           {sipLoading ? (
             <div className="w-16 h-1.5 bg-slate-200 animate-pulse rounded-full" />
           ) : (
             <div className="flex items-center gap-3">
               <MdFiberManualRecord className={`text-[8px] ${sipConfig?.server ? 'text-emerald-500 animate-pulse' : 'text-rose-500'}`} />
               <h1 className="text-[8px] lg:text-[9px] font-black text-slate-800 uppercase tracking-[0.2em] opacity-70">
                 {sipConfig?.server ? `${sipConfig.provider || 'SIP'} • ${sipConfig.server}` : 'Telefoniya Faol Emas'}
               </h1>
             </div>
           )}
        </div>
        <button 
           onClick={() => setIncomingCall({ phone: '+998 90 777 55 33', customer: 'Ravshan Siddiqov', campaign: 'Loyalty Campaign' })} 
           className="px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-[8px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
        >
           Generate Simulation
        </button>
      </div>

      {/* 2. MAIN EXPERIENCE PANEL */}
      <div className="grid grid-cols-12 gap-4 lg:gap-6 shrink-0 items-stretch">
        
        {/* ACTIVE CALL / IDLE AREA */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col">
           <AnimatePresence mode="wait">
              {activeCall ? (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 min-h-[400px] bg-slate-950 rounded-[32px] lg:rounded-[44px] p-8 lg:p-12 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl border border-white/5">
                   <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-white/5 rounded-[32px] border border-white/5 flex items-center justify-center mb-8 relative">
                         <MdPerson className="text-4xl text-white/10" />
                         <div className="absolute inset-0 rounded-[32px] border border-indigo-500/20 animate-ping" />
                      </div>
                      <h2 className="text-3xl lg:text-4xl font-black text-white tracking-widest font-mono mb-3">{activeCall.phone}</h2>
                      <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] px-5 py-2 bg-white/5 rounded-full">{activeCall.customer}</p>
                      
                      <div className="flex gap-4 lg:gap-6 mt-12 lg:mt-16">
                         <button onClick={() => setIsMuted(!isMuted)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-amber-500 text-white scale-110 shadow-lg' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}><MdMicOff size={24}/></button>
                         <button onClick={endCall} className="w-18 h-18 lg:w-22 lg:h-22 bg-rose-600 text-white rounded-[28px] lg:rounded-[36px] flex items-center justify-center shadow-xl shadow-rose-900/40 hover:scale-105 active:scale-95 transition-all"><MdCallEnd className="text-3xl lg:text-4xl"/></button>
                         <button onClick={() => setIsOnHold(!isOnHold)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isOnHold ? 'bg-indigo-600 text-white scale-110 shadow-lg' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}><MdPlayArrow size={24}/></button>
                      </div>
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-transparent opacity-50" />
                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px]" />
                </motion.div>
              ) : incomingCall ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 min-h-[400px] bg-white border-2 border-indigo-500/40 rounded-[32px] lg:rounded-[44px] p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                   <div className="w-16 h-16 bg-indigo-600 rounded-[28px] flex items-center justify-center text-white text-3xl animate-bounce mb-6 lg:mb-8">
                      <MdNotificationsActive />
                   </div>
                   <h3 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight mb-4">{incomingCall.phone}</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-10">{incomingCall.customer} &bull; {incomingCall.campaign}</p>
                   <div className="flex gap-4 w-full max-w-sm">
                      <button onClick={() => setIncomingCall(null)} className="flex-1 py-4 bg-slate-50 text-slate-400 font-black rounded-2xl text-[9px] uppercase tracking-widest border border-slate-100 hover:bg-rose-50 hover:text-rose-600 transition-all">Ignore</button>
                      <button onClick={() => { setActiveCall({...incomingCall}); setIncomingCall(null); }} className="flex-1 py-4 bg-emerald-500 text-white font-black rounded-2xl text-[9px] uppercase tracking-widest shadow-xl shadow-emerald-100">Answer</button>
                   </div>
                   <div className="absolute inset-x-0 bottom-0 h-1.5 bg-indigo-500/40" />
                </motion.div>
              ) : (
                <div className="flex-1 min-h-[400px] bg-slate-50/40 backdrop-blur-3xl border border-white/50 rounded-[32px] lg:rounded-[44px] p-12 flex flex-col items-center justify-center text-center shadow-inner relative group">
                   <div className="w-16 h-16 bg-white border border-white rounded-[24px] flex items-center justify-center mb-8 rotate-12 opacity-30 shadow-sm group-hover:rotate-0 transition-transform duration-500">
                      <MdCall className="text-3xl text-slate-300" />
                   </div>
                   <h3 className="text-md font-black text-slate-800 tracking-tight leading-none opacity-40 uppercase tracking-[0.1em]">VoIP Terminal Idle</h3>
                   <p className="text-[8px] font-bold text-slate-300 mt-5 uppercase tracking-[0.25em] leading-relaxed max-w-[200px] opacity-60">Ready for incoming interactions and manual dispatch.</p>
                </div>
              )}
           </AnimatePresence>
        </div>

        {/* COMPACT DIALER (Responsive Fixed-Width Style) */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-4 min-h-[400px] bg-white/70 backdrop-blur-2xl rounded-[32px] lg:rounded-[44px] border border-white/80 shadow-2xl p-6 lg:p-8 flex flex-col relative overflow-hidden">
           <SectionHeader icon={MdDialpad} title="Dispatch Pad" subtitle="Global Relay Control" />

           <div className="relative mb-4 lg:mb-6">
              <div className="bg-slate-50/80 border border-slate-100 rounded-[22px] h-14 flex items-center px-5 relative overflow-hidden focus-within:bg-white focus-within:border-indigo-200 transition-all shadow-inner">
                 <p className="flex-1 text-xl font-black text-slate-800 tracking-widest font-mono truncate leading-none">{dialNum || '...'}</p>
                 {dialNum && (
                    <button onClick={() => setDialNum(p => p.slice(0, -1))} className="w-8 h-8 hover:bg-rose-50 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all font-black">
                       <MdBackspace size={16} />
                    </button>
                 )}
                 <div className="absolute left-0 top-0 w-1 h-full bg-indigo-600 rounded-r-full" />
              </div>

              <AnimatePresence>
                 {matches.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute z-50 left-0 right-0 top-[60px] bg-white border border-slate-100 rounded-[24px] shadow-2xl p-2.5 space-y-1 backdrop-blur-3xl">
                       {matches.map(m => (
                          <div key={m.id} onClick={() => startCall(m.phone)} className="p-3 bg-slate-50 hover:bg-indigo-600 rounded-xl flex items-center justify-between cursor-pointer group transition-all">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm"><MdPerson size={14}/></div>
                                <div>
                                   <p className="text-[10px] font-black text-slate-800 group-hover:text-white leading-none mb-1">{m.phone}</p>
                                   <p className="text-[7px] font-black text-slate-400 group-hover:text-white/60 uppercase tracking-widest">{m.customer}</p>
                                </div>
                             </div>
                             <MdArrowForward size={14} className="text-slate-200 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all"/>
                          </div>
                       ))}
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>

           {/* Dialer Scaling container */}
           <div className="flex-1 flex flex-col justify-center items-center">
              <div className="grid grid-cols-3 gap-3 w-full max-w-[320px] mx-auto">
                 {['1','2','3','4','5','6','7','8','9','*', '0', '#'].map(num => {
                   const is0 = num === '0';
                   return (
                     <button 
                       key={num} 
                       onPointerDown={is0 ? handle0PointerDown : undefined}
                       onPointerUp={is0 ? handle0PointerUp : undefined}
                       onClick={is0 ? undefined : () => handleDial(num)}
                       className="aspect-[1.1/1] bg-white border border-slate-50 rounded-[22px] flex flex-col items-center justify-center text-xl font-black text-slate-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all active:scale-90 shadow-sm relative group"
                     >
                       <span className="text-lg lg:text-xl">{num}</span>
                       {is0 && <span className="absolute bottom-2 text-[8px] font-black text-slate-300 group-hover:text-white/50">+</span>}
                     </button>
                   )
                 })}
              </div>
           </div>

           <button 
             onClick={() => startCall(dialNum)} disabled={!dialNum}
             className="w-full mt-6 py-4.5 bg-indigo-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-100/40 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-20 flex-shrink-0"
           >
             <MdCall size={20} /> Initiate Dispatch
           </button>
        </div>
      </div>

      {/* 3. CALL LOGS AREA (With Visual Separation) */}
      <section className="flex-1 min-h-0 bg-slate-50/50 backdrop-blur-2xl border border-white/50 rounded-[32px] lg:rounded-[44px] shadow-sm flex flex-col overflow-hidden">
         <div className="px-6 lg:px-10 py-5 lg:py-6 border-b border-white/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <SectionHeader icon={MdHistory} title="Muloqotlar Tarixi" subtitle="Live Call Journal" />
            <div className="relative w-full sm:w-64 group">
               <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xl group-focus-within:text-indigo-600 transition-colors" />
               <input 
                  value={listFilter} onChange={e => setListFilter(e.target.value)}
                  placeholder="Filter by phone..." 
                  className="w-full pl-11 py-3 bg-white/60 border border-white rounded-[18px] text-[10px] font-bold text-slate-600 outline-none focus:bg-white focus:border-indigo-100 transition-all shadow-inner placeholder:text-slate-300" 
               />
            </div>
         </div>

         <div className="flex-1 overflow-y-auto px-1 custom-scrollbar">
            <table className="w-full text-left">
               <thead className="sticky top-0 bg-white/70 backdrop-blur-xl z-10 border-b border-white">
                  <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                     <th className="px-8 lg:px-10 py-5 w-1/3">Interaction Source</th>
                     <th className="px-8 lg:px-10 py-5 text-center">Outcome</th>
                     <th className="px-8 lg:px-10 py-5 text-right">Time Analytics</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/40">
                  {callLog.filter(c => c.phone.includes(listFilter)).map((call) => (
                     <tr key={call.id} className="hover:bg-white/40 transition-all cursor-pointer group">
                        <td className="px-8 lg:px-10 py-5 lg:py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-9 h-9 bg-white border border-white rounded-xl flex items-center justify-center font-black text-[11px] text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all transform group-hover:scale-110 shadow-sm">{call.customer[0]}</div>
                              <div className="min-w-0">
                                 <p className="text-[13px] font-black text-slate-800 leading-none mb-1.5">{call.phone}</p>
                                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none truncate">{call.customer}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 lg:px-10 py-5 lg:py-6 text-center">
                           <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${STATUS_STLYES[call.status] || 'bg-slate-50 text-slate-400'}`}>
                              {call.status === 'COMPLETED' ? 'Interaction OK' : 'Dispatch Missed'}
                           </span>
                        </td>
                        <td className="px-8 lg:px-10 py-5 lg:py-6 text-right">
                           <div className="flex flex-col items-end">
                              <p className="text-[12px] font-black text-slate-800 font-mono tracking-tight leading-none mb-1">{call.duration}</p>
                              <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">{call.time}</p>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </section>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .backdrop-blur-3xl { backdrop-filter: blur(80px); }
        .backdrop-blur-4xl { backdrop-filter: blur(120px); }
      `}</style>
    </div>
  );
}
