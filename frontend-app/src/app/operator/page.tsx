'use client';

import React, { useState, useEffect } from 'react';
import { 
  MdCall, 
  MdShoppingCart, 
  MdLocalShipping, 
  MdVerifiedUser, 
  MdTrendingUp, 
  MdHistory,
  MdFiberManualRecord
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

import { useRouter } from 'next/navigation';

export default function OperatorDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { title: 'Bugungi Qo\'ng\'iroqlar', value: '124', change: '+12%', icon: <MdCall className="text-indigo-400" />, color: 'bg-indigo-50' },
    { title: 'Yangi Buyurtmalar', value: '42', change: '+5%', icon: <MdShoppingCart className="text-emerald-400" />, color: 'bg-emerald-50' },
    { title: 'Yo\'ldagi Haydovchilar', value: '8', change: 'Faol', icon: <MdLocalShipping className="text-amber-400" />, color: 'bg-amber-50' },
    { title: 'Xursand Mijozlar', value: '98%', change: 'NPS', icon: <MdVerifiedUser className="text-rose-400" />, color: 'bg-rose-50' },
  ];

  const recentCalls = [
    { id: 1, phone: '+998 90 123 45 67', customer: 'Aliyev Vali', status: 'COMPLETED', time: '18:15' },
    { id: 2, phone: '+998 93 321 65 43', customer: 'Unknown', status: 'MISSED', time: '17:45' },
    { id: 3, phone: '+998 90 999 88 77', customer: 'Karimov Anvar', status: 'COMPLETED', time: '17:20' },
  ];

  // Helper for simulated data
  const getChartData = () => {
    if (timeRange === 'today') {
      return {
        labels: ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
        values: [45, 60, 30, 80, 55, 90, 70, 40, 65, 85, 50, 75]
      };
    } else if (timeRange === 'week') {
      return {
        labels: ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sha', 'Yak'],
        values: [70, 85, 60, 95, 80, 40, 30]
      };
    } else {
      return {
        labels: ['1-hafta', '2-hafta', '3-hafta', '4-hafta'],
        values: [65, 80, 75, 90]
      };
    }
  };

  const chartData = getChartData();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Xayrli kech, Operator! 👋</h1>
          <p className="text-slate-500 font-medium mt-1">Ko'rsatkichlar va jonli holatlar paneli</p>
        </div>
        <div className="text-right relative z-10">
          <p className="text-4xl font-black text-indigo-600 tracking-tighter">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">{currentTime.toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
          >
            <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.title}</p>
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
              <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg">
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Call Feed */}
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-3">
              <MdTrendingUp className="text-indigo-600" /> Faoliyat Grafigi
            </h2>
            <div className="flex bg-slate-50 p-1 rounded-xl gap-1">
               <button 
                onClick={() => setTimeRange('today')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === 'today' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 Kunlik
               </button>
               <button 
                onClick={() => setTimeRange('week')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === 'week' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 Haftalik
               </button>
               <button 
                onClick={() => setTimeRange('month')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 Oylik
               </button>
            </div>
          </div>
          <div className="p-8 flex-1 flex flex-col justify-end min-h-[300px]">
             <div className="flex items-end gap-3 h-full">
                <AnimatePresence mode="popLayout">
                  {chartData.values.map((val, i) => (
                    <div key={`${timeRange}-${i}`} className="flex-1 flex flex-col items-center gap-2 group">
                       <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: `${val}%`, opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={`w-full rounded-t-xl transition-all ${i === chartData.values.length - 1 ? 'bg-indigo-600' : 'bg-indigo-100 group-hover:bg-indigo-200'}`}
                       ></motion.div>
                       <span className="text-[8px] font-black text-slate-300 uppercase whitespace-nowrap">{chartData.labels[i]}</span>
                    </div>
                  ))}
                </AnimatePresence>
             </div>
          </div>
        </div>

        {/* Recent Notifications / Calls */}
        <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-900/20">
           <div className="relative z-10 h-full flex flex-col">
              <h2 className="text-lg font-black tracking-tight mb-6 flex items-center gap-3">
                <MdHistory className="text-indigo-400" /> So'nggi Qo'ng'iroqlar
              </h2>
              <div className="space-y-4 flex-1">
                {recentCalls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${call.status === 'COMPLETED' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {call.customer[0]}
                      </div>
                      <div>
                        <p className="text-sm font-black tracking-tight">{call.phone}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{call.customer}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-500 mb-1">{call.time}</p>
                       <MdFiberManualRecord className={call.status === 'COMPLETED' ? 'text-emerald-500' : 'text-rose-500'} />
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => router.push('/operator/calls')}
                className="mt-8 w-full py-4 bg-indigo-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all"
              >
                Barcha Tarixni Ko'rish
              </button>
           </div>
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        </div>
      </div>
    </div>
  );
}
