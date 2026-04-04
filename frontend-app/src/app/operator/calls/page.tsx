'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MdCall, MdCallEnd, MdPerson, MdPhone, MdSearch, MdHistory, 
  MdVolumeUp, MdMic, MdMicOff, MdPause, MdPlayArrow, MdMessage,
  MdAddCircle, MdLocationOn, MdAccessTime, MdDialpad, MdSettings,
  MdFiberManualRecord, MdArrowForward, MdContentCopy, MdCheckCircle,
  MdWarning, MdTimer, MdGroup
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Modal from '@/components/ui/Modal';

// --- CUSTOM COMPONENTS ---

const StatusBadge = ({ status }: { status: string }) => {
  const colors: any = {
    'COMPLETED': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'MISSED': 'bg-rose-50 text-rose-600 border-rose-100',
    'BUSY': 'bg-amber-50 text-amber-600 border-amber-100',
    'IN_PROGRESS': 'bg-indigo-50 text-indigo-600 border-indigo-100'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${colors[status] || 'bg-slate-50 text-slate-400'}`}>
      {status === 'COMPLETED' ? 'Muvaffaqiyatli' : status === 'MISSED' ? 'Javobsiz' : status}
    </span>
  );
};

export default function OperatorCallsPage() {
  const [activeCall, setActiveCall] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isDialpadOpen, setIsDialpadOpen] = useState(false);
  const [dialNum, setDialNum] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle incoming query params (e.g. from Logistics)
  useEffect(() => {
    const phone = searchParams.get('phone');
    if (phone) {
      setDialNum(phone);
      setIsDialpadOpen(true);
    }
  }, [searchParams]);

  // Simulated Call Log
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
      campaign: 'Glavniy reklama (Instagram)'
    });
  };

  const handleDial = (num: string) => {
    if (dialNum.length < 13) setDialNum(prev => prev + num);
  };

  const startCall = (num: string = dialNum) => {
    if (!num) return;
    setActiveCall({
      phone: num,
      customer: 'Chiquvchi qo\'ng\'iroq',
      location: 'Noma\'lum',
      startTime: new Date(),
      status: 'CONNECTED'
    });
    setIsDialpadOpen(false);
    setDialNum('');
  };

  const answerCall = () => {
    if (!incomingCall) return;
    setActiveCall({
      ...incomingCall,
      startTime: new Date(),
      status: 'CONNECTED'
    });
    setIncomingCall(null);
  };

  const endCall = () => {
    setActiveCall(null);
    setIsMuted(false);
    setIsOnHold(false);
  };

  const handleLookup = () => {
    if (!searchPhone) return;
    setIsLookingUp(true);
    setTimeout(() => {
      if (searchPhone.includes('90 123')) {
        setLookupResult({
          name: 'Aliyev Vali',
          phone: '+998 90 123 45 67',
          address: 'Yunusobod 19-kvartal, 45-uy',
          history: [{ id: 101, date: '15.02.2024', total: '450,000', status: 'Delivered' }]
        });
      } else {
        setLookupResult('NOT_FOUND');
      }
      setIsLookingUp(false);
    }, 600);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] space-y-8">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-center">
            <MdCall className="text-indigo-600 text-3xl" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Qo'ng'iroqlar Markazi</h1>
            <p className="text-slate-400 text-sm font-medium mt-1">IP-Telefoniya va Mijozlar bilan muloqot boshqaruvi</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="bg-white px-6 py-4 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-6">
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Aloqa statusi</p>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-xs font-black text-emerald-600 uppercase">On-line (Zadarma)</p>
                 </div>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <button 
                onClick={() => setIsDialpadOpen(true)}
                className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
              >
                <MdDialpad className="text-2xl" />
              </button>
           </div>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="flex-1 flex gap-8 min-h-0 overflow-hidden">
        
        {/* Column 1: Active Call Experience (Left) */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
           
           <AnimatePresence mode="wait">
             {activeCall ? (
               <motion.div 
                key="active-call" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 bg-slate-900 rounded-[56px] p-12 overflow-hidden relative shadow-2xl shadow-indigo-900/10 border border-white/5 flex flex-col"
               >
                  <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center">
                    {/* Active Call UI */}
                    <motion.div animate={{ scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="w-32 h-32 rounded-[48px] bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative">
                       <div className="absolute inset-0 rounded-[48px] border-2 border-indigo-500/30 animate-ping"></div>
                       <MdPerson className="text-6xl text-white/20" />
                    </motion.div>
                    
                    <h2 className="text-4xl font-black text-white tracking-tight mb-3 font-mono">{activeCall.phone}</h2>
                    <div className="flex items-center gap-3 bg-white/5 px-6 py-2 rounded-full border border-white/5 backdrop-blur-md">
                       <MdFiberManualRecord className="text-indigo-500 text-[10px] animate-pulse" />
                       <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">{activeCall.customer}</span>
                    </div>

                    <div className="mt-16 flex items-center gap-6">
                       <button onClick={() => setIsMuted(!isMuted)} className={`w-20 h-20 rounded-[32px] flex items-center justify-center transition-all border ${isMuted ? 'bg-amber-500 text-white border-amber-400 shadow-xl shadow-amber-500/20' : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'}`}>
                          {isMuted ? <MdMicOff className="text-3xl" /> : <MdMic className="text-3xl" />}
                       </button>
                       <button onClick={() => setIsOnHold(!isOnHold)} className={`w-20 h-20 rounded-[32px] flex items-center justify-center transition-all border ${isOnHold ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl shadow-indigo-500/20' : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'}`}>
                          {isOnHold ? <MdPlayArrow className="text-3xl" /> : <MdPause className="text-3xl" />}
                       </button>
                       <button onClick={endCall} className="w-24 h-24 bg-rose-600 text-white rounded-[40px] flex items-center justify-center shadow-2xl shadow-rose-900/40 hover:scale-110 active:scale-90 transition-all">
                          <MdCallEnd className="text-4xl" />
                       </button>
                    </div>

                    <div className="mt-16 w-full max-w-md grid grid-cols-2 gap-4">
                       <button className="flex items-center justify-center gap-3 py-5 bg-white/5 rounded-3xl border border-white/5 text-white/60 hover:bg-white/10 transition-all group">
                          <MdMessage className="text-xl group-hover:text-amber-400 transition-colors" />
                          <span className="text-[10px] font-black uppercase tracking-widest">SMS Yuborish</span>
                       </button>
                       <button onClick={() => router.push(`/operator/orders?phone=${activeCall.phone}`)} className="flex items-center justify-center gap-3 py-5 bg-white/5 rounded-3xl border border-white/5 text-white/60 hover:bg-white/10 transition-all group">
                          <MdAddCircle className="text-xl group-hover:text-emerald-400 transition-colors" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Buyurtma ochish</span>
                       </button>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] -mr-48 -mt-48"></div>
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/5 rounded-full blur-[120px] -ml-48 -mb-48"></div>
               </motion.div>
             ) : (
               <motion.div key="empty-call" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 bg-white rounded-[56px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center p-20 relative overflow-hidden">
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mb-8 rotate-6">
                      <MdCall className="text-slate-200 text-5xl" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Qo'ng'iroq kutilmoqda...</h3>
                    <p className="text-slate-400 mt-4 text-sm font-medium max-w-sm leading-relaxed">Hozirda faol qo'ng'iroqlar yo'q. Tizim on-line rejimida yangi murojaatlarni qabul qilishga tayyor.</p>
                    <div className="flex gap-4 mt-12">
                       <button onClick={handleSimulateIncoming} className="px-8 py-4 bg-slate-900 text-white font-black rounded-3xl text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl">
                          Sinov qo'ng'irog'i
                       </button>
                       <button onClick={() => setIsDialpadOpen(true)} className="px-8 py-4 bg-white border border-slate-100 text-slate-600 font-black rounded-3xl text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">
                          Raqam terish
                       </button>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-50/50 to-transparent pointer-events-none"></div>
               </motion.div>
             )}
           </AnimatePresence>

           {/* Call Logs (History Section in Column 1) */}
           <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
             <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center"><MdHistory className="text-indigo-600 text-xl" /></div>
                   <h2 className="text-lg font-black text-slate-800 tracking-tight">Oxirgi muloqotlar</h2>
                </div>
                <div className="flex items-center gap-3">
                   <MdSearch className="text-slate-300 text-xl" />
                   <input placeholder="Qidirish..." className="text-sm font-bold text-slate-600 outline-none w-48 bg-transparent" />
                </div>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                      <th className="px-10 py-4">Raqam va Mijoz</th>
                      <th className="px-10 py-4">Status</th>
                      <th className="px-10 py-4">Davomiyligi</th>
                      <th className="px-10 py-4 text-right">Vaqt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {callLog.map((call) => (
                      <tr key={call.id} className="hover:bg-slate-50/50 transition-all cursor-pointer group">
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">{call.customer[0]}</div>
                              <div>
                                 <p className="text-sm font-black text-slate-800 tracking-tight">{call.phone}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{call.customer}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-6"><StatusBadge status={call.status} /></td>
                        <td className="px-10 py-6 text-xs font-black text-slate-400 font-mono tracking-widest">{call.duration}</td>
                        <td className="px-10 py-6 text-right text-xs font-bold text-slate-400">{call.time}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
           </div>
        </div>

        {/* Column 2: CRM & Utility (Right Side) */}
        <div className="w-[420px] flex flex-col gap-8 shrink-0">
           
           <div className="bg-indigo-600 rounded-[56px] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-100">
              <div className="relative z-10 flex flex-col h-full">
                 <h3 className="text-xl font-black tracking-tight mb-8">Tezkor Ma'lumot</h3>
                 <div className="grid grid-cols-1 gap-4">
                    {[
                      { label: 'Jami Mijozlar', val: '1,284', icon: MdGroup, sub: '+12% hafta mobaynida' },
                      { label: 'Kutish vaqti', val: '00:15', icon: MdTimer, sub: 'O\'rtacha (Ideal)' },
                      { label: 'Bugun yakunlangan', val: '42 ta', icon: MdCheckCircle, sub: 'Buyurtmalar' },
                    ].map((item, i) => (
                      <div key={i} className="bg-white/10 rounded-[32px] p-6 border border-white/5 backdrop-blur-xl">
                         <div className="flex items-center justify-between mb-4">
                            <item.icon className="text-white/40 text-2xl" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-200">Jonli tahlil</span>
                         </div>
                         <p className="text-xs font-bold text-indigo-100 opacity-60 mb-1">{item.label}</p>
                         <p className="text-2xl font-black">{item.val}</p>
                         <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-2">{item.sub}</p>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
           </div>

           {/* Customer Lookup (CRM Interaction) */}
           <div className="flex-1 bg-white rounded-[56px] border border-slate-100 shadow-sm p-10 flex flex-col relative overflow-hidden">
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-10">
                   <MdSearch className="text-indigo-600 text-2xl" />
                   <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.15em]">Mijozni Identifikatsiyalash</h3>
                </div>

                <div className="space-y-4">
                   <div className="relative group">
                      <MdPhone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        value={searchPhone} onChange={(e) => setSearchPhone(e.target.value)}
                        placeholder="+998 00 000 00 00" 
                        className="w-full pl-16 pr-8 py-6 bg-slate-50 border border-slate-100 rounded-[32px] text-base font-black text-slate-800 outline-none focus:bg-white focus:ring-4 ring-indigo-500/5 transition-all shadow-sm"
                      />
                   </div>
                   <button 
                    onClick={handleLookup} disabled={isLookingUp}
                    className="w-full py-6 bg-slate-900 text-white font-black rounded-[32px] hover:bg-indigo-600 transition-all text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 disabled:opacity-20"
                   >
                     {isLookingUp ? 'Qidirib topilmoqda...' : 'Ma\'lumotlarni bazadan olish'}
                   </button>
                </div>

                <div className="flex-1 mt-10 overflow-y-auto custom-scrollbar">
                   <AnimatePresence mode="wait">
                     {lookupResult === 'NOT_FOUND' ? (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 bg-rose-50 rounded-[40px] border border-dashed border-rose-200 text-center flex flex-col items-center">
                         <MdWarning className="text- rose-500 text-4xl mb-4" />
                         <p className="text-sm font-bold text-rose-600 leading-relaxed mb-6">Ushbu raqam bazada mavjud emas.</p>
                         <button onClick={() => router.push(`/operator/orders?phone=${searchPhone}`)} className="px-6 py-3 bg-white text-rose-600 font-black rounded-2xl text-[10px] uppercase tracking-widest border border-rose-100 hover:bg-rose-100 transition-colors">Yangi profil ochish</button>
                       </motion.div>
                     ) : lookupResult ? (
                       <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                          <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[40px] relative overflow-hidden group">
                             <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-3xl font-black text-indigo-600 shadow-sm transition-transform group-hover:scale-110">{lookupResult.name[0]}</div>
                             <div>
                                <h4 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">{lookupResult.name}</h4>
                                <p className="text-sm font-bold text-slate-400 font-mono tracking-tight">{lookupResult.phone}</p>
                             </div>
                             <button className="absolute right-6 p-3 bg-white rounded-xl text-slate-300 hover:text-indigo-600 transition-all"><MdArrowForward /></button>
                          </div>

                          <div className="space-y-4 px-2">
                             <div className="flex items-start gap-4">
                                <MdLocationOn className="text-indigo-500 text-xl shrink-0 mt-0.5" />
                                <div className="flex-1">
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Manzil (Asosiy)</p>
                                   <p className="text-sm font-bold text-slate-600 leading-relaxed">{lookupResult.address}</p>
                                </div>
                             </div>
                             
                             <div className="pt-6 border-t border-slate-50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Oxirgi buyurtma</p>
                                {lookupResult.history.map((h: any) => (
                                  <div key={h.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl hover:bg-indigo-50 border border-transparent transition-all cursor-pointer">
                                     <div className="flex items-center gap-3">
                                        <MdAccessTime className="text-indigo-400 text-lg" />
                                        <p className="text-[11px] font-bold text-slate-700">{h.date}</p>
                                     </div>
                                     <p className="text-[11px] font-black text-slate-900">{h.total} so'm</p>
                                  </div>
                                ))}
                             </div>
                          </div>

                          <button onClick={() => router.push(`/operator/orders?phone=${lookupResult.phone}`)} className="w-full flex items-center justify-center gap-3 py-6 bg-emerald-500 text-white font-black rounded-[32px] text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
                             <MdAddCircle className="text-xl" /> Buyurtma ochish
                          </button>
                       </motion.div>
                     ) : (
                       <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6 opacity-20">
                         <MdPerson className="text-[100px] text-slate-100" />
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] max-w-[200px]">Raqam bo'yicha mijoz tarixi shu yerda ko'rinadi</p>
                       </div>
                     )}
                   </AnimatePresence>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Incoming Call Portal */}
      <AnimatePresence>
        {incomingCall && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-2xl flex items-center justify-center p-4">
             <motion.div initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }} className="w-full max-w-xl bg-slate-900 rounded-[56px] border border-white/10 p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center text-center">
                   <div className="w-32 h-32 rounded-[48px] bg-indigo-600 flex items-center justify-center mb-10 shadow-[0_20px_40px_rgba(79,70,229,0.4)] relative">
                      <MdPhone className="text-white text-6xl" />
                      <div className="absolute inset-0 rounded-[48px] border-4 border-white/20 animate-ping"></div>
                   </div>
                   
                   <h2 className="text-4xl font-black text-white tracking-tight mb-4 font-mono">{incomingCall.phone}</h2>
                   <p className="text-xl font-black text-indigo-400 uppercase tracking-[0.3em] font-mono leading-none">{incomingCall.customer}</p>
                   
                   <div className="mt-12 w-full space-y-4">
                      <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-left flex items-start gap-4">
                         <MdLocationOn className="text-indigo-400 text-2xl shrink-0" />
                         <div>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Manzil:</p>
                            <p className="text-sm font-bold text-white/80">{incomingCall.location}</p>
                         </div>
                      </div>
                      <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-left flex items-start gap-4">
                         <MdFiberManualRecord className="text-amber-500 text-2xl shrink-0" />
                         <div>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Kampaniya:</p>
                            <p className="text-sm font-bold text-white/80">{incomingCall.campaign}</p>
                         </div>
                      </div>
                   </div>

                   <div className="mt-16 flex gap-6 w-full">
                      <button onClick={() => setIncomingCall(null)} className="flex-1 py-6 bg-white/5 text-white/40 font-black rounded-[32px] text-xs uppercase tracking-widest hover:bg-rose-500/20 hover:text-rose-400 transition-all border border-white/5">
                        Rad etish
                      </button>
                      <button onClick={answerCall} className="flex-2 w-[280px] py-6 bg-emerald-500 text-white font-black rounded-[32px] text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-2xl shadow-emerald-500/20 animate-pulse">
                        Javob berish
                      </button>
                   </div>
                </div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] -ml-40 -mb-40"></div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Dialpad Modal */}
      <Modal isOpen={isDialpadOpen} onClose={() => setIsDialpadOpen(false)} title="Raqam terish paneli">
         <div className="flex flex-col items-center">
            <div className="w-full bg-slate-50 p-10 rounded-[40px] mb-10 text-center border border-slate-100 relative group overflow-hidden">
               <p className="text-4xl font-black text-slate-800 tracking-[0.2em] min-h-[48px] font-mono leading-none">{dialNum || '...'}</p>
               {dialNum && <button onClick={() => setDialNum(prev => prev.slice(0, -1))} className="absolute right-8 top-1/2 -translate-y-1/2 p-3 text-slate-300 hover:text-rose-500 transition-colors"><MdContentCopy className="rotate-180" /></button>}
            </div>

            <div className="grid grid-cols-3 gap-6 w-full max-w-[360px]">
               {['1','2','3','4','5','6','7','8','9','*','0','#'].map(num => (
                 <button 
                  key={num} onClick={() => handleDial(num)}
                  className="w-full aspect-square rounded-3xl bg-white border border-slate-100 flex flex-col items-center justify-center text-3xl font-black text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm active:scale-90"
                 >
                    {num}
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1 opacity-0">...</span>
                 </button>
               ))}
            </div>

            <div className="mt-12 flex gap-4 w-full">
               <button onClick={() => setDialNum('')} className="flex-1 py-6 bg-slate-50 text-slate-400 font-black rounded-[32px] text-xs uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100">Tozalash</button>
               <button onClick={() => startCall()} className="flex-2 w-[280px] py-6 bg-indigo-600 text-white font-black rounded-[32px] text-xs uppercase tracking-widest shadow-2xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all">Aloqaga chiqish</button>
            </div>
         </div>
      </Modal>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(203, 213, 225, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(203, 213, 225, 0.8);
        }
      `}</style>

    </div>
  );
}
