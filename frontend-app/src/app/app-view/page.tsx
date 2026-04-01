import React from 'react';
import { MdTrendingFlat, MdOutlineTimer, MdCheckCircle } from 'react-icons/md';

export default function MobileTaskView() {
  const currentTasks = [
    { id: '1', name: 'Alisher Otabekov', phone: '+998 90 111 22 33', address: 'Yunusobod 4-daha, 12-uy', items: '2 ta gilam (tahminan 10 kv.m)', time: '14:30 - bugun', status: 'olish_kerak' },
    { id: '2', name: 'Zilola', phone: '+998 94 444 55 66', address: 'Qibray tumani, markaz', items: '1 ta parda, 3 ta adyol', time: 'Yetkazib berish (tayyor)', status: 'yetkazish_kerak', ready: true },
  ];

  return (
    <div className="p-4 space-y-4 relative pb-20">
      
      {/* Top action card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/30">
        <h2 className="text-sm font-medium opacity-90 mb-1">Joriy Holat: Liniyada</h2>
        <div className="flex items-end justify-between">
          <p className="text-3xl font-black">2 ta</p>
          <p className="text-sm font-medium opacity-90 flex items-center gap-1">
            <MdOutlineTimer className="text-lg" />
            Faol vazifa qoldi
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 mt-6 mb-2">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Vazifalar Ro'yxati</h3>
        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-md">Bugun</span>
      </div>

      {/* Task Cards */}
      <div className="space-y-3">
        {currentTasks.map((task) => (
          <div key={task.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3 active:scale-[0.98] transition-transform">
            
            <div className="flex justify-between items-start">
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                task.ready ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {task.ready ? 'ETKAZIB BERISH 🚚' : 'OLISH KERAK 📥'}
              </span>
              <span className="text-xs font-bold text-slate-400">{task.time}</span>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-800 text-[15px]">{task.name}</h4>
              <p className="text-[13px] text-slate-500 font-medium break-words leading-tight mt-0.5">{task.address}</p>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <p className="text-xs font-bold text-slate-700 mb-1">Buyurtma:</p>
              <p className="text-xs text-slate-500">{task.items}</p>
            </div>

            <div className="flex gap-2 pt-1 border-t border-slate-50 mt-1">
              <button className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl text-sm font-bold active:bg-slate-200 transition-colors">
                Qo'ng'iroq
              </button>
              <button className={`flex-1 flex items-center justify-center gap-1 py-3 rounded-xl text-sm font-bold text-white transition-colors shadow-md ${
                task.ready ? 'bg-emerald-500 active:bg-emerald-600 shadow-emerald-500/30' : 'bg-blue-600 active:bg-blue-700 shadow-blue-500/30'
              }`}>
                {task.ready ? 'Topshirish' : 'Qabul Qilish'}
                <MdTrendingFlat className="text-lg" />
              </button>
            </div>
            
          </div>
        ))}
      </div>

      {/* Empty State Mock */}
      <div className="mt-8 text-center opacity-50 space-y-2">
        <MdCheckCircle className="text-4xl mx-auto text-slate-400" />
        <p className="text-sm font-medium text-slate-500">Boshqa vazifa yo'q</p>
      </div>

    </div>
  );
}
