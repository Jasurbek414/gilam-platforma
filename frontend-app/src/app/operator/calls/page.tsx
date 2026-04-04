'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  MdCall, MdCallEnd, MdPerson, MdPhone, MdSearch, MdHistory, 
  MdMic, MdMicOff, MdPause, MdPlayArrow, MdDialpad, MdSettings,
  MdBackspace, MdNotificationsActive, MdArrowForward
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';

// --- TYPES ---
type CallStatus = 'COMPLETED' | 'MISSED' | 'BUSY' | 'IN_PROGRESS' | 'CONNECTED';
interface CallRecord {
  id: number; phone: string; customer: string; status: CallStatus; duration: string; time: string;
}

// --- STYLES & CONSTANTS ---
const STATUS_STLYES: Record<CallStatus, string> = {
  COMPLETED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  MISSED: 'bg-rose-50 text-rose-600 border-rose-100',
  BUSY: 'bg-amber-50 text-amber-600 border-amber-100',
  IN_PROGRESS: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  CONNECTED: 'bg-indigo-600 text-white border-indigo-500',
};

const StatusBadge = ({ status }: { status: CallStatus }) => (
  <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${STATUS_STLYES[status] || 'bg-slate-50 text-slate-400'}`}>
    {status === 'COMPLETED' ? 'Muvaffaqiyatli' : status === 'MISSED' ? 'Javobsiz' : status}
  </span>
);

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
  <div className="flex items-center gap-4 mb-6">
    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 transition-transform">
      <Icon className="text-xl" />
    </div>
    <div>
      <h2 className="text-sm font-black text-slate-800 tracking-tight leading-none uppercase">{title}</h2>
      {subtitle && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{subtitle}</p>}
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
    { id: 4, phone: '+998 97 444 55 66', customer: 'Karimov Anvar', status: 'COMPLETED', duration: '01:20', time: 'Kecha, 17:45' },
  ], []);

  useEffect(() => {
    const phone = searchParams.get('phone');
    if (phone) setDialNum(phone);
  }, [searchParams]);

  const handleDial = (num: string) => dialNum.length < 13 && setDialNum(p => p + num);
  const startCall = () => {
    if (!dialNum) return;
    setActiveCall({ phone: dialNum, customer: 'Chiquvchi Qo\'ng\'iroq', status: 'CONNECTED' });
    setDialNum('');
  };
  const endCall = () => { setActiveCall(null); setIsMuted(false); setIsOnHold(false); };

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-8 pb-12 font-sans overflow-y-auto overflow-x-hidden custom-scrollbar">
      
      {/* 1. HEADER: Unified & Clean */}
      <header className="shrink-0 flex items-center justify-between bg-white/90 backdrop-blur-2xl p-5 rounded-[28px] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-5 pl-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
            <MdCall className="text-2xl" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Qo'ng'iroqlar Markazi</h1>
            <div className="flex items-center gap-2 mt-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">On-line • Telephony Active</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5">
           <button 
              onClick={() => setIncomingCall({ phone: '+998 90 777 55 33', customer: 'Sardor Rahimiv (Glavniy)', campaign: 'Mijoz Identifikatsiyasi' })}
              className="px-4 py-2 text-slate-300 hover:text-indigo-400 font-black rounded-xl text-[8px] uppercase tracking-widest transition-all border border-transparent hover:border-indigo-50"
           >
              Simulate Trigger
           </button>
           <div className="w-px h-8 bg-slate-100" />
           <div className="flex items-center gap-4 pr-2">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                 <MdPerson className="text-lg" />
              </div>
              <div className="text-left">
                 <p className="text-[9px] font-black text-slate-400 uppercase leading-none tracking-widest">Operator</p>
                 <p className="text-xs font-black text-slate-800 leading-none mt-1.5 tracking-tight">Zilola Operatorova</p>
              </div>
           </div>
        </div>
      </header>

      {/* 2. TOP WORKSPACE: 12-Column Grid */}
      <div className="grid grid-cols-12 gap-6 h-[440px] shrink-0">
        
        {/* EXPERIENCE PANEL (Left) */}
        <section className="col-span-12 lg:col-span-7">
          <AnimatePresence mode="wait">
            {activeCall ? (
              <motion.div 
                key="active" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="h-full bg-slate-950 rounded-[48px] p-10 relative overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl"
              >
                <div className="relative z-10">
                   <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center mb-8 mx-auto shadow-inner">
                      <MdPerson className="text-5xl text-white/10" />
                      <div className="absolute inset-0 rounded-[32px] border-2 border-indigo-500/20 animate-ping" />
                   </motion.div>
                   <h2 className="text-3xl font-black text-white tracking-[0.1em] mb-4 font-mono">{activeCall.phone}</h2>
                   <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.4em] leading-none px-6 py-2 bg-indigo-500/10 rounded-full inline-block">{activeCall.customer}</p>
                   
                   <div className="flex items-center justify-center gap-8 mt-12">
                      <button onClick={() => setIsMuted(!isMuted)} className={`w-16 h-16 rounded-[22px] border flex items-center justify-center transition-all ${isMuted ? 'bg-amber-500 border-amber-400 text-white shadow-pill' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}>
                         {isMuted ? <MdMicOff size={24} /> : <MdMic size={24} />}
                      </button>
                      <button onClick={endCall} className="w-20 h-20 bg-rose-600 text-white rounded-[32px] flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all outline outline-offset-4 outline-rose-500/20">
                         <MdCallEnd size={32} />
                      </button>
                      <button onClick={() => setIsOnHold(!isOnHold)} className={`w-16 h-16 rounded-[22px] border flex items-center justify-center transition-all ${isOnHold ? 'bg-indigo-600 border-indigo-500 text-white shadow-pill' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}>
                         {isOnHold ? <MdPlayArrow size={24} /> : <MdPause size={24} />}
                      </button>
                   </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent blur-[80px]" />
              </motion.div>
            ) : incomingCall ? (
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="h-full bg-white border-2 border-indigo-600 rounded-[48px] p-12 flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden group">
                <div className="relative z-10 flex flex-col items-center">
                   <div className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white text-3xl animate-bounce mb-8 shadow-xl shadow-indigo-600/20">
                      <MdNotificationsActive />
                   </div>
                   <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-3">{incomingCall.phone}</h3>
                   <div className="flex items-center gap-3 bg-slate-50 px-5 py-2 rounded-full border border-slate-100">
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{incomingCall.customer}</p>
                      <div className="w-1 h-1 bg-slate-200 rounded-full" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{incomingCall.campaign}</p>
                   </div>
                   <div className="flex gap-4 mt-12 w-full max-w-sm">
                      <button onClick={() => setIncomingCall(null)} className="flex-1 py-5 bg-slate-50 text-slate-400 font-black rounded-[24px] hover:bg-rose-50 hover:text-rose-600 transition-all text-[10px] uppercase tracking-widest border border-slate-100">Ignor Qilish</button>
                      <button onClick={() => { setActiveCall({...incomingCall, status: 'CONNECTED'}); setIncomingCall(null); }} className="flex-1 py-5 bg-emerald-500 text-white font-black rounded-[24px] shadow-xl hover:bg-emerald-600 transition-all text-[10px] uppercase tracking-widest animate-pulse">Javob Berish</button>
                   </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-2 bg-indigo-600" />
              </motion.div>
            ) : (
              <div className="h-full bg-white border border-slate-100 rounded-[48px] p-12 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
                <div className="relative z-10">
                   <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mb-8 mx-auto rotate-12 opacity-40">
                      <MdCall className="text-5xl text-slate-300" />
                   </div>
                   <h3 className="text-xl font-black text-slate-800 tracking-tight">Navbatdagi Qo'ng'iroq...</h3>
                   <p className="text-[10px] text-slate-400 mt-4 font-black uppercase tracking-[0.2em] max-w-[240px] leading-relaxed">Tizim on-line rejimida yangi murojaatlarni kutilmoqda.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </section>

        {/* DIALPAD PANEL (Right) */}
        <section className="col-span-12 lg:col-span-5 bg-white rounded-[48px] border border-slate-100 shadow-sm p-8 flex flex-col">
           <SectionHeader icon={MdDialpad} title="Raqam Terish" subtitle="Dialpad & Control" />

           <div className="flex-1 flex flex-col">
              <div className="bg-slate-50 border border-slate-100 rounded-[24px] p-5 mb-6 flex items-center gap-4 relative">
                 <p className="flex-1 text-2xl font-black text-slate-800 tracking-widest font-mono pl-4 leading-none">{dialNum || '...'}</p>
                 {dialNum && (
                    <button onClick={() => setDialNum(p => p.slice(0, -1))} className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all shadow-sm">
                       <MdBackspace size={20} />
                    </button>
                 )}
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-r-full" />
              </div>

              <div className="grid grid-cols-3 gap-3 flex-1 overflow-hidden">
                 {['1','2','3','4','5','6','7','8','9','*','0','#'].map(num => (
                   <button 
                    key={num} onClick={() => handleDial(num)}
                    className="w-full h-full bg-white border border-slate-50 rounded-[22px] flex items-center justify-center text-xl font-black text-slate-700 hover:bg-slate-50 hover:border-indigo-100 hover:shadow-inner transition-all active:scale-95"
                   >
                     {num}
                   </button>
                 ))}
              </div>

              <button 
               onClick={startCall} disabled={!dialNum}
               className="w-full py-5 bg-indigo-600 text-white font-black rounded-[28px] mt-6 text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-20"
              >
                <MdCall size={20} /> Aloqaga Chiqish
              </button>
           </div>
        </section>
      </div>

      {/* 3. HISTORY: Table List */}
      <section className="flex-1 bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col min-h-0">
         <div className="px-10 py-7 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white rounded-t-[40px]">
            <SectionHeader icon={MdHistory} title="Muloqotlar Tarixi" subtitle="So'nggi qo'ng'iroqlar jurnali" />
            <div className="relative w-72 group">
               <MdSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 text-2xl group-within:text-indigo-600 transition-colors" />
               <input 
                  value={listFilter} onChange={e => setListFilter(e.target.value)}
                  placeholder="Qidiruv..." 
                  className="w-full pl-14 py-4 bg-slate-50/50 border border-slate-100 rounded-[20px] text-xs font-bold text-slate-600 outline-none focus:bg-white focus:border-indigo-400 transition-all shadow-inner" 
               />
            </div>
         </div>

         <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
            <table className="w-full text-left table-fixed">
               <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-10 border-b border-slate-50">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <th className="px-10 py-6 w-1/3">Mijoz / Raqam</th>
                     <th className="px-10 py-6 text-center">Status</th>
                     <th className="px-10 py-6">Davomiyligi</th>
                     <th className="px-10 py-6 text-right">Muloqot Vaqti</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {callLog.filter(c => c.phone.includes(listFilter) || c.customer.toLowerCase().includes(listFilter.toLowerCase())).map((call) => (
                     <tr key={call.id} className="hover:bg-slate-50/50 transition-all cursor-pointer group">
                        <td className="px-10 py-5">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-100 rounded-[14px] flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-6">{call.customer[0]}</div>
                              <div className="truncate">
                                 <p className="text-[13px] font-black text-slate-800 leading-none mb-1.5">{call.phone}</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{call.customer}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-5 text-center"><StatusBadge status={call.status} /></td>
                        <td className="px-10 py-5 text-[11px] font-black text-slate-400 font-mono tracking-widest">{call.duration}</td>
                        <td className="px-10 py-5 text-right flex flex-col justify-center items-end h-full">
                           <p className="text-[11px] font-black text-slate-800">{call.time.split(', ')[0]}</p>
                           <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{call.time.split(', ')[1]}</p>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </section>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.04); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.08); }
      `}</style>
    </div>
  );
}
