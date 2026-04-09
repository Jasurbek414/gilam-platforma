'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MdNotifications, MdSearch, MdPayment, MdSettings, MdSecurity, MdDoneAll } from 'react-icons/md';

import { notificationsApi, getUser } from '@/lib/api';
import { User, Notification } from '@/types';

export default function Topbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);

  const loadNotifications = useCallback(async (currentUser: User) => {
    try {
      let data: Notification[] = [];
      if (currentUser.role === 'SUPER_ADMIN') {
        data = await notificationsApi.getSuperadmin();
      } else if (currentUser.companyId) {
        data = await notificationsApi.getByCompany(currentUser.companyId);
      } else if (currentUser.id) {
        data = await notificationsApi.getByUser(currentUser.id);
      }
      setNotifications(data || []);
    } catch {
      // Sessiya tugagan yoki xato — tinch o'tkazib yuboramiz
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    if (currentUser) {
      loadNotifications(currentUser);
      const interval = setInterval(() => loadNotifications(currentUser), 15000);
      return () => clearInterval(interval);
    }
  }, [loadNotifications]);

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

  const markAllAsRead = async () => {
    try {
      if (user?.role === 'SUPER_ADMIN') {
        await notificationsApi.markAllAsReadSuperAdmin();
      } else if (user?.companyId) {
        await notificationsApi.markAllAsReadCompany(user.companyId);
      }
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (e) { console.error(e); }
  };

  const markAsRead = async (id: string, currentlyRead: boolean) => {
    if (currentlyRead) return;
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) { console.error(e); }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment': return <MdPayment className="text-emerald-500" />;
      case 'security': return <MdSecurity className="text-amber-500" />;
      default: return <MdSettings className="text-blue-500" />;
    }
  };

  return (
    <div className="flex items-center justify-between w-full gap-3">
      {/* Search — hidden on small, shown on md+ */}
      <div className="hidden md:flex items-center bg-slate-100/50 rounded-full px-4 py-2 flex-1 max-w-sm border border-slate-200/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
        <MdSearch className="text-slate-400 text-lg flex-shrink-0" />
        <input
          type="text"
          placeholder="Qidirish..."
          className="bg-transparent border-none outline-none text-sm w-full ml-2 text-slate-700 placeholder-slate-400"
        />
      </div>

      <div className="flex items-center gap-3 lg:gap-6 ml-auto">
        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 lg:p-2.5 rounded-xl transition-all ${showNotifications ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'}`}
          >
            <MdNotifications className="text-xl lg:text-2xl" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-80 lg:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right max-h-[80vh]">
              <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Bildirishnomalar</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <MdDoneAll /> {"Hammasini o'qish"}
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id, n.isRead)}
                      className={`p-4 flex gap-4 cursor-pointer hover:bg-slate-50 transition-colors relative border-b border-slate-50 ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                    >
                      {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.isRead ? 'bg-slate-100' : 'bg-white shadow-sm'}`}>
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-tight ${!n.isRead ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                          {n.message}
                        </p>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 block uppercase">
                          {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center">
                    <MdNotifications className="text-4xl text-slate-100 mx-auto mb-2" />
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{"Yangi bildirishnomalar yo'q"}</p>
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-slate-50 bg-slate-50/30">
                <button className="w-full py-2 text-center text-xs font-black text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">
                  {"Barcha bildirishnomalarni ko'rish"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        {user && (
          <div className="flex items-center gap-2 lg:gap-3 lg:border-l lg:border-slate-200 lg:pl-6 cursor-pointer group">
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform text-sm">
              {user.fullName[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-black text-slate-800 leading-tight">{user.fullName}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                {user.role === 'SUPER_ADMIN' ? 'Super Admin' : (user.company?.name || user.role)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
