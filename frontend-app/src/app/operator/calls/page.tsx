'use client';

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  Suspense,
} from 'react';
import {
  MdCall,
  MdCallEnd,
  MdPerson,
  MdPhone,
  MdSearch,
  MdHistory,
  MdMic,
  MdMicOff,
  MdBackspace,
  MdNotificationsActive,
  MdArrowForward,
  MdFiberManualRecord,
  MdDialpad,
  MdRefresh,
  MdWarning,
  MdCheckCircle,
  MdInfo,
  MdVolumeOff,
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { callsApi } from '@/lib/api';
import { useSip } from '@/hooks/useSip';

// ─── TYPES ──────────────────────────────────────────────────────────────────
type CallStatus =
  | 'COMPLETED'
  | 'MISSED'
  | 'BUSY'
  | 'IN_PROGRESS'
  | 'CONNECTED'
  | 'RINGING'
  | 'ANSWERED'
  | 'REJECTED';

interface CallRecord {
  id: string;
  callerPhone: string;
  calledPhone?: string;
  customer?: { fullName: string };
  campaign?: { name: string };
  status: CallStatus;
  direction?: string;
  durationSeconds: number;
  startedAt: string;
}

// ─── STATUS STYLES ───────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  COMPLETED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  MISSED: 'bg-rose-50 text-rose-600 border-rose-100',
  BUSY: 'bg-amber-50 text-amber-600 border-amber-100',
  IN_PROGRESS: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  CONNECTED: 'bg-indigo-600 text-white border-indigo-500',
  ANSWERED: 'bg-blue-50 text-blue-600 border-blue-100',
  RINGING: 'bg-yellow-50 text-yellow-600 border-yellow-100',
  REJECTED: 'bg-slate-50 text-slate-500 border-slate-100',
};

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: 'Yakunlandi',
  MISSED: 'Javobsiz',
  ANSWERED: 'Javob berildi',
  RINGING: 'Jiringlaydi',
  REJECTED: 'Rad etildi',
  BUSY: 'Band',
  CONNECTED: 'Ulandi',
  IN_PROGRESS: 'Davom etmoqda',
};

function formatDuration(s: number) {
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

// ─── SIP STATUS BADGE ────────────────────────────────────────────────────────
function SipStatusBadge({
  status,
  error,
  lastFailedReason,
}: {
  status: string;
  error: string | null;
  lastFailedReason: string | null;
}) {
  const cfg = {
    idle: { color: 'bg-slate-400', label: 'Ulanmagan', icon: MdFiberManualRecord },
    connecting: { color: 'bg-yellow-400 animate-pulse', label: 'Ulanmoqda...', icon: MdFiberManualRecord },
    registered: { color: 'bg-emerald-400', label: "SIP ulandi • 101 @ 10.100.100.1", icon: MdCheckCircle },
    error: { color: 'bg-rose-500 animate-pulse', label: error || 'SIP xato', icon: MdWarning },
    calling: { color: 'bg-yellow-400 animate-pulse', label: 'Chaqirilmoqda...', icon: MdPhone },
    in_call: { color: 'bg-indigo-400 animate-pulse', label: "Qo'ng'iroqda", icon: MdCall },
  }[status] || { color: 'bg-slate-400', label: status, icon: MdInfo };

  const Icon = cfg.icon;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3 bg-white/50 backdrop-blur-xl border border-white/40 px-4 py-2.5 rounded-2xl shadow-sm">
        <div className={`w-2 h-2 rounded-full ${cfg.color} flex-shrink-0`} />
        <Icon className="text-slate-400 text-sm flex-shrink-0" />
        <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.15em] truncate">
          {cfg.label}
        </span>
      </div>
      {lastFailedReason && (
        <div className="flex items-start gap-2 bg-rose-50 border border-rose-100 px-4 py-2 rounded-xl">
          <MdWarning className="text-rose-500 text-sm flex-shrink-0 mt-0.5" />
          <p className="text-[9px] font-bold text-rose-600 leading-relaxed">
            ❌ {lastFailedReason}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── MAIN CONTENT ────────────────────────────────────────────────────────────
function OperatorCallsContent() {
  const [isMuted, setIsMuted] = useState(false);
  const [dialNum, setDialNum] = useState('');
  const [listFilter, setListFilter] = useState('');
  const [callLog, setCallLog] = useState<CallRecord[]>([]);
  const [callsLoading, setCallsLoading] = useState(true);
  const [callsError, setCallsError] = useState<string | null>(null);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sip = useSip();

  // ── Load call history ──
  const fetchCalls = useCallback(async () => {
    try {
      setCallsLoading(true);
      setCallsError(null);
      const data = await callsApi.getAll();
      const list = Array.isArray(data) ? data : (data as any)?.data || [];
      setCallLog(list);
    } catch (e: any) {
      setCallsError(e?.message || "Ma'lumot yuklanmadi");
      setCallLog([]);
    } finally {
      setCallsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  // ── Keyboard support ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (/^[0-9+*#]$/.test(e.key)) {
        if (dialNum.length < 15) setDialNum((p) => p + e.key);
      } else if (e.key === 'Backspace') {
        setDialNum((p) => p.slice(0, -1));
      } else if (e.key === 'Enter' && dialNum) {
        handleMakeCall(dialNum);
      } else if (e.key === 'Escape') {
        sip.hangup();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialNum, sip]);

  // ── Auto-fill from URL params ──
  useEffect(() => {
    const phone = searchParams.get('phone');
    if (phone) setDialNum(phone);
  }, [searchParams]);

  const handleDial = useCallback(
    (num: string) => {
      if (dialNum.length < 15) setDialNum((p) => p + num);
    },
    [dialNum],
  );

  const handleMakeCall = useCallback(
    (num: string) => {
      if (!num) return;
      sip.makeCall(num);
    },
    [sip],
  );

  const handleHangup = useCallback(() => {
    sip.hangup();
    setIsMuted(false);
  }, [sip]);

  const handleMute = useCallback(() => {
    sip.toggleMute(!isMuted);
    setIsMuted((v) => !v);
  }, [sip, isMuted]);

  // Long press 0 → +
  const handle0PointerDown = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      handleDial('+');
      longPressTimer.current = null;
    }, 600);
  }, [handleDial]);

  const handle0PointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      handleDial('0');
      longPressTimer.current = null;
    }
  }, [handleDial]);

  // Smart autocomplete
  const matches = useMemo(() => {
    if (!dialNum || dialNum.length < 3) return [];
    const clean = dialNum.replace(/\s/g, '');
    return callLog
      .filter((c) => (c.callerPhone || '').replace(/\s/g, '').includes(clean))
      .slice(0, 4);
  }, [dialNum, callLog]);

  const isInCall = sip.status === 'in_call' || sip.status === 'calling';
  const filteredLog = useMemo(
    () => callLog.filter((c) => (c.callerPhone || '').includes(listFilter)),
    [callLog, listFilter],
  );

  return (
    <div className="relative min-h-[calc(100vh-140px)] w-full flex flex-col gap-5 pb-12 font-sans overflow-hidden">

      {/* ── STATUS BAR ── */}
      <div className="flex items-start justify-between px-1 gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <SipStatusBadge
            status={sip.status}
            error={sip.error}
            lastFailedReason={sip.lastFailedReason}
          />
        </div>
        <button
          onClick={fetchCalls}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95 flex-shrink-0"
        >
          <MdRefresh className="text-base" />
          Yangilash
        </button>
      </div>

      {/* ── MAIN PANEL ── */}
      <div className="grid grid-cols-12 gap-5 items-stretch">

        {/* ── CALL AREA ── */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col">
          <AnimatePresence mode="wait">

            {/* In-call */}
            {sip.status === 'in_call' && (
              <motion.div
                key="in_call"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-h-[420px] bg-slate-950 rounded-[40px] p-10 lg:p-14 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl border border-white/5"
              >
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-[32px] border border-white/5 flex items-center justify-center mb-8 relative">
                    <MdPerson className="text-4xl text-white/20" />
                    <div className="absolute inset-0 rounded-[32px] border border-indigo-500/30 animate-ping" />
                  </div>
                  <h2 className="text-4xl font-black text-white tracking-widest font-mono mb-3">
                    {formatDuration(sip.callDuration)}
                  </h2>
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] px-5 py-2 bg-white/5 rounded-full mb-10">
                    Qo'ng'iroqda
                  </p>
                  <div className="flex gap-5">
                    <button
                      onClick={handleMute}
                      title={isMuted ? 'Unmute' : 'Mute'}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                        isMuted
                          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-110'
                          : 'bg-white/5 text-white/30 hover:bg-white/10'
                      }`}
                    >
                      {isMuted ? <MdMicOff size={22} /> : <MdMic size={22} />}
                    </button>
                    <button
                      onClick={handleHangup}
                      className="w-20 h-20 bg-rose-600 text-white rounded-[36px] flex items-center justify-center shadow-xl shadow-rose-900/40 hover:scale-105 active:scale-95 transition-all"
                    >
                      <MdCallEnd className="text-4xl" />
                    </button>
                    <button
                      className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 text-white/20 hover:bg-white/10 transition-all"
                      title="Mute audio (coming soon)"
                    >
                      <MdVolumeOff size={22} />
                    </button>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-transparent" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px]" />
              </motion.div>
            )}

            {/* Incoming call */}
            {sip.hasIncomingCall && sip.status === 'calling' && (
              <motion.div
                key="incoming"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 min-h-[420px] bg-white border-2 border-indigo-400/50 rounded-[40px] p-10 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl"
              >
                <div className="w-16 h-16 bg-indigo-600 rounded-[28px] flex items-center justify-center text-white text-3xl animate-bounce mb-6">
                  <MdNotificationsActive />
                </div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-3">
                  {sip.incomingCaller || "Kiruvchi qo'ng'iroq"}
                </h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-10">
                  SIP • 101
                </p>
                <div className="flex gap-4 w-full max-w-xs">
                  <button
                    onClick={sip.rejectCall}
                    className="flex-1 py-4 bg-slate-50 text-slate-500 font-black rounded-2xl text-[9px] uppercase tracking-widest border border-slate-100 hover:bg-rose-50 hover:text-rose-600 transition-all"
                  >
                    Rad etish
                  </button>
                  <button
                    onClick={sip.acceptCall}
                    className="flex-1 py-4 bg-emerald-500 text-white font-black rounded-2xl text-[9px] uppercase tracking-widest shadow-xl shadow-emerald-100"
                  >
                    Qabul qilish
                  </button>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-indigo-500/40 rounded-b-[40px]" />
              </motion.div>
            )}

            {/* Outgoing calling */}
            {sip.status === 'calling' && !sip.hasIncomingCall && (
              <motion.div
                key="calling"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-h-[420px] bg-slate-950 rounded-[40px] p-10 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl border border-white/5"
              >
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-[32px] border border-indigo-500/20 flex items-center justify-center mb-8 relative">
                    <MdPhone className="text-4xl text-indigo-400/50" />
                    <div className="absolute inset-0 rounded-[32px] border border-indigo-500/40 animate-ping" />
                  </div>
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] px-5 py-2 bg-white/5 rounded-full mb-8">
                    Chaqirilmoqda...
                  </p>
                  <button
                    onClick={handleHangup}
                    className="w-16 h-16 bg-rose-600 text-white rounded-[28px] flex items-center justify-center shadow-xl"
                  >
                    <MdCallEnd className="text-3xl" />
                  </button>
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-transparent" />
              </motion.div>
            )}

            {/* Idle */}
            {!isInCall && !sip.hasIncomingCall && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 min-h-[420px] bg-slate-50/40 backdrop-blur-3xl border border-white/50 rounded-[40px] p-12 flex flex-col items-center justify-center text-center shadow-inner relative group"
              >
                <div className="w-16 h-16 bg-white border border-white rounded-[24px] flex items-center justify-center mb-8 rotate-12 opacity-20 shadow-sm group-hover:rotate-0 group-hover:opacity-40 transition-all duration-500">
                  <MdCall className="text-3xl text-slate-400" />
                </div>
                <h3 className="text-sm font-black text-slate-700 tracking-tight opacity-40 uppercase tracking-[0.1em]">
                  VoIP Terminal
                </h3>
                <p className="text-[9px] font-bold text-slate-400 mt-4 uppercase tracking-[0.2em] leading-relaxed max-w-[220px] opacity-50">
                  {sip.status === 'registered'
                    ? "Qo'ng'iroqqa tayyor • Raqam kiriting"
                    : sip.status === 'connecting'
                    ? 'Ulanyapti...'
                    : sip.status === 'error'
                    ? 'WireGuard VPN ulangan? Backend ishlamoqdami?'
                    : 'WireGuard VPN ulanganligini tekshiring'}
                </p>

                {/* Quick diagnostic info */}
                {sip.status === 'error' && sip.error && (
                  <div className="mt-6 px-5 py-3 bg-rose-50 border border-rose-100 rounded-2xl max-w-xs">
                    <p className="text-[9px] font-bold text-rose-500 text-left leading-relaxed">
                      {sip.error}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── DIALPAD ── */}
        <div className="col-span-12 lg:col-span-12 xl:col-span-4 min-h-[420px] bg-white/80 backdrop-blur-3xl rounded-[40px] border border-white/60 shadow-2xl p-7 lg:p-9 flex flex-col gap-4 relative overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
              <MdDialpad className="text-lg" />
            </div>
            <div>
              <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">
                Dispatch Pad
              </h2>
              <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                SIP Bridge • {sip.status === 'registered' ? '✓ Ulandi' : '○ Ulangani yo\'q'}
              </p>
            </div>
          </div>

          {/* Display */}
          <div className="relative">
            <div className="bg-slate-50 border border-slate-100 rounded-[22px] h-16 flex items-center px-5 relative overflow-hidden focus-within:border-indigo-300 transition-all shadow-inner">
              <div className="absolute left-0 top-0 w-1.5 h-full bg-indigo-600 rounded-r-full" />
              <p className="flex-1 text-2xl font-black text-slate-800 tracking-widest font-mono truncate ml-2 leading-none">
                {dialNum || '...'}
              </p>
              {dialNum && (
                <button
                  onClick={() => setDialNum((p) => p.slice(0, -1))}
                  className="w-10 h-10 hover:bg-rose-50 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all"
                >
                  <MdBackspace size={18} />
                </button>
              )}
            </div>

            {/* Autocomplete */}
            <AnimatePresence>
              {matches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute z-50 left-0 right-0 top-[68px] bg-white border border-slate-100 rounded-[22px] shadow-2xl p-2 space-y-1"
                >
                  {matches.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setDialNum(m.callerPhone);
                      }}
                      className="p-3 bg-slate-50 hover:bg-indigo-600 rounded-xl flex items-center justify-between cursor-pointer group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-all shadow-sm">
                          <MdPerson size={14} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-slate-800 group-hover:text-white leading-none mb-0.5">
                            {m.callerPhone}
                          </p>
                          <p className="text-[7px] font-bold text-slate-400 group-hover:text-white/60 uppercase tracking-widest">
                            {m.customer?.fullName || 'Yangi raqam'}
                          </p>
                        </div>
                      </div>
                      <MdArrowForward
                        size={14}
                        className="text-slate-200 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                      />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Keypad */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-3 gap-2.5 w-full max-w-[300px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(
                (num) => {
                  const is0 = num === '0';
                  return (
                    <button
                      key={num}
                      onPointerDown={is0 ? handle0PointerDown : undefined}
                      onPointerUp={is0 ? handle0PointerUp : undefined}
                      onClick={is0 ? undefined : () => handleDial(num)}
                      className="aspect-[1.1/1] bg-white border border-slate-100 rounded-[22px] flex flex-col items-center justify-center font-black text-slate-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all active:scale-95 shadow-sm relative group"
                    >
                      <span className="text-xl">{num}</span>
                      {is0 && (
                        <span className="absolute bottom-2 text-[8px] font-black text-slate-300 group-hover:text-white/50">
                          +
                        </span>
                      )}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* Call button */}
          <button
            onClick={() => handleMakeCall(dialNum)}
            disabled={!dialNum || sip.status !== 'registered'}
            className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-200/40 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <MdCall size={20} />
            {sip.status === 'registered'
              ? "Qo'ng'iroq qilish"
              : sip.status === 'connecting'
              ? 'Ulanyapti...'
              : sip.status === 'error'
              ? 'SIP ulanmagan'
              : "Qo'ng'iroq qilish"}
          </button>
        </div>
      </div>

      {/* ── CALL LOG ── */}
      <section className="flex-1 bg-white/50 backdrop-blur-2xl border border-white/50 rounded-[40px] shadow-sm flex flex-col overflow-hidden">
        <div className="px-7 lg:px-10 py-5 border-b border-white/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-white/60 border border-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
              <MdHistory className="text-xl" />
            </div>
            <div>
              <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-tight leading-none">
                Muloqotlar Tarixi
              </h2>
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">
                {callLog.length} ta qo'ng'iroq
              </p>
            </div>
          </div>
          <div className="relative w-full sm:w-64 group">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-base group-focus-within:text-indigo-600 transition-colors" />
            <input
              value={listFilter}
              onChange={(e) => setListFilter(e.target.value)}
              placeholder="Telefon raqamiga filtrlash..."
              className="w-full pl-10 py-3 bg-white/60 border border-white rounded-[18px] text-[10px] font-bold text-slate-600 outline-none focus:bg-white focus:border-indigo-200 transition-all shadow-inner placeholder:text-slate-300"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {callsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : callsError ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <MdWarning className="text-3xl text-rose-400" />
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {callsError}
              </p>
              <button
                onClick={fetchCalls}
                className="mt-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest"
              >
                Qayta urinish
              </button>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white/80 backdrop-blur-xl z-10 border-b border-slate-50">
                <tr className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-7 lg:px-10 py-4 w-2/5">Telefon / Mijoz</th>
                  <th className="px-4 py-4">Kampaniya</th>
                  <th className="px-4 py-4 text-center">Holat</th>
                  <th className="px-7 lg:px-10 py-4 text-right">Vaqt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLog.map((call) => {
                  const customerName = call.customer?.fullName || 'Yangi raqam';
                  const dur = formatDuration(call.durationSeconds || 0);
                  const callTime = call.startedAt
                    ? new Date(call.startedAt).toLocaleString('uz-UZ', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                      })
                    : '—';
                  const dirIcon = call.direction === 'OUTGOING' ? '↑' : '↓';

                  return (
                    <tr
                      key={call.id}
                      onClick={() => setDialNum(call.callerPhone)}
                      className="hover:bg-indigo-50/30 transition-all cursor-pointer group"
                    >
                      <td className="px-7 lg:px-10 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-white border border-slate-100 rounded-xl flex items-center justify-center font-black text-[11px] text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shadow-sm">
                            {customerName[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-black text-slate-800 leading-none mb-1 flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400">{dirIcon}</span>
                              {call.callerPhone}
                            </p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest truncate">
                              {customerName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <p className="text-[9px] font-bold text-slate-500 truncate max-w-[120px]">
                          {call.campaign?.name || '—'}
                        </p>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <span
                          className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${
                            STATUS_STYLES[call.status] ||
                            'bg-slate-50 text-slate-400 border-slate-100'
                          }`}
                        >
                          {STATUS_LABELS[call.status] || call.status}
                        </span>
                      </td>
                      <td className="px-7 lg:px-10 py-5 text-right">
                        <div className="flex flex-col items-end">
                          <p className="text-[12px] font-black text-slate-800 font-mono tracking-tight leading-none mb-1">
                            {dur}
                          </p>
                          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">
                            {callTime}
                          </p>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredLog.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-14 text-[11px] font-bold text-slate-300 uppercase tracking-widest"
                    >
                      {listFilter ? 'Natija topilmadi' : "Qo'ng'iroqlar tarixi yo'q"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.07); border-radius: 10px; }
      `}</style>
    </div>
  );
}

export default function OperatorCallsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      }
    >
      <OperatorCallsContent />
    </Suspense>
  );
}
