'use client';

import React, { useState } from 'react';
import { 
  MdCall, 
  MdCallEnd, 
  MdPerson, 
  MdPhone,
  MdSearch, 
  MdHistory, 
  MdVolumeUp, 
  MdMic, 
  MdMicOff,
  MdPause,
  MdPlayArrow,
  MdMessage,
  MdAddCircle,
  MdLocationOn,
  MdAccessTime
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';

export default function OperatorCallsPage() {
  const [activeCall, setActiveCall] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isDialpadOpen, setIsDialpadOpen] = useState(false);
  const [dialNum, setDialNum] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  
  const router = useRouter();

  React.useEffect(() => {
    if (!isDialpadOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9*#]$/.test(e.key)) {
        handleDial(e.key);
      } 
      else if (e.key === 'Backspace') {
        setDialNum(prev => prev.slice(0, -1));
      }
      else if (e.key === 'Enter') {
        handleStartCall();
      }
      else if (e.key === 'Escape') {
        setIsDialpadOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDialpadOpen, dialNum]);

  const callLog = [
    { id: 1, phone: '+998 90 123 45 67', customer: 'Aliyev Vali', type: 'INCOMING', status: 'COMPLETED', duration: '02:45', time: '10:15' },
    { id: 2, phone: '+998 93 321 65 43', customer: 'Unknown', type: 'INCOMING', status: 'MISSED', duration: '00:00', time: '10:30' },
    { id: 3, phone: '+998 99 888 77 66', customer: 'Rasulova Jamila', type: 'OUTGOING', status: 'COMPLETED', duration: '05:12', time: '11:05' },
    { id: 4, phone: '+998 97 444 55 66', customer: 'Karimov Anvar', type: 'INCOMING', status: 'COMPLETED', duration: '01:20', time: '11:45' },
  ];

  const handleSimulateIncomingCall = () => {
    setActiveCall({
      phone: '+998 94 555 11 22',
      customer: 'Yangi Mijoz',
      location: 'Toshkent, Chilonzor',
      startTime: new Date()
    });
  };

  const handleDial = (num: string) => {
    if (dialNum.length < 13) setDialNum(prev => prev + num);
  };

  const handleStartCall = () => {
    if (!dialNum) return;
    setActiveCall({
      phone: dialNum,
      customer: 'Chiquvchi qo\'ng\'iroq',
      location: 'Noma\'lum',
      startTime: new Date()
    });
    setIsDialpadOpen(false);
    setDialNum('');
  };

  const handleCreateOrderFromCall = () => {
    if (!activeCall) return;
    const params = new URLSearchParams({
      phone: activeCall.phone,
      name: activeCall.customer === 'Yangi Mijoz' ? '' : activeCall.customer,
      address: activeCall.location === 'Noma\'lum' ? '' : activeCall.location
    });
    router.push(`/operator/orders?${params.toString()}`);
  };

  const handleLookup = () => {
    if (!searchPhone) return;
    setIsLookingUp(true);
    
    // Simulate API delay
    setTimeout(() => {
      if (searchPhone.includes('90 123')) {
        setLookupResult({
          name: 'Aliyev Vali',
          phone: '+998 90 123 45 67',
          address: 'Toshkent sh., Yunusobod tumani, 19-kvartal, 45-uy',
          history: [
            { id: 101, date: '2024-02-15', total: '450,000', status: 'Delivered' },
            { id: 102, date: '2023-11-20', total: '280,000', status: 'Delivered' }
          ]
        });
      } else if (searchPhone.includes('99 888')) {
        setLookupResult({
          name: 'Rasulova Jamila',
          phone: '+998 99 888 77 66',
          address: 'Toshkent sh., Mirobod tumani, Nukus ko\'chasi, 12-uy',
          history: [
            { id: 201, date: '2024-01-10', total: '820,000', status: 'Delivered' }
          ]
        });
      } else {
        setLookupResult('NOT_FOUND');
      }
      setIsLookingUp(false);
    }, 800);
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Qo'ng'iroqlar Markazi</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">IP-Telefoniya tizimi orqali qo'ng'iroqlarga javob bering</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDialpadOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-indigo-200 text-indigo-600 font-black rounded-2xl hover:bg-indigo-50 transition-all shadow-sm"
          >
            <MdCall className="text-xl" />
            Raqam Terish
          </button>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Telefoniya statusi</span>
            <div className="flex items-center gap-2 text-emerald-500 font-black text-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              ALOQA FAOL (Zadarma)
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Active Call / Dialpad Placeholder */}
        <div className="lg:col-span-2 space-y-8">
           <AnimatePresence mode="wait">
             {activeCall ? (
                <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-slate-900 rounded-[40px] p-10 overflow-hidden relative shadow-2xl shadow-indigo-900/40 border border-slate-800"
               >
                 <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-indigo-600/20 flex items-center justify-center mb-6 relative">
                       <div className="absolute inset-0 rounded-full border border-indigo-500/50 animate-ping"></div>
                       <MdPerson className="text-5xl text-indigo-400" />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight mb-2">{activeCall.phone}</h2>
                    <p className="text-indigo-400 font-bold uppercase tracking-[0.3em] text-xs flex items-center gap-2">
                       <MdFiberManualRecord className="text-[10px] animate-pulse" /> {activeCall.customer} - {activeCall.location}
                    </p>
                    
                    <div className="mt-12 flex items-center justify-center gap-6">
                       <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                       >
                         {isMuted ? <MdMicOff className="text-2xl" /> : <MdMic className="text-2xl" />}
                       </button>
                       <button 
                        onClick={() => setIsOnHold(!isOnHold)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isOnHold ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                       >
                         {isOnHold ? <MdPlayArrow className="text-2xl" /> : <MdPause className="text-2xl" />}
                       </button>
                       <button className="w-14 h-14 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:text-white transition-all">
                         <MdVolumeUp className="text-2xl" />
                       </button>
                    </div>

                    <div className="mt-12 w-full grid grid-cols-2 gap-4">
                       <button className="py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-3xl transition-all flex flex-col items-center gap-1">
                          <MdMessage className="text-xl text-indigo-400" />
                          <span className="text-[10px] uppercase tracking-widest">SMS YUBORISH</span>
                       </button>
                       <button 
                        onClick={handleCreateOrderFromCall}
                        className="py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-3xl transition-all flex flex-col items-center gap-1"
                       >
                          <MdAddCircle className="text-xl text-emerald-400" />
                          <span className="text-[10px] uppercase tracking-widest">BUYURTMA OCHISH</span>
                       </button>
                    </div>

                    <button 
                      onClick={() => setActiveCall(null)}
                      className="mt-10 w-20 h-20 rounded-full bg-rose-600 flex items-center justify-center shadow-xl shadow-rose-900/40 hover:scale-110 active:scale-95 transition-all text-white"
                    >
                       <MdCallEnd className="text-4xl" />
                    </button>
                 </div>
                 {/* Decorative background circle */}
                 <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
                 <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl"></div>
               </motion.div>
             ) : (
               <div className="bg-white rounded-[40px] p-10 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 min-h-[500px]">
                  <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-400">
                    <MdCall className="text-4xl" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Hozirda faol qo'ng'iroq yo'q</h3>
                  <p className="text-slate-400 mt-2 text-sm font-medium text-center max-w-xs">Tizim yangi qo'ng'iroqlarni kutmoqda. Sinov uchun tugmani bosing.</p>
                  <button 
                    onClick={handleSimulateIncomingCall}
                    className="mt-8 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-[0.2em] text-[10px]"
                  >
                    Simulyatsiya (Yangi qo'ng'iroq)
                  </button>
               </div>
             )}
           </AnimatePresence>

           <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-3">
                   <MdHistory className="text-indigo-600" /> Qo'ng'iroqlar tarixi
                </h2>
                <div className="relative">
                   <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                    placeholder="Qidirish..." 
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 transition-all" 
                   />
                </div>
             </div>
             <div className="p-0">
               <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="px-8 py-3">Raqam / Mijoz</th>
                      <th className="px-8 py-3">Turi</th>
                      <th className="px-8 py-3">Status</th>
                      <th className="px-8 py-3">Davomiyligi</th>
                      <th className="px-8 py-3 text-right">Vaqti</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {callLog.map((call) => (
                      <tr key={call.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                        <td className="px-8 py-4 font-bold text-slate-700">
                          <div className="flex flex-col">
                            <span className="text-sm">{call.phone}</span>
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{call.customer}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                           <span className={`text-[10px] font-black uppercase tracking-wider ${call.type === 'INCOMING' ? 'text-indigo-500' : 'text-slate-400'}`}>
                             {call.type === 'INCOMING' ? 'KIRUVCHI' : 'CHIQUVCHI'}
                           </span>
                        </td>
                        <td className="px-8 py-4">
                          <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${
                            call.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {call.status === 'COMPLETED' ? 'MUVAFFAQUYATLI' : 'JAVOBSIZ'}
                          </span>
                        </td>
                        <td className="px-8 py-4 font-black text-slate-400 text-xs">
                          {call.duration}
                        </td>
                        <td className="px-8 py-4 text-right font-bold text-slate-400 text-xs">
                          {call.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
           </div>
        </div>

        {/* Right Column: Customer Lookup Card */}
        <div className="space-y-6">
           <div className="bg-indigo-600 rounded-[40px] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
              <div className="relative z-10">
                 <h3 className="text-xl font-black tracking-tight mb-4">Tezkor Ma'lumot</h3>
                 <div className="space-y-4">
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                       <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Mijozlar bazasi</p>
                       <p className="text-2xl font-black">1.2k +</p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                       <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Bugun olingan buyurtmalar</p>
                       <p className="text-2xl font-black">48 ta</p>
                    </div>
                    <div className="bg-emerald-500 rounded-2xl p-4 border border-emerald-400 shadow-lg shadow-emerald-700/20">
                       <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Konversiya darajasi</p>
                       <p className="text-2xl font-black">82%</p>
                    </div>
                 </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
           </div>

           <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">Mijozni qidirish</h3>
              <div className="space-y-4">
                 <div className="relative">
                    <MdPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      placeholder="+998 90 123 45 67" 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 transition-all text-slate-700" 
                    />
                 </div>
                 <button 
                  onClick={handleLookup}
                  disabled={isLookingUp}
                  className="w-full py-4 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-900 transition-all uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-slate-900/20 disabled:opacity-50"
                 >
                    {isLookingUp ? 'Qidirilmoqda...' : 'Ma\'lumotlarni chiqarish'}
                 </button>
              </div>

              <div className="mt-8">
                 <AnimatePresence mode="wait">
                   {lookupResult === 'NOT_FOUND' ? (
                     <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-rose-50 rounded-2xl border border-dashed border-rose-200 text-center"
                     >
                       <p className="text-xs font-bold text-rose-500">Mijoz topilmadi. Yangi mijoz sifatida ro'yxatdan o'tkazing.</p>
                     </motion.div>
                   ) : lookupResult ? (
                     <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                     >
                        <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                           <div className="w-12 h-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                              <MdPerson className="text-2xl" />
                           </div>
                           <div>
                              <p className="text-sm font-black text-slate-800 tracking-tight">{lookupResult.name}</p>
                              <p className="text-[10px] font-bold text-slate-400">{lookupResult.phone}</p>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <div className="flex items-start gap-3">
                              <MdLocationOn className="text-indigo-400 mt-1 shrink-0" />
                              <p className="text-xs font-medium text-slate-600 leading-relaxed">{lookupResult.address}</p>
                           </div>
                        </div>

                        <div className="pt-4 border-t border-slate-50">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Buyurtmalar tarixi</p>
                           <div className="space-y-3">
                              {lookupResult.history.map((order: any) => (
                                <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all cursor-pointer">
                                   <div className="flex items-center gap-3">
                                      <MdAccessTime className="text-slate-400" />
                                      <div>
                                         <p className="text-[10px] font-black text-slate-700">{order.date}</p>
                                         <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-tighter">{order.status}</p>
                                      </div>
                                   </div>
                                   <p className="text-[10px] font-black text-slate-800">{order.total} so'm</p>
                                </div>
                              ))}
                           </div>
                        </div>

                        <button 
                          onClick={() => {
                            const params = new URLSearchParams({
                              phone: lookupResult.phone,
                              name: lookupResult.name,
                              address: lookupResult.address
                            });
                            router.push(`/operator/orders?${params.toString()}`);
                          }}
                          className="w-full py-3 bg-emerald-50 text-emerald-600 font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all"
                        >
                          Ushbu mijozga buyurtma ochish
                        </button>
                     </motion.div>
                   ) : (
                     <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                        <p className="text-xs font-bold text-slate-400">Raqam kiritilganda ushbu yerda mijoz tarixi va manzillari paydo bo'ladi.</p>
                     </div>
                   )}
                 </AnimatePresence>
              </div>
           </div>
        </div>
      </div>

      <Modal 
        isOpen={isDialpadOpen} 
        onClose={() => setIsDialpadOpen(false)} 
        title="Raqam Terish"
      >
        <div className="flex flex-col items-center">
          <div className="w-full bg-slate-50 p-6 rounded-3xl mb-8 border border-slate-100 text-center">
             <p className="text-2xl font-black text-slate-800 tracking-widest min-h-[40px]">{dialNum || 'Raqam kiriting...'}</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 w-full max-w-[300px]">
            {['1','2','3','4','5','6','7','8','9','*','0','#'].map(num => (
              <button 
                key={num}
                onClick={() => handleDial(num)}
                className="w-full aspect-square rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-xl font-bold text-slate-600 hover:bg-slate-50 hover:border-indigo-200 transition-all font-mono active:scale-95"
              >
                {num}
              </button>
            ))}
          </div>

          <div className="mt-8 flex gap-3 w-full">
             <button 
              onClick={() => setDialNum('')}
              className="flex-1 py-4 bg-slate-100 text-slate-400 font-bold rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs"
             >
               Tozalash
             </button>
             <button 
              onClick={handleStartCall}
              className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
             >
               <MdCall className="text-xl" />
               QO'NG'IROQ QILISH
             </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function MdFiberManualRecord({ className }: { className?: string }) {
  return (
    <svg 
      stroke="currentColor" 
      fill="currentColor" 
      strokeWidth="0" 
      viewBox="0 0 24 24" 
      className={className}
      height="1em" 
      width="1em" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="8"></circle>
    </svg>
  );
}
