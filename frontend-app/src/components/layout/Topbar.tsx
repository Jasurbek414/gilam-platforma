'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MdNotifications, MdSearch, MdPayment, MdSettings, MdSecurity, MdDoneAll } from 'react-icons/md';

export default function Topbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: '"Pokiza" MChJ oylik to\'lovni amalga oshirdi', time: '5 daqiqa oldin', type: 'payment', isRead: false },
    { id: 2, text: 'Tizimda yangi korxona ("Nur Gilam") ro\'yxatdan o\'tdi', time: '1 soat oldin', type: 'system', isRead: false },
    { id: 3, text: 'Alisher Otabekov profil ma\'lumotlarini yangiladi', time: '3 soat oldin', type: 'security', isRead: true },
    { id: 4, text: '"Toza Makon" korxonasi balansi kamayib bormoqda', time: '5 soat oldin', type: 'system', isRead: false },
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment': return <MdPayment className="text-emerald-500" />;
      case 'security': return <MdSecurity className="text-amber-500" />;
      default: return <MdSettings className="text-blue-500" />;
    }
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center bg-slate-100/50 rounded-full px-4 py-2 w-96 border border-slate-200/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
        <MdSearch className="text-slate-400 text-xl" />
        <input 
          type="text" 
          placeholder="Qidirish (korxona, buyurtma, telefon)..." 
          className="bg-transparent border-none outline-none text-sm w-full ml-2 text-slate-700 placeholder-slate-400"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2.5 rounded-xl transition-all ${showNotifications ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'}`}
          >
            <MdNotifications className="text-2xl" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 lg:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
              <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Bildirishnomalar</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <MdDoneAll /> Hammasini o'qish
                  </button>
                )}
              </div>
              
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-4 flex gap-4 cursor-pointer hover:bg-slate-50 transition-colors relative border-b border-slate-50 ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                    >
                      {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.isRead ? 'bg-slate-100' : 'bg-white shadow-sm'}`}>
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm leading-tight ${!n.isRead ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                          {n.text}
                        </p>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 block uppercase">
                          {n.time}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center">
                    <MdNotifications className="text-4xl text-slate-100 mx-auto mb-2" />
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Yangi bildirishnomalar yo'q</p>
                  </div>
                )}
              </div>
              
              <div className="p-3 border-t border-slate-50 bg-slate-50/30">
                <button className="w-full py-2 text-center text-xs font-black text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">
                  Barcha bildirishnomalarni ko'rish
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 border-l border-slate-200 pl-6 cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            A
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-black text-slate-800 leading-tight">Admin User</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Super Admin Panel</p>
          </div>
        </div>
      </div>
    </header>
  );
}
