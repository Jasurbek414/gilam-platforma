'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  MdCall, MdCallEnd, MdPerson, MdPhone, MdSearch, MdHistory, 
  MdMic, MdMicOff, MdPause, MdPlayArrow, MdDialpad, MdSettings,
  MdBackspace, MdNotificationsActive, MdArrowForward, MdAdd
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';

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
  <div className="flex items-center gap-4 mb-5">
    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
      <Icon className="text-xl" />
    </div>
    <div>
      <h2 className="text-sm font-black text-slate-800 tracking-tight leading-none uppercase">{title}</h2>
      {subtitle && <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-1.5">{subtitle}</p>}
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
  
  const router = useRouter();
  const searchParams = useSearchParams();

  const callLog: CallRecord[] = useMemo(() => [
    { id: 1, phone: '+998 90 123 45 67', customer: 'Aliyev Vali', status: 'COMPLETED', duration: '02:45', time: 'Bugun, 10:15' },
    { id: 2, phone: '+998 93 321 65 43', customer: 'Yangi raqam', status: 'MISSED', duration: '00:00', time: 'Bugun, 11:30' },
    { id: 3, phone: '+998 99 888 77 66', customer: 'Rasulova Jamila', status: 'COMPLETED', duration: '05:12', time: 'Bugun, 12:05' },
  ], []);

  // Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Numbers and symbols
      if (/^[0-9+*#]$/.test(e.key)) {
        if (dialNum.length < 13) setDialNum(p => p + e.key);
      } else if (e.key === 'Backspace') {
        setDialNum(p => p.slice(0, -1));
      } else if (e.key === 'Enter') {
        if (dialNum) startCall();
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
  
  const startCall = (num: string = dialNum) => { 
    if (!num) return; 
    setActiveCall({ phone: num, customer: 'Outgoing', status: 'CONNECTED' }); 
    setDialNum(''); 
  };
  const endCall = () => { setActiveCall(null); setIsMuted(false); setIsOnHold(false); };

  // Matching History
  const matches = useMemo(() => {
    if (!dialNum) return [];
    return callLog.filter(c => c.phone.replace(/\s/g, '').includes(dialNum.replace(/\s/g, ''))).slice(0, 3);
  }, [dialNum, callLog]);

  return (
    <div className="relative min-h-full w-full flex flex-col gap-10 pb-16 font-sans">
      
      {/* 1. SUB-HEADER */}
      <div className="flex items-center justify-between px-2 shrink-0">
        <div className="flex items-center gap-4">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-sm" />
           <h1 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.25em]">Qo'ng'iroqlar Markazi &mdash; Online</h1>
        </div>
        <button onClick={() => setIncomingCall({ phone: '+998 90 777 55 33', customer: 'New Trigger', campaign: 'Test' })} className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] hover:text-indigo-500 transition-colors">Generate Event</button>
      </div>

      {/* 2. TOP GRID */}
      <div className="grid grid-cols-12 gap-8 shrink-0">
        
        {/* PANEL: CALL EXPERIENCE */}
        <div className="col-span-12 lg:col-span-7 h-[420px]">
           <AnimatePresence mode="wait">
             {activeCall ? (
               <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full bg-slate-950 rounded-[44px] p-10 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                  <div className="relative z-10 flex flex-col items-center">
                     <div className="w-24 h-24 bg-white/5 rounded-[40px] border border-white/5 flex items-center justify-center mb-8 relative">
                        <MdPerson className="text-5xl text-white/10" />
                        <div className="absolute inset-0 rounded-[40px] border border-indigo-500/20 animate-ping" />
                     </div>
                     <h2 className="text-4xl font-black text-white tracking-widest font-mono mb-4">{activeCall.phone}</h2>
                     <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] px-5 py-2 bg-white/5 rounded-full">{activeCall.customer}</p>
                     
                     <div className="flex gap-6 mt-14">
                        <button onClick={() => setIsMuted(!isMuted)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-amber-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}><MdMicOff size={24}/></button>
                        <button onClick={endCall} className="w-20 h-20 bg-rose-600 text-white rounded-[28px] flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all outline outline-offset-4 outline-rose-500/5"><MdCallEnd className="text-4xl"/></button>
                        <button onClick={() => setIsOnHold(!isOnHold)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isOnHold ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}><MdPlayArrow size={24}/></button>
                     </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent blur-3xl opacity-50" />
               </motion.div>
             ) : incomingCall ? (
               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full bg-white border-2 border-indigo-500 rounded-[44px] p-12 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                  <div className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white text-4xl animate-bounce mb-8 shadow-xl shadow-indigo-600/20"><MdNotificationsActive /></div>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-4">{incomingCall.phone}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose mb-12">{incomingCall.customer} &bull; {incomingCall.campaign}</p>
                  <div className="flex gap-4 w-full max-w-sm">
                     <button onClick={() => setIncomingCall(null)} className="flex-1 py-5 bg-slate-50 text-slate-400 font-black rounded-2xl text-[9px] uppercase tracking-widest border border-slate-100 hover:bg-rose-50 hover:text-rose-600 transition-all">Ignore</button>
                     <button onClick={() => { setActiveCall({...incomingCall}); setIncomingCall(null); }} className="flex-1 py-5 bg-emerald-500 text-white font-black rounded-2xl text-[9px] uppercase tracking-widest shadow-xl animate-pulse">Answer</button>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-2 bg-indigo-500" />
               </motion.div>
             ) : (
               <div className="h-full bg-white border border-indigo-50/50 rounded-[44px] p-12 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                  <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mb-8 rotate-12 opacity-50"><MdCall className="text-5xl text-slate-200" /></div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Kutilmoqda...</h3>
                  <p className="text-[9px] font-black text-slate-400 mt-4 uppercase tracking-[0.2em] leading-relaxed max-w-[200px]">Tizim on-line rejimida yangi murojaatlarni kutilmoqda.</p>
               </div>
             )}
           </AnimatePresence>
        </div>

        {/* DIALER SECTION */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-[44px] border border-slate-100 shadow-sm p-8 flex flex-col relative overflow-visible">
           <SectionHeader icon={MdDialpad} title="Smart Dialer" subtitle="Keyboard Support" />

           <div className="relative group">
              <div className="bg-slate-50 border border-slate-100 rounded-[24px] h-16 mb-4 flex items-center px-6 relative overflow-hidden transition-colors focus-within:bg-white focus-within:border-indigo-100 shadow-inner">
                 <p className="flex-1 text-2xl font-black text-slate-800 tracking-widest font-mono truncate leading-none">{dialNum || '...'}</p>
                 {dialNum && (
                    <button onClick={() => setDialNum(p => p.slice(0, -1))} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all shadow-sm">
                       <MdBackspace size={18} />
                    </button>
                 )}
                 <div className="absolute left-0 top-0 w-1 h-full bg-indigo-600 rounded-r-full" />
              </div>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                 {matches.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-20 left-0 right-0 top-[72px] bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 space-y-1">
                       {matches.map(m => (
                          <div key={m.id} onClick={() => startCall(m.phone)} className="p-3 bg-slate-50 hover:bg-indigo-50 rounded-xl flex items-center justify-between cursor-pointer group transition-colors">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-600" ><MdPerson/></div>
                                <div>
                                   <p className="text-[12px] font-black text-slate-800 leading-none mb-1">{m.phone}</p>
                                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{m.customer}</p>
                                </div>
                             </div>
                             <MdPhone className="text-slate-200 group-hover:text-indigo-500"/>
                          </div>
                       ))}
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>

           <div className="grid grid-cols-3 gap-3 flex-1 mt-2">
              {['1','2','3','4','5','6','7','8','9','*','0','#'].map(num => (
                <button key={num} onClick={() => handleDial(num)} className="w-full h-full bg-white border border-slate-50 rounded-2xl flex items-center justify-center text-xl font-black text-slate-700 hover:bg-slate-50 hover:border-indigo-100 hover:text-indigo-600 transition-all active:scale-95 shadow-sm">{num}</button>
              ))}
              <button onClick={() => handleDial('+')} className="col-span-3 py-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-xl font-black text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-95 shadow-sm"><MdAdd className="text-2xl"/></button>
           </div>

           <button 
            onClick={() => startCall()} disabled={!dialNum}
            className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl mt-6 text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-20"
           >
             <MdCall size={20} /> Call Now
           </button>
        </div>
      </div>

      {/* 3. HISTORY TABLE */}
      <section className="flex-1 bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col min-h-0">
         <div className="px-10 py-7 border-b border-slate-50 flex items-center justify-between bg-white rounded-t-[40px]">
            <SectionHeader icon={MdHistory} title="Muloqotlar Tarixi" subtitle="Call History" />
            <div className="relative w-64 group">
               <MdSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-200 text-2xl group-within:text-indigo-600 transition-colors" />
               <input 
                  value={listFilter} onChange={e => setListFilter(e.target.value)}
                  placeholder="Filter logs..." 
                  className="w-full pl-14 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-[11px] font-bold text-slate-600 outline-none focus:bg-white focus:border-indigo-200 transition-all shadow-inner" 
               />
            </div>
         </div>

         <div className="flex-1 overflow-y-auto px-1 custom-scrollbar">
            <table className="w-full text-left">
               <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-10 border-b border-slate-50">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <th className="px-10 py-6 w-1/3">Client details</th>
                     <th className="px-10 py-6 text-center">Status</th>
                     <th className="px-10 py-6 text-right">Time Analysis</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {callLog.filter(c => c.phone.includes(listFilter)).map((call) => (
                     <tr key={call.id} className="hover:bg-slate-50/50 transition-all cursor-pointer group">
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-6">{call.customer[0]}</div>
                              <div>
                                 <p className="text-[14px] font-black text-slate-800 leading-none mb-1.5">{call.phone}</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{call.customer}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-6 text-center">
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${STATUS_STLYES[call.status] || 'bg-slate-50 text-slate-400'}`}>
                              {call.status === 'COMPLETED' ? 'OK' : 'MISSED'}
                           </span>
                        </td>
                        <td className="px-10 py-6 text-right flex flex-col justify-center items-end h-full">
                           <p className="text-[12px] font-black text-slate-800 font-mono">{call.duration}</p>
                           <p className="text-[9px] font-bold text-slate-300 mt-1 uppercase tracking-widest">{call.time}</p>
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
      `}</style>
    </div>
  );
}
