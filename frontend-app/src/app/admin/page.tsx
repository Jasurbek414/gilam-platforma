'use client';

import React, { useState } from 'react';
import { MdTrendingUp, MdBusiness, MdPeople, MdAttachMoney } from 'react-icons/md';
import { motion } from 'framer-motion';

const chartData = [
  { month: 'Yan', value: 45 },
  { month: 'Feb', value: 52 },
  { month: 'Mar', value: 48 },
  { month: 'Apr', value: 61 },
  { month: 'May', value: 55 },
  { month: 'Iyun', value: 67 },
  { month: 'Iyul', value: 72 },
];

function GrowthChart() {
  const maxVal = Math.max(...chartData.map(d => d.value));
  const height = 200;
  const width = 500;
  const padding = 40;

  const points = chartData.map((d, i) => ({
    x: (i * (width - padding * 2)) / (chartData.length - 1) + padding,
    y: height - (d.value / maxVal) * (height - padding * 2) - padding,
  }));

  const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
  const areaD = `${pathD} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`;

  return (
    <div className="w-full h-full flex flex-col pt-4">
      <div className="flex-1 relative min-h-[250px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid lines */}
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1={padding}
              y1={padding + (i * (height - padding * 2)) / 3}
              x2={width - padding}
              y2={padding + (i * (height - padding * 2)) / 3}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
          ))}

          {/* Area under the line */}
          <motion.path
            d={areaD}
            fill="url(#gradient)"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ originY: 1 }}
          />

          {/* Line path */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Points */}
          {points.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#fff"
              stroke="#3b82f6"
              strokeWidth="2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 0.1 }}
              whileHover={{ scale: 1.5, r: 6 }}
            />
          ))}

          {/* X axis labels */}
          {chartData.map((d, i) => (
            <text
              key={i}
              x={points[i].x}
              y={height - 5}
              textAnchor="middle"
              className="text-[10px] font-bold fill-slate-400"
            >
              {d.month}
            </text>
          ))}

          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-widest px-2">
        <span>Yanvar</span>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Oylik o'sish %</span>
          </div>
        </div>
        <span>Iyul</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const revenueData = {
    daily: 1200,
    weekly: 8400,
    monthly: 12400
  };

  const [stats, setStats] = useState([
    { id: 'companies', label: 'Jami Korxonalar', value: 1248, icon: MdBusiness, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { id: 'staff', label: 'Faol Xodimlar', value: 3892, icon: MdPeople, color: 'text-blue-600', bg: 'bg-blue-100' },
    { id: 'orders', label: 'Bugungi Buyurtmalar', value: 450, icon: MdTrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { id: 'revenue', label: 'Tushum', value: revenueData.monthly, icon: MdAttachMoney, color: 'text-amber-600', bg: 'bg-amber-100' },
  ]);

  // Update revenue stat when period changes
  const currentRevenue = revenueData[period];

  const handleDownloadReport = () => {
    setIsDownloading(true);
    
    // Simulating a download delay
    setTimeout(() => {
      // Create CSV content from stats
      const headers = ['Ko\'rsatkich', 'Qiymat'];
      const rows = stats.map(s => [s.label, s.id === 'revenue' ? currentRevenue : s.value]);
      const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
      
      // Create blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `hisobot_${startDate}_${endDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsDownloading(false);
      alert('Hisobot CSV formatida muvaffaqiyatli tayyorlandi va yuklab olindi! ✅');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold border-b-2 border-blue-500 inline-block pb-1 text-slate-800">
            Super Admin Statistikasi
          </h1>
          <p className="text-slate-500 mt-2">Ma'lumotlar real vaqtda yangilanmoqda...</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                  period === p 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {p === 'daily' ? 'KUNLIK' : p === 'weekly' ? 'HAFTALIK' : 'OYLIK'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Dan</span>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none transition-all"
              />
            </div>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Gacha</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none transition-all"
              />
            </div>
          </div>

          <button 
            onClick={handleDownloadReport}
            disabled={isDownloading}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black shadow-lg hover:shadow-slate-900/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:translate-y-0"
          >
            {isDownloading ? 'TAYYORLANMOQDA...' : 'CSV YUKLASH'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const displayValue = stat.id === 'revenue' ? `$${currentRevenue.toLocaleString()}` : stat.value.toLocaleString();
          const displayLabel = stat.id === 'revenue' 
            ? `${period === 'daily' ? 'Kunlik' : period === 'weekly' ? 'Haftalik' : 'Oylik'} Tushum`
            : stat.label;

          return (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{displayLabel}</p>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">{displayValue}</h3>
                  </div>
                  <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="text-2xl" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-emerald-600 font-medium tracking-tight">
                  <MdTrendingUp className="mr-1" />
                  <span>+12.5% o'tgan davrdan</span>
                </div>
              </div>
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${stat.bg} opacity-5 rounded-full`}></div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Oxirgi Oylik O'sish Grafik</h3>
          <div className="flex items-center justify-center h-[300px] border-2 border-slate-50 rounded-xl bg-slate-50/30 p-4">
            <GrowthChart />
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Yangi qo'shilgan Korxonalar</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                    K{i}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">"Pokiza" MChJ</p>
                    <p className="text-xs text-slate-500">Toshkent sh.</p>
                  </div>
                </div>
                <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
