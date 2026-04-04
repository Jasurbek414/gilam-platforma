'use client';

import React, { useState, useEffect } from 'react';
import { 
  MdCall, MdCallEnd, MdPerson, MdPhone, MdSearch, MdHistory, 
  MdVolumeUp, MdMic, MdMicOff, MdPause, MdPlayArrow, MdMessage,
  MdAddCircle, MdLocationOn, MdAccessTime, MdDialpad, MdSettings,
  MdFiberManualRecord, MdArrowForward, MdContentCopy, MdCheckCircle,
  MdWarning, MdTimer, MdGroup, MdBackspacing
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';

const StatusBadge = ({ status }: { status: string }) => {
  const colors: any = {
    'COMPLETED': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'MISSED': 'bg-rose-50 text-rose-600 border-rose-100',
    'BUSY': 'bg-amber-50 text-amber-600 border-amber-100',
    'IN_PROGRESS': 'bg-indigo-50 text-indigo-600 border-indigo-100'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${colors[status] || 'bg-slate-50 text-slate-400'}`}>
      {status === 'COMPLETED' ? 'Muvaffaqiyatli' : status === 'MISSED' ? 'Javobsiz' : status}
    </span>
  );
};

export default function OperatorCallsPage() {
  const [activeCall, setActiveCall] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [dialNum, setDialNum] = useState('');
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [listFilter, setListFilter] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const phone = searchParams.get('phone');
    if (phone) setDialNum(phone);
  }, [searchParams]);

  const callLog = [
    { id: 1, phone: '+998 90 123 45 67', customer: 'Aliyev Vali', type: 'INCOMING', status: 'COMPLETED', duration: '02:45', time: 'Bugun, 10:15' },
    { id: 2, phone: '+998 93 321 65 43', customer: 'Yangi raqam', type: 'INCOMING', status: 'MISSED', duration: '00:00', time: 'Bugun, 11:30' },
    { id: 3, phone: '+998 99 888 77 66', customer: 'Rasulova Jamila', type: 'OUTGOING', status: 'COMPLETED', duration: '05:12', time: 'Bugun, 12:05' },
    { id: 4, phone: '+998 97 444 55 66', customer: 'Karimov Anvar', type: 'INCOMING', status: 'COMPLETED', duration: '01:20', time: 'Kecha, 17:45' },
  ];

  const handleSimulateIncoming = () => {
    setIncomingCall({
      phone: '+998 94 555 11 22',
      customer: 'Siddiqov Ravshan',
      location: 'Toshkent, Shayxontohur',
      campaign: 'Instagram Reklama'
    });
  };

  const handleDial = (num: string) => {
    if (dialNum.length < 13) setDialNum(p => p + num);
  };

  const startCall = () => {
    if (!dialNum) return;
    setActiveCall({ phone: dialNum, customer: 'Chiquvchi', startTime: new Date(), status: 'CONNECTED' });
    setDialNum('');
  };

  const endCall = () => {
    setActiveCall(null);
    setIsMuted(false);
    setIsOnHold(false);
  };

  return (
    <div className="relative h-[calc(100vh-140px)] w-full overflow-hidden flex flex-col gap-6">
      
      {/* HEADER SECTION */}
      <div className="shrink-0 flex items-center justify-between bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <MdCall className="text-2xl" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Qo'ng'iroqlar Markazi</h1>
            <div className="flex items-center gap-2 mt-0.5">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">On-line (Zadarma)</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button onClick={handleSimulateIncoming} className="px-6 py-3 bg-slate-50 text-slate-500 font-black rounded-2xl text-[10px] uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all">Generate Incoming</button>
           <div className="w-px h-8 bg-slate-100" />
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-xl">
                 <MdPerson className="text-lg" />
              </div>
              <div className="text-left">
                 <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Operator</p>
                 <p className="text-xs font-black text-slate-800 leading-none mt-1">Zilola Operatorova</p>
              </div>
           </div>
        </div>
      </div>

      {/* TOP ROW: Waiting & Dialpad */}
      <div className="grid grid-cols-12 gap-6 h-[420px] shrink-0">
        
        {/* LEFT: Waiting/Active Calls (Span 7) */}
        <div className="col-span-7 flex flex-col gap-6">
           <AnimatePresence mode="wait">
             {activeCall ? (
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 bg-slate-900 rounded-[48px] p-10 relative overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl">
                  <div className="relative z-10">
                     <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-24 h-24 rounded-[36px] bg-white/5 border border-white/10 flex items-center justify-center mb-6 mx-auto">
                        <MdPerson className="text-4xl text-white/20" />
                     </motion.div>
                     <h2 className="text-3xl font-black text-white tracking-widest mb-2 font-mono">{activeCall.phone}</h2>
                     <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">Connecting...</p>
                     
                     <div className="flex items-center justify-center gap-6 mt-10">
                        <button onClick={() => setIsMuted(!isMuted)} className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-amber-500 text-white' : 'bg-white/10 text-white/40 hover:bg-white/20'}`}>
                           {isMuted ? <MdMicOff className="text-2xl" /> : <MdMic className="text-2xl" />}
                        </button>
                        <button onClick={endCall} className="w-20 h-20 bg-rose-600 text-white rounded-[32px] flex items-center justify-center shadow-2xl hover:scale-105 active:scale-90 transition-all">
                           <MdCallEnd className="text-3xl" />
                        </button>
                        <button onClick={() => setIsOnHold(!isOnHold)} className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isOnHold ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/40 hover:bg-white/20'}`}>
                           {isOnHold ? <MdPlayArrow className="text-2xl" /> : <MdPause className="text-2xl" />}
                        </button>
                     </div>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
               </motion.div>
             ) : incomingCall ? (
               <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex-1 bg-white border-2 border-indigo-500 rounded-[48px] p-10 flex items-center justify-between shadow-2xl relative overflow-hidden">
                  <div className="relative z-10 flex items-center gap-8">
                     <div className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white text-3xl animate-bounce shadow-xl">
                        <MdPhone />
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-2">{incomingCall.phone}</h3>
                        <p className="text-sm font-bold text-slate-400">{incomingCall.customer} • {incomingCall.campaign}</p>
                     </div>
                  </div>
                  <div className="flex gap-4 relative z-10">
                     <button onClick={() => setIncomingCall(null)} className="px-8 py-4 bg-slate-50 text-slate-400 font-black rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all text-[10px] uppercase tracking-widest">Ignor qilish</button>
                     <button onClick={() => { setActiveCall({...incomingCall, status: 'CONNECTED'}); setIncomingCall(null); }} className="px-8 py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-600 transition-all text-[10px] uppercase tracking-widest animate-pulse">Javob berish</button>
                  </div>
               </motion.div>
             ) : (
               <div className="flex-1 bg-white border border-slate-100 rounded-[48px] p-10 flex flex-col items-center justify-center text-center shadow-sm">
                  <MdCall className="text-6xl text-slate-100 mb-6" />
                  <h3 className="text-xl font-black text-slate-800">Qo'ng'iroq kutilmoqda...</h3>
                  <p className="text-[11px] text-slate-400 mt-2 font-medium max-w-[240px]">Hozircha yangi murojaatlar yo'q. Tizim on-line rejimida.</p>
               </div>
             )}
           </AnimatePresence>
        </div>

        {/* RIGHT: Dialpad (Span 5) */}
        <div className="col-span-5 bg-white rounded-[48px] border border-slate-100 shadow-sm p-8 flex flex-col">
           <div className="flex items-center justify-between mb-8 px-2">
              <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-3">
                 <MdDialpad className="text-lg" /> Raqam Terish
              </h3>
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300"><MdSettings /></div>
           </div>

           <div className="flex-1 flex flex-col">
              <div className="bg-slate-50 border border-slate-100 rounded-[28px] p-5 mb-6 flex items-center gap-4 relative group">
                 <p className="flex-1 text-2xl font-black text-slate-800 tracking-widest font-mono pl-4">{dialNum || '...'}</p>
                 {dialNum && (
                    <button onClick={() => setDialNum(p => p.slice(0, -1))} className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all shadow-sm">
                       <MdBackspacing />
                    </button>
                 )}
              </div>

              <div className="grid grid-cols-3 gap-3 flex-1">
                 {['1','2','3','4','5','6','7','8','9','*','0','#'].map(num => (
                   <button 
                    key={num} onClick={() => handleDial(num)}
                    className="w-full h-full bg-white border border-slate-50 rounded-2xl flex items-center justify-center text-xl font-black text-slate-700 hover:bg-slate-50 hover:border-indigo-100 hover:text-indigo-600 transition-all active:scale-90"
                   >
                     {num}
                   </button>
                 ))}
              </div>

              <button 
               onClick={startCall}
               className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl mt-6 text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-102 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <MdCall className="text-lg" /> Aloqaga Chiqish
              </button>
           </div>
        </div>
      </div>

      {/* BOTTOM ROW: Recent Calls */}
      <div className="flex-1 bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col min-h-0">
         <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 rotate-12"><MdHistory className="text-xl" /></div>
               <h2 className="text-lg font-black text-slate-800 tracking-tight">Oxirgi Muloqotlar</h2>
            </div>
            <div className="relative w-64 group">
               <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xl group-focus-within:text-indigo-500 transition-colors" />
               <input 
                  value={listFilter} onChange={e => setListFilter(e.target.value)}
                  placeholder="Qidirish..." 
                  className="w-full pl-11 py-3 bg-slate-50 border border-slate-50 rounded-xl text-xs font-bold text-slate-600 outline-none focus:bg-white focus:border-indigo-100 transition-all shadow-inner" 
               />
            </div>
         </div>

         <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
               <thead className="sticky top-0 bg-white z-10">
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                     <th className="px-10 py-4">Mijoz va Raqam</th>
                     <th className="px-10 py-4 text-center">Status</th>
                     <th className="px-10 py-4">Davomiyligi</th>
                     <th className="px-10 py-4 text-right">Muloqot vaqti</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {callLog.filter(c => c.phone.includes(listFilter) || c.customer.toLowerCase().includes(listFilter.toLowerCase())).map((call) => (
                     <tr key={call.id} className="hover:bg-slate-50/50 transition-all cursor-pointer group">
                        <td className="px-10 py-5">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">{call.customer[0]}</div>
                              <div>
                                 <p className="text-sm font-black text-slate-800 leading-none mb-1">{call.phone}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{call.customer}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-5 text-center"><StatusBadge status={call.status} /></td>
                        <td className="px-10 py-5 text-[11px] font-black text-slate-400 font-mono tracking-widest">{call.duration}</td>
                        <td className="px-10 py-5 text-right text-xs font-bold text-slate-400">{call.time}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.1); }
      `}</style>

    </div>
  );
}
