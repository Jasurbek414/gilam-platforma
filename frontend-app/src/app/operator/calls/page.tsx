'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  MdCall, MdCallEnd, MdPerson, MdPhone, MdSearch, MdHistory, 
  MdMic, MdMicOff, MdPause, MdPlayArrow, MdDialpad, MdSettings,
  MdArrowForward, MdCheckCircle, MdTimer, MdBackspace, MdNotificationsActive
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';

// --- TYPES ---
type CallStatus = 'COMPLETED' | 'MISSED' | 'BUSY' | 'IN_PROGRESS' | 'CONNECTED';
interface CallRecord {
  id: number;
  phone: string;
  customer: string;
  status: CallStatus;
  duration: string;
  time: string;
}

// --- CONSTANTS & HELPERS ---
const STATUS_STLYES: Record<CallStatus, string> = {
  COMPLETED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  MISSED: 'bg-rose-50 text-rose-600 border-rose-100',
  BUSY: 'bg-amber-50 text-amber-600 border-amber-100',
  IN_PROGRESS: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  CONNECTED: 'bg-indigo-600 text-white border-indigo-500',
};

// --- SUB-COMPONENTS ---

const StatusBadge = ({ status }: { status: CallStatus }) => (
  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${STATUS_STLYES[status] || 'bg-slate-50 text-slate-400'}`}>
    {status === 'COMPLETED' ? 'Muvaffaqiyatli' : status === 'MISSED' ? 'Javobsiz' : status}
  </span>
);

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
  <div className="flex items-center gap-4 mb-6">
    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 rotate-12 group-hover:rotate-0 transition-transform">
      <Icon className="text-xl" />
    </div>
    <div>
      <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none uppercase">{title}</h2>
      {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{subtitle}</p>}
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

  // Simulated Logs
  const callLog: CallRecord[] = useMemo(() => [
    { id: 1, phone: '+998 90 123 45 67', customer: 'Aliyev Vali', status: 'COMPLETED', duration: '02:45', time: 'Bugun, 10:15' },
    { id: 2, phone: '+998 93 321 65 43', customer: 'Yangi raqam', status: 'MISSED', duration: '00:00', time: 'Bugun, 11:30' },
    { id: 3, phone: '+998 99 888 77 66', customer: 'Rasulova Jamila', status: 'COMPLETED', duration: '05:12', time: 'Kecha, 12:05' },
    { id: 4, phone: '+998 97 444 55 66', customer: 'Karimov Anvar', status: 'COMPLETED', duration: '01:20', time: 'Kecha, 17:45' },
  ], []);

  useEffect(() => {
    const phone = searchParams.get('phone');
    if (phone) setDialNum(phone);
  }, [searchParams]);

  const handleDial = (num: string) => dialNum.length < 13 && setDialNum(p => p + num);
  const startCall = () => {
    if (!dialNum) return;
    setActiveCall({ phone: dialNum, customer: 'Chiquvchi', status: 'CONNECTED' });
    setDialNum('');
  };
  const endCall = () => { setActiveCall(null); setIsMuted(false); setIsOnHold(false); };

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-8 pb-12 font-sans overflow-y-auto overflow-x-hidden custom-scrollbar">
      
      {/* 1. TOP BAR: Unified Status & Breadcrumbs */}
      <header className="shrink-0 flex items-center justify-between bg-white/80 backdrop-blur-xl p-6 rounded-[36px] border border-indigo-50/50 shadow-sm transition-all duration-500">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-indigo-800 rounded-[22px] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30">
            <MdCall className="text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Qo'ng'iroqlar Markazi</h1>
            <div className="flex items-center gap-2 mt-1">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Telefoniya Faol • Zadarma</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <button 
              onClick={() => setIncomingCall({ phone: '+998 90 123 45 67', customer: 'Simulated Incoming', campaign: 'Test' })}
              className="px-6 py-3 bg-slate-50 text-slate-500 font-black rounded-2xl text-[9px] uppercase tracking-[0.2em] border border-slate-100 hover:bg-white hover:shadow-lg transition-all"
           >
              Simulate Trigger
           </button>
           <div className="w-px h-10 bg-slate-100" />
           <div className="flex items-center gap-4 bg-slate-50/50 p-2 pr-6 rounded-[22px] border border-slate-50">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
                 <MdPerson className="text-lg" />
              </div>
              <div className="text-left">
                 <p className="text-[9px] font-black text-slate-400 uppercase leading-none tracking-widest">Active Operator</p>
                 <p className="text-xs font-black text-slate-800 leading-none mt-1">Zilola Operatorova</p>
              </div>
           </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE: Grid of 12 */}
      <div className="grid grid-cols-12 gap-6 h-[460px] shrink-0">
        
        {/* LEFT: Experience Panel (Waiting/Active) */}
        <section className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {activeCall ? (
              <motion.div 
                key="active" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                className="flex-1 bg-slate-950 rounded-[56px] p-12 relative overflow-hidden flex flex-col items-center justify-center text-center shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]"
              >
                <div className="relative z-10 flex flex-col items-center">
                   <motion.div animate={{ scale: [1, 1.08, 1], rotate: [0, 2, -2, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="w-28 h-28 rounded-[40px] bg-white/5 border border-white/10 flex items-center justify-center mb-10 relative">
                      <MdPerson className="text-5xl text-white/10" />
                      <div className="absolute inset-0 rounded-[40px] border-4 border-indigo-500/20 animate-ping" />
                   </motion.div>
                   <h2 className="text-4xl font-black text-white tracking-[0.1em] mb-4 font-mono">{activeCall.phone}</h2>
                   <div className="px-6 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                      <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] leading-none">{activeCall.customer}</p>
                   </div>
                   
                   <div className="flex items-center gap-8 mt-12">
                      <button onClick={() => setIsMuted(!isMuted)} className={`w-18 h-18 rounded-[28px] border-2 flex items-center justify-center transition-all ${isMuted ? 'bg-amber-500 border-amber-400 text-white shadow-2xl' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}>
                         {isMuted ? <MdMicOff size={28} /> : <MdMic size={28} />}
                      </button>
                      <button onClick={endCall} className="w-24 h-24 bg-rose-600 text-white rounded-[36px] flex items-center justify-center shadow-[0_20px_50px_rgba(225,29,72,0.4)] hover:scale-110 active:scale-90 transition-all border-b-4 border-rose-800">
                         <MdCallEnd size={40} />
                      </button>
                      <button onClick={() => setIsOnHold(!isOnHold)} className={`w-18 h-18 rounded-[28px] border-2 flex items-center justify-center transition-all ${isOnHold ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}>
                         {isOnHold ? <MdPlayArrow size={28} /> : <MdPause size={28} />}
                      </button>
                   </div>
                </div>
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-indigo-500/10 to-transparent blur-[120px] -mr-[150px] -mt-[150px]" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-rose-500/10 to-transparent blur-[100px] -ml-[100px] -mb-[100px]" />
              </motion.div>
            ) : incomingCall ? (
              <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex-1 bg-white border-2 border-indigo-600 rounded-[56px] p-12 flex items-center justify-between shadow-2xl relative overflow-hidden group">
                <div className="relative z-10 flex items-center gap-10">
                   <div className="w-24 h-24 bg-indigo-600 rounded-[36px] flex items-center justify-center text-white text-4xl animate-bounce shadow-2xl shadow-indigo-600/30">
                      <MdNotificationsActive />
                   </div>
                   <div>
                      <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-3">{incomingCall.phone}</h3>
                      <p className="text-sm font-bold text-slate-400 flex items-center gap-3 uppercase tracking-widest">{incomingCall.customer} <span className="w-1.5 h-1.5 bg-indigo-100 rounded-full" /> {incomingCall.campaign}</p>
                   </div>
                </div>
                <div className="flex gap-4 relative z-10">
                   <button onClick={() => setIncomingCall(null)} className="px-10 py-5 bg-slate-50 text-slate-400 font-black rounded-3xl hover:bg-rose-50 hover:text-rose-600 transition-all text-xs uppercase tracking-widest border border-slate-100">Ignore</button>
                   <button onClick={() => { setActiveCall({...incomingCall, status: 'CONNECTED'}); setIncomingCall(null); }} className="px-10 py-5 bg-emerald-500 text-white font-black rounded-3xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all text-xs uppercase tracking-widest animate-pulse">Answer Now</button>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-2 bg-indigo-600/10" />
              </motion.div>
            ) : (
              <div className="flex-1 bg-white border border-indigo-50/50 rounded-[56px] p-12 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                   <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mb-8 mx-auto rotate-12">
                      <MdCall className="text-6xl text-slate-100" />
                   </div>
                   <h3 className="text-2xl font-black text-slate-800 tracking-tight">Kutilmoqda...</h3>
                   <p className="text-xs text-slate-400 mt-3 font-medium max-w-[280px] leading-relaxed uppercase tracking-widest">Hozirda faol qo'ng'iroqlar yo'q. Tizim on-line rejimida.</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-50/50 to-transparent pointer-events-none" />
              </div>
            )}
          </AnimatePresence>
        </section>

        {/* RIGHT: Dialpad Panel */}
        <section className="col-span-12 lg:col-span-5 bg-white rounded-[56px] border border-indigo-50/50 shadow-sm p-10 flex flex-col group/dial">
           <SectionHeader icon={MdDialpad} title="Raqam Terish" subtitle="Tezkor Aloqa Paneli" />

           <div className="flex-1 flex flex-col">
              {/* Dial Display */}
              <div className="bg-slate-50/80 border border-slate-100 rounded-[32px] p-6 mb-8 flex items-center gap-6 relative overflow-hidden decoration-indigo-500">
                 <p className="flex-1 text-3xl font-black text-slate-800 tracking-[0.2em] font-mono pl-4 leading-none">{dialNum || '...'}</p>
                 {dialNum && (
                    <button onClick={() => setDialNum(p => p.slice(0, -1))} className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm">
                       <MdBackspace size={24} />
                    </button>
                 )}
                 <div className="absolute left-0 top-0 w-1.5 h-full bg-indigo-600" />
              </div>

              {/* Pad Buttons */}
              <div className="grid grid-cols-3 gap-4 flex-1">
                 {['1','2','3','4','5','6','7','8','9','*','0','#'].map(num => (
                   <button 
                    key={num} onClick={() => handleDial(num)}
                    className="w-full h-full bg-white border border-slate-50 rounded-[28px] flex items-center justify-center text-2xl font-black text-slate-700 hover:bg-slate-50 hover:border-indigo-100 hover:text-indigo-600 transition-all active:scale-90 shadow-sm"
                   >
                     {num}
                   </button>
                 ))}
              </div>

              <button 
               onClick={startCall} disabled={!dialNum}
               className="w-full py-6 bg-indigo-600 text-white font-black rounded-[32px] mt-8 text-xs uppercase tracking-[0.2em] shadow-[0_20px_60px_-10px_rgba(79,70,229,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-20 disabled:grayscale disabled:scale-100"
              >
                <MdCall size={20} /> Aloqaga Chiqish
              </button>
           </div>
        </section>
      </div>

      {/* 3. FOOTER: History & Logs */}
      <section className="flex-1 bg-white rounded-[48px] border border-indigo-50/50 shadow-sm flex flex-col min-h-0">
         <div className="px-12 py-8 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white rounded-t-[48px]">
            <SectionHeader icon={MdHistory} title="Oxirgi Muloqotlar" subtitle="Batafsil Qo'ng'iroqlar jurnali" />
            <div className="relative w-80 group">
               <MdSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 text-2xl group-within:text-indigo-600 transition-colors" />
               <input 
                  value={listFilter} onChange={e => setListFilter(e.target.value)}
                  placeholder="Qidirish (ism yoki raqam)..." 
                  className="w-full pl-16 py-5 bg-slate-50/50 border border-slate-100 rounded-[24px] text-xs font-bold text-slate-600 outline-none focus:bg-white focus:border-indigo-400 transition-all shadow-inner placeholder:text-slate-200" 
               />
            </div>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
            <table className="w-full text-left table-fixed">
               <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-20">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                     <th className="px-10 py-6 w-1/3">Mijoz va Raqam</th>
                     <th className="px-10 py-6 text-center">Status</th>
                     <th className="px-10 py-6">Davomiyligi</th>
                     <th className="px-10 py-6 text-right">San'a / Vaqt</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 font-medium">
                  {callLog.filter(c => c.phone.includes(listFilter) || c.customer.toLowerCase().includes(listFilter.toLowerCase())).map((call) => (
                     <tr key={call.id} className="hover:bg-slate-50/50 transition-all cursor-pointer group">
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-5">
                              <div className="w-12 h-12 bg-slate-100 rounded-[18px] flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-12">{call.customer[0]}</div>
                              <div className="truncate">
                                 <p className="text-md font-black text-slate-800 leading-none mb-1.5">{call.phone}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{call.customer}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-6 text-center"><StatusBadge status={call.status} /></td>
                        <td className="px-10 py-6 text-[12px] font-black text-slate-400 font-mono tracking-[0.2em]">{call.duration}</td>
                        <td className="px-10 py-6 text-right">
                           <div className="flex flex-col items-end gap-1">
                              <p className="text-[12px] font-black text-slate-800">{call.time.split(', ')[0]}</p>
                              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{call.time.split(', ')[1]}</p>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </section>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.1); }
      `}</style>

    </div>
  );
}
