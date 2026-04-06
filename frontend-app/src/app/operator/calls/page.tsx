'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import {
  MdCall, MdCallEnd, MdPerson, MdPhone, MdSearch, MdHistory,
  MdMic, MdMicOff, MdPause, MdPlayArrow, MdDialpad, MdSettings,
  MdBackspace, MdNotificationsActive, MdArrowForward, MdFiberManualRecord
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { callsApi, getUser } from '@/lib/api';
import { useSip } from '@/hooks/useSip';

// --- TYPES ---
type CallStatus = 'COMPLETED' | 'MISSED' | 'BUSY' | 'IN_PROGRESS' | 'CONNECTED' | 'RINGING' | 'ANSWERED' | 'REJECTED';
interface CallRecord {
  id: string; callerPhone: string; customer?: { fullName: string }; status: CallStatus; durationSeconds: number; startedAt: string;
}

// --- STYLES ---
const STATUS_STLYES: Record<CallStatus, string> = {
  COMPLETED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  MISSED: 'bg-rose-50 text-rose-600 border-rose-100',
  BUSY: 'bg-amber-50 text-amber-600 border-amber-100',
  IN_PROGRESS: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  CONNECTED: 'bg-indigo-600 text-white border-indigo-500',
  ANSWERED: 'bg-blue-50 text-blue-600 border-blue-100',
  RINGING: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  REJECTED: 'bg-slate-50 text-slate-500 border-slate-100',
};

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
  <div className="flex items-center gap-4 mb-4">
    <div className="w-9 h-9 bg-white/60 border border-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
      <Icon className="text-xl" />
    </div>
    <div className="min-w-0">
      <h2 className="text-[11px] font-black text-slate-800 tracking-tight leading-none uppercase truncate">{title}</h2>
      {subtitle && <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1.5 truncate">{subtitle}</p>}
    </div>
  </div>
);

function formatDuration(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function OperatorCallsContent() {
  const [isMuted, setIsMuted] = useState(false);
  const [dialNum, setDialNum] = useState('');
  const [listFilter, setListFilter] = useState('');
  const [callLog, setCallLog] = useState<CallRecord[]>([]);
  const [callsLoading, setCallsLoading] = useState(true);

  const longPressTimer = useRef<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- SIP Hook (Using Bridge by default) ---
  const sip = useSip();

  // Status rangi
  const sipStatusColor = {
    idle: 'text-slate-400',
    connecting: 'text-yellow-400 animate-pulse',
    registered: 'text-emerald-500 animate-pulse',
    error: 'text-rose-500',
    calling: 'text-yellow-400 animate-pulse',
    in_call: 'text-indigo-400 animate-pulse',
  }[sip.status];

  const sipStatusLabel = {
    idle: 'Ulanmagan',
    connecting: 'Ulanmoqda...',
    registered: `Ulandi • 101 @ 10.100.100.1`,
    error: `Xato: ${sip.error || 'SIP ulanmadi'}`,
    calling: 'Qo\'ng\'iroq kelmoqda...',
    in_call: `Qo'ng'iroqda • ${formatDuration(sip.callDuration)}`,
  }[sip.status];

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        setCallsLoading(true);
        const data = await callsApi.getAll();
        setCallLog(Array.isArray(data) ? data : ((data as any).data || []));
      } catch {
        setCallLog([]);
      } finally {
        setCallsLoading(false);
      }
    };
    fetchCalls();
  }, []);

  // Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9+*#]$/.test(e.key)) {
        if (dialNum.length < 13) setDialNum(p => p + e.key);
      } else if (e.key === 'Backspace') {
        setDialNum(p => p.slice(0, -1));
      } else if (e.key === 'Enter') {
        if (dialNum) handleMakeCall(dialNum);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialNum]);

  useEffect(() => {
    const phone = searchParams.get('phone');
    if (phone) setDialNum(phone);
  }, [searchParams]);

  const handleDial = (num: string) => dialNum.length < 13 && setDialNum(p => p + num);

  const handleMakeCall = (num: string) => {
    if (!num || sip.status !== 'registered') return;
    sip.makeCall(num);
    setDialNum('');
  };

  const handleHangup = () => {
    sip.hangup();
    setIsMuted(false);
  };

  const handleMute = () => {
    sip.toggleMute(!isMuted);
    setIsMuted(!isMuted);
  };

  const matches = useMemo(() => {
    if (!dialNum) return [];
    return callLog.filter(c => (c.callerPhone || '').replace(/\s/g, '').includes(dialNum.replace(/\s/g, ''))).slice(0, 3);
  }, [dialNum, callLog]);

  const handle0PointerDown = () => {
    longPressTimer.current = setTimeout(() => {
      handleDial('+');
      longPressTimer.current = null;
    }, 600);
  };
  const handle0PointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      handleDial('0');
      longPressTimer.current = null;
    }
  };

  const isInCall = sip.status === 'in_call' || sip.status === 'calling';

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-4 lg:gap-6 pb-12 font-sans overflow-hidden">

      {/* 1. STATUS HEADER */}
      <div className="flex items-center justify-between px-1 shrink-0">
        <div className="flex items-center gap-4 bg-white/40 backdrop-blur-xl border border-white/40 px-5 py-2.5 rounded-[22px] shadow-sm">
          <div className="flex items-center gap-3">
            <MdFiberManualRecord className={`text-[8px] ${sipStatusColor}`} />
            <h1 className="text-[8px] lg:text-[9px] font-black text-slate-800 uppercase tracking-[0.2em] opacity-70">
              {sipStatusLabel}
            </h1>
          </div>
        </div>
        <button
          onClick={async () => { try { const data = await callsApi.getAll(); setCallLog(Array.isArray(data) ? data : ((data as any).data || [])); } catch {} }}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-[8px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
        >
          Yangilash
        </button>
      </div>

      {/* 2. MAIN PANEL */}
      <div className="grid grid-cols-12 gap-4 lg:gap-6 shrink-0 items-stretch">

        {/* ACTIVE CALL / IDLE AREA */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col">
          <AnimatePresence mode="wait">
            {/* Faol qo'ng'iroq */}
            {sip.status === 'in_call' && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex-1 min-h-[400px] bg-slate-950 rounded-[32px] lg:rounded-[44px] p-8 lg:p-12 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl border border-white/5">
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-[32px] border border-white/5 flex items-center justify-center mb-8 relative">
                    <MdPerson className="text-4xl text-white/10" />
                    <div className="absolute inset-0 rounded-[32px] border border-indigo-500/20 animate-ping" />
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-black text-white tracking-widest font-mono mb-3">
                    {formatDuration(sip.callDuration)}
                  </h2>
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] px-5 py-2 bg-white/5 rounded-full">
                    Qo'ng'iroqda
                  </p>
                  <div className="flex gap-4 lg:gap-6 mt-12 lg:mt-16">
                    <button onClick={handleMute}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-amber-500 text-white scale-110 shadow-lg' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}>
                      <MdMicOff size={24}/>
                    </button>
                    <button onClick={handleHangup}
                      className="w-18 h-18 lg:w-22 lg:h-22 bg-rose-600 text-white rounded-[28px] lg:rounded-[36px] flex items-center justify-center shadow-xl shadow-rose-900/40 hover:scale-105 active:scale-95 transition-all">
                      <MdCallEnd className="text-3xl lg:text-4xl"/>
                    </button>
                    <button className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 text-white/30 hover:bg-white/10 transition-all">
                      <MdPlayArrow size={24}/>
                    </button>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-transparent opacity-50" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px]" />
              </motion.div>
            )}

            {/* Kiruvchi qo'ng'iroq */}
            {sip.hasIncomingCall && sip.status === 'calling' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex-1 min-h-[400px] bg-white border-2 border-indigo-500/40 rounded-[32px] lg:rounded-[44px] p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
                <div className="w-16 h-16 bg-indigo-600 rounded-[28px] flex items-center justify-center text-white text-3xl animate-bounce mb-6 lg:mb-8">
                  <MdNotificationsActive />
                </div>
                <h3 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight mb-4">{sip.incomingCaller || 'Kiruvchi qo\'ng\'iroq'}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-10">SIP • 101</p>
                <div className="flex gap-4 w-full max-w-sm">
                  <button onClick={sip.rejectCall}
                    className="flex-1 py-4 bg-slate-50 text-slate-400 font-black rounded-2xl text-[9px] uppercase tracking-widest border border-slate-100 hover:bg-rose-50 hover:text-rose-600 transition-all">
                    Rad etish
                  </button>
                  <button onClick={sip.acceptCall}
                    className="flex-1 py-4 bg-emerald-500 text-white font-black rounded-2xl text-[9px] uppercase tracking-widest shadow-xl shadow-emerald-100">
                    Qabul qilish
                  </button>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-indigo-500/40" />
              </motion.div>
            )}

            {/* Chiquvchi qo'ng'iroq - kutilmoqda */}
            {sip.status === 'calling' && !sip.hasIncomingCall && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="flex-1 min-h-[400px] bg-slate-950 rounded-[32px] lg:rounded-[44px] p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl border border-white/5">
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-[32px] border border-white/5 flex items-center justify-center mb-8 relative">
                    <MdPhone className="text-4xl text-indigo-400/40" />
                    <div className="absolute inset-0 rounded-[32px] border border-indigo-500/30 animate-ping" />
                  </div>
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] px-5 py-2 bg-white/5 rounded-full mb-8">
                    Chaqirilmoqda...
                  </p>
                  <button onClick={handleHangup}
                    className="w-16 h-16 bg-rose-600 text-white rounded-[28px] flex items-center justify-center shadow-xl">
                    <MdCallEnd className="text-2xl"/>
                  </button>
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-transparent opacity-50" />
              </motion.div>
            )}

            {/* Bo'sh holat */}
            {!isInCall && !sip.hasIncomingCall && (
              <div className="flex-1 min-h-[400px] bg-slate-50/40 backdrop-blur-3xl border border-white/50 rounded-[32px] lg:rounded-[44px] p-12 flex flex-col items-center justify-center text-center shadow-inner relative group">
                <div className="w-16 h-16 bg-white border border-white rounded-[24px] flex items-center justify-center mb-8 rotate-12 opacity-30 shadow-sm group-hover:rotate-0 transition-transform duration-500">
                  <MdCall className="text-3xl text-slate-300" />
                </div>
                <h3 className="text-md font-black text-slate-800 tracking-tight leading-none opacity-40 uppercase tracking-[0.1em]">VoIP Terminal Idle</h3>
                <p className="text-[8px] font-bold text-slate-300 mt-5 uppercase tracking-[0.25em] leading-relaxed max-w-[200px] opacity-60">
                  {sip.status === 'registered' ? 'Qo\'ng\'iroqqa tayyor' : sip.status === 'connecting' ? 'Ulanmoqda...' : 'WireGuard VPN ulanganligini tekshiring'}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* DIALPAD */}
        <div className="col-span-12 lg:col-span-12 xl:col-span-4 min-h-[400px] bg-slate-50/90 backdrop-blur-3xl rounded-[32px] lg:rounded-[44px] border border-white/60 shadow-2xl p-6 lg:p-8 flex flex-col relative overflow-hidden">
          <SectionHeader icon={MdDialpad} title="Dispatch Pad" subtitle="Global Relay Control" />

          <div className="relative mb-4 lg:mb-6">
            <div className="bg-white/80 border border-slate-200/50 rounded-[24px] h-16 flex items-center px-6 relative overflow-hidden focus-within:bg-white focus-within:border-indigo-400 transition-all shadow-sm">
              <p className="flex-1 text-2xl font-black text-slate-900 tracking-widest font-mono truncate leading-none">{dialNum || '...'}</p>
              {dialNum && (
                <button onClick={() => setDialNum(p => p.slice(0, -1))} className="w-10 h-10 hover:bg-rose-50 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all font-black">
                  <MdBackspace size={18} />
                </button>
              )}
              <div className="absolute left-0 top-0 w-1.5 h-full bg-indigo-600 rounded-r-full" />
            </div>

            <AnimatePresence>
              {matches.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="absolute z-50 left-0 right-0 top-[60px] bg-white border border-slate-100 rounded-[24px] shadow-2xl p-2.5 space-y-1 backdrop-blur-3xl">
                  {matches.map(m => (
                    <div key={m.id} onClick={() => handleMakeCall(m.callerPhone)}
                      className="p-3 bg-slate-50 hover:bg-indigo-600 rounded-xl flex items-center justify-between cursor-pointer group transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm"><MdPerson size={14}/></div>
                        <div>
                          <p className="text-[10px] font-black text-slate-800 group-hover:text-white leading-none mb-1">{m.callerPhone}</p>
                          <p className="text-[7px] font-black text-slate-400 group-hover:text-white/60 uppercase tracking-widest">{m.customer?.fullName || 'Yangi raqam'}</p>
                        </div>
                      </div>
                      <MdArrowForward size={14} className="text-slate-200 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all"/>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="grid grid-cols-3 gap-3 w-full max-w-[320px] mx-auto">
              {['1','2','3','4','5','6','7','8','9','*','0','#'].map(num => {
                const is0 = num === '0';
                return (
                  <button
                    key={num}
                    onPointerDown={is0 ? handle0PointerDown : undefined}
                    onPointerUp={is0 ? handle0PointerUp : undefined}
                    onClick={is0 ? undefined : () => handleDial(num)}
                    className="aspect-[1.15/1] bg-white border border-slate-100 rounded-[24px] flex flex-col items-center justify-center text-2xl font-black text-slate-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all active:scale-95 shadow-sm relative group"
                  >
                    <span className="text-xl lg:text-2xl">{num}</span>
                    {is0 && <span className="absolute bottom-2.5 text-[9px] font-black text-slate-300 group-hover:text-white/50">+</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => { if (dialNum) sip.makeCall(dialNum); }}
            disabled={!dialNum}
            className="w-full mt-2 py-2 bg-slate-200 text-slate-500 font-black rounded-xl text-[8px] uppercase tracking-widest hover:bg-slate-300 transition-all disabled:opacity-30"
          >
            DEBUG: Force Start
          </button>

          <button
            onClick={() => handleMakeCall(dialNum)}
            disabled={!dialNum || sip.status !== 'registered'}
            className="w-full mt-4 py-4 bg-indigo-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-100/40 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          >
            <MdCall size={20} /> Qo'ng'iroq qilish
          </button>
        </div>
      </div>

      {/* 3. CALL LOGS */}
      <section className="flex-1 min-h-0 bg-slate-50/50 backdrop-blur-2xl border border-white/50 rounded-[32px] lg:rounded-[44px] shadow-sm flex flex-col overflow-hidden">
        <div className="px-6 lg:px-10 py-5 lg:py-6 border-b border-white/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <SectionHeader icon={MdHistory} title="Muloqotlar Tarixi" subtitle="Live Call Journal" />
          <div className="relative w-full sm:w-64 group">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xl group-focus-within:text-indigo-600 transition-colors" />
            <input
              value={listFilter} onChange={e => setListFilter(e.target.value)}
              placeholder="Filter by phone..."
              className="w-full pl-11 py-3 bg-white/60 border border-white rounded-[18px] text-[10px] font-bold text-slate-600 outline-none focus:bg-white focus:border-indigo-100 transition-all shadow-inner placeholder:text-slate-300"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-1 custom-scrollbar">
          {callsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white/70 backdrop-blur-xl z-10 border-b border-white">
                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                  <th className="px-8 lg:px-10 py-5 w-1/3">Telefon / Mijoz</th>
                  <th className="px-8 lg:px-10 py-5 text-center">Holati</th>
                  <th className="px-8 lg:px-10 py-5 text-right">Vaqt / Davomiylik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {callLog.filter(c => (c.callerPhone || '').includes(listFilter)).map((call) => {
                  const customerName = call.customer?.fullName || 'Yangi raqam';
                  const durationMin = Math.floor((call.durationSeconds || 0) / 60).toString().padStart(2, '0');
                  const durationSec = ((call.durationSeconds || 0) % 60).toString().padStart(2, '0');
                  const callTime = call.startedAt ? new Date(call.startedAt).toLocaleString('uz-UZ', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : '';
                  const statusLabel: Record<string, string> = { COMPLETED: 'Yakunlandi', MISSED: 'Javobsiz', ANSWERED: 'Javob berildi', RINGING: 'Jiringlaydi', REJECTED: 'Rad etildi' };
                  return (
                    <tr key={call.id}
                      onClick={() => setDialNum(call.callerPhone)}
                      className="hover:bg-white/40 transition-all cursor-pointer group">
                      <td className="px-8 lg:px-10 py-5 lg:py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 bg-white border border-white rounded-xl flex items-center justify-center font-black text-[11px] text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all transform group-hover:scale-110 shadow-sm">{customerName[0]}</div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-black text-slate-800 leading-none mb-1.5">{call.callerPhone}</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none truncate">{customerName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 lg:px-10 py-5 lg:py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${STATUS_STLYES[call.status as CallStatus] || 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                          {statusLabel[call.status] || call.status}
                        </span>
                      </td>
                      <td className="px-8 lg:px-10 py-5 lg:py-6 text-right">
                        <div className="flex flex-col items-end">
                          <p className="text-[12px] font-black text-slate-800 font-mono tracking-tight leading-none mb-1">{durationMin}:{durationSec}</p>
                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">{callTime}</p>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {callLog.length === 0 && (
                  <tr><td colSpan={3} className="text-center py-12 text-[11px] font-bold text-slate-300 uppercase tracking-widest">Qo'ng'iroqlar tarixi yo'q</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .backdrop-blur-3xl { backdrop-filter: blur(80px); }
        .backdrop-blur-4xl { backdrop-filter: blur(120px); }
      `}</style>
    </div>
  );
}

export default function OperatorCallsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>}>
      <OperatorCallsContent />
    </Suspense>
  );
}
