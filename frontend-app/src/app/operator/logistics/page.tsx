'use client';

import React, { useState } from 'react';
import { 
  MdLocalShipping, 
  MdMap, 
  MdChat, 
  MdNotificationsActive, 
  MdLocationOn, 
  MdSpeed, 
  MdQueryBuilder,
  MdSend,
  MdPhone,
  MdTrendingUp,
  MdTimeline,
  MdDirectionsCar,
  MdInfo,
  MdCalendarToday,
  MdDateRange
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import { Suspense, useEffect } from 'react';

function LogisticsContent() {
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [statFilter, setStatFilter] = useState('daily'); // daily, weekly, monthly, custom
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const router = useRouter();
  const searchParams = useSearchParams();
  const driverId = searchParams.get('driverId');
  
  const [driverMessages, setDriverMessages] = useState<any>({
    1: [
      { id: 1, text: "Mijoz telefoniga javob bermayapti, 2-marotaba qo'ng'iroq qildim.", sender: 'driver', time: '12:30' },
      { id: 2, text: "Tushunarli, biz qayta aloqaga chiqamiz. Yo'lda davom etavering.", sender: 'operator', time: '12:32' }
    ],
    2: [
      { id: 1, text: "Yunusobodda tirbandlik juda kuchli, 15 minut kechikaman.", sender: 'driver', time: '13:05' }
    ]
  });

  const drivers = [
    { id: 1, name: 'Sardor Rahimov', status: 'BUYURTMA OLMOQDA', phone: '+998 90 111 22 33', car: 'Damas (01 A 123 BA)', load: '65%', location: 'Chilonzor 9-kvartal' },
    { id: 2, name: 'Jamshid Karimov', status: 'YETKAZIB BERMOQDA', phone: '+998 90 444 55 66', car: 'Labo (01 B 456 CA)', load: '20%', location: 'Yunusobod 4-mavze' },
    { id: 3, name: 'Bekzod Aliyev', status: 'BO\'SH', phone: '+998 93 777 88 99', car: 'Damas (01 C 789 DA)', load: '0%', location: 'Qo\'yliq bozori' },
    { id: 4, name: 'Otabek G\'ulomov', status: 'OVQATLANISHDA', phone: '+998 94 000 11 22', car: 'Damas (01 D 000 EA)', load: '100%', location: 'Markaziy ofis' },
  ];

  useEffect(() => {
    if (driverId) {
      const driver = drivers.find(d => d.id === parseInt(driverId));
      if (driver) setSelectedDriver(driver);
    }
  }, [driverId]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedDriver) return;
    const newMessage = {
      id: Date.now(),
      text: message,
      sender: 'operator',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setDriverMessages((prev: any) => ({
      ...prev,
      [selectedDriver.id]: [...(prev[selectedDriver.id] || []), newMessage]
    }));
    setMessage('');
    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        text: "Xo'p bo'ladi, tushundim. ✅",
        sender: 'driver',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setDriverMessages((prev: any) => ({
        ...prev,
        [selectedDriver.id]: [...(prev[selectedDriver.id] || []), reply]
      }));
    }, 2000);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage = { id: Date.now(), text: `📢 UMUMIY XABAR: ${broadcastMessage}`, sender: 'operator', time: time };
    const newMessages = { ...driverMessages };
    drivers.forEach(driver => {
      newMessages[driver.id] = [...(newMessages[driver.id] || []), newMessage];
    });
    setDriverMessages(newMessages);
    setBroadcastMessage('');
    setIsBroadcastModalOpen(false);
  };

  const handleCallDriver = (phone: string) => {
    const params = new URLSearchParams({ phone: phone });
    router.push(`/operator/calls?${params.toString()}`);
  };

  // Simulated Statistics calculation
  const getSimulatedStats = () => {
    const base = { speed: 42, active: '6s 12d', orders: 15, fuel: '24L' };
    if (statFilter === 'weekly') return { speed: 38, active: '42s 15d', orders: 84, fuel: '156L' };
    if (statFilter === 'monthly') return { speed: 40, active: '180s 0d', orders: 320, fuel: '640L' };
    if (statFilter === 'custom') return { speed: 41, active: 'Ma\'lumot kutilmoqda', orders: '-', fuel: '-' };
    return base;
  };

  const currentStats = getSimulatedStats();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-[1600px] p-6 space-y-6">
        {/* HEADER */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between px-8 py-6">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <MdLocalShipping className="text-indigo-600" /> Logistika Markazi
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Haydovchilar bilan tezkor muloqot va monitoring</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-4 bg-slate-50 text-slate-500 font-bold rounded-[20px] hover:bg-slate-100 transition-all">
              <MdMap className="text-xl" /> Xarita
            </button>
            <button 
              onClick={() => setIsBroadcastModalOpen(true)}
              className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white font-black rounded-[20px] shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all"
            >
              <MdNotificationsActive className="text-xl" /> Umumiy xabar
            </button>
          </div>
        </div>

        <div className="flex gap-6 h-[calc(100vh-210px)] max-h-[850px]">
          {/* DRIVER LIST - LEFT */}
          <div className="w-[320px] bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col overflow-hidden shrink-0">
            <div className="p-6 border-b border-slate-50">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faol Haydovchilar ({drivers.length})</span>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto flex-1 scrollbar-hide">
              {drivers.map((driver) => (
                <div 
                  key={driver.id} 
                  onClick={() => setSelectedDriver(driver)}
                  className={`p-4 rounded-[28px] border transition-all cursor-pointer relative overflow-hidden ${
                    selectedDriver?.id === driver.id 
                      ? 'border-indigo-500 bg-indigo-50/10 shadow-lg shadow-indigo-500/5' 
                      : 'border-slate-100 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${
                      selectedDriver?.id === driver.id ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'
                    }`}>
                      {driver.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black text-slate-800 truncate">{driver.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          driver.status === 'BO\'SH' ? 'bg-emerald-500' :
                          driver.status === 'BUYURTMA OLMOQDA' ? 'bg-amber-500' : 'bg-blue-500'
                        }`}></div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter truncate">{driver.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DETAIL AREA (CHAT + INFO) - RIGHT */}
          <div className="flex-1 flex gap-6 min-w-0">
            {/* CHAT WINDOW */}
            <div className="flex-1 bg-slate-900 rounded-[40px] text-white relative overflow-hidden flex flex-col border border-slate-800 shadow-2xl shadow-indigo-900/10">
              {selectedDriver ? (
                <div className="flex flex-col flex-1 h-full p-8 relative z-10">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-indigo-400 border border-white/5 uppercase">
                        {selectedDriver.name[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-black tracking-tight leading-none">{selectedDriver.name}</h3>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mt-2 italic">Haydovchi bilan muloqot</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleCallDriver(selectedDriver.phone)}
                      className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-emerald-500 hover:text-white text-emerald-400 transition-all border border-white/5"
                    >
                      <MdPhone className="text-2xl" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto mb-6 pr-2 scrollbar-hide flex flex-col">
                    {(driverMessages[selectedDriver.id] || []).map((msg: any) => (
                      <div 
                        key={msg.id} 
                        className={`rounded-2xl p-4 border max-w-[85%] ${
                          msg.sender === 'operator' 
                            ? 'bg-indigo-600 border-indigo-500 self-end ml-auto' 
                            : 'bg-white/5 border-white/10 self-start'
                        }`}
                      >
                        <p className="text-xs font-medium">{msg.text}</p>
                        <span className={`text-[9px] font-black uppercase mt-2 block ${msg.sender === 'operator' ? 'text-white/50' : 'text-indigo-400'}`}>
                          {msg.time} • {msg.sender === 'operator' ? 'Operator' : 'Haydovchi'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="mt-auto relative">
                    <input 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Haydovchiga xabar yozing..."
                      className="w-full bg-white/5 border border-white/10 rounded-[22px] px-6 py-4 pr-14 text-sm font-medium focus:border-indigo-500 outline-none transition-all placeholder:text-white/20"
                    />
                    <button 
                      type="submit"
                      disabled={!message.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 rounded-[15px] flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <MdSend className="text-xl" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-20 h-20 bg-white/5 rounded-[30px] flex items-center justify-center mb-6 text-white/20">
                    <MdChat className="text-4xl" />
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight">Xabarlar oynasi</h3>
                  <p className="text-white/20 mt-2 text-sm font-medium max-w-[200px]">Muloqotni boshlash uchun haydovchini tanlang</p>
                </div>
              )}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            </div>

            {/* INFO SIDEBAR - RIGHT (Enhanced with Statistics Filter) */}
            <div className="w-[340px] bg-white rounded-[40px] border border-slate-100 shadow-sm flex flex-col overflow-hidden shrink-0">
              <div className="p-6 border-b border-slate-50 flex items-center gap-2">
                <MdInfo className="text-indigo-600 text-xl" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Haydovchi tahlili</span>
              </div>
              
              <div className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-hide">
                {selectedDriver ? (
                  <>
                    <div className="space-y-4">
                      {/* Transport Card */}
                      <div className="p-4 bg-slate-50 rounded-[24px] border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-indigo-500 shadow-sm border border-slate-50">
                            <MdDirectionsCar className="text-lg" />
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transport</span>
                        </div>
                        <p className="text-sm font-black text-slate-700 leading-tight">{selectedDriver.car}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1">
                          <MdLocationOn className="text-sm text-emerald-500" /> {selectedDriver.location}
                        </p>
                      </div>

                      {/* STATS ANALYZER SECTION */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Statistika filtri</span>
                        </div>
                        
                        {/* Period Filter Tabs */}
                        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-2xl mb-4">
                          {[
                            { id: 'daily', label: 'Kun' },
                            { id: 'weekly', label: 'Hafta' },
                            { id: 'monthly', label: 'Oy' },
                            { id: 'custom', label: 'Sana' }
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setStatFilter(tab.id)}
                              className={`py-2 text-[10px] font-black rounded-xl transition-all ${
                                statFilter === tab.id 
                                  ? 'bg-white text-indigo-600 shadow-sm' 
                                  : 'text-slate-400 hover:text-slate-600'
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>

                        {/* Custom Date Range Picker */}
                        <AnimatePresence>
                          {statFilter === 'custom' && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden space-y-2 mb-4"
                            >
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-slate-400 uppercase px-2">Dan</label>
                                  <input 
                                    type="date" 
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-2 py-2 text-[10px] font-bold outline-none focus:border-indigo-500"
                                    value={dateRange.from}
                                    onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[8px] font-black text-slate-400 uppercase px-2">Gacha</label>
                                  <input 
                                    type="date" 
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-2 py-2 text-[10px] font-bold outline-none focus:border-indigo-500"
                                    value={dateRange.to}
                                    onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Stats Display Cards */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-4 bg-indigo-50/50 rounded-[24px] border border-indigo-100/50 flex flex-col justify-between h-28">
                            <MdSpeed className="text-indigo-600 text-xl" />
                            <div>
                              <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Tezlik</p>
                              <p className="text-sm font-black text-slate-800 tracking-tight">{currentStats.speed} km/h</p>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-amber-50/50 rounded-[24px] border border-amber-100/50 flex flex-col justify-between h-28">
                            <MdQueryBuilder className="text-amber-500 text-xl" />
                            <div>
                              <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-1">Aktivlik</p>
                              <p className="text-sm font-black text-slate-800 tracking-tight">{currentStats.active}</p>
                            </div>
                          </div>

                          <div className="p-4 bg-emerald-50/50 rounded-[24px] border border-emerald-100/50 flex flex-col justify-between h-28">
                            <MdTrendingUp className="text-emerald-600 text-xl" />
                            <div>
                              <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-1">Buyurtmalar</p>
                              <p className="text-sm font-black text-slate-800 tracking-tight">{currentStats.orders}</p>
                            </div>
                          </div>

                          <div className="p-4 bg-slate-50 rounded-[24px] border border-slate-100 flex flex-col justify-between h-28">
                            <MdLocalShipping className="text-slate-400 text-xl" />
                            <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Yoqilg'i</p>
                              <p className="text-sm font-black text-slate-800 tracking-tight">{currentStats.fuel}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50">
                      <button className="w-full py-4 bg-slate-50 text-slate-400 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                         <MdTimeline className="text-lg" /> Batafsil Hisobot
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 grayscale opacity-30">
                    <MdTimeline className="text-6xl mb-4 text-slate-200" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Tahlil qilish uchun<br/>haydovchini tanlang</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Modal 
          isOpen={isBroadcastModalOpen} 
          onClose={() => setIsBroadcastModalOpen(false)} 
          title="Umumiy xabar yuborish"
        >
          <form onSubmit={handleSendBroadcast} className="space-y-6">
            <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 mb-6">
              <p className="text-xs font-bold text-indigo-600 leading-relaxed">
                Ushbu xabar bir vaqtning o'zida barcha faol haydovchilarga yuboriladi. 
                Uchrashuv, e'lon yoki favqulodda xabarlar uchun foydalaning.
              </p>
            </div>
            <textarea 
              required
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Xabar matnini kiriting..."
              className="w-full h-40 p-6 bg-slate-50 border border-slate-100 rounded-[25px] outline-none focus:border-indigo-500 transition-all font-medium text-slate-700 resize-none shadow-inner"
            />
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-400 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-[10px]"
              >
                Bekor qilish
              </button>
              <button 
                type="submit"
                className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
              >
                <MdSend className="text-lg" /> JAMIY YUBORISH
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

export default function OperatorLogisticsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LogisticsContent />
    </Suspense>
  );
}
