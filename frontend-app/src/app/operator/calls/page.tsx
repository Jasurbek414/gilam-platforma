'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import {
  MdCall, MdCallEnd, MdMic, MdMicOff, MdBackspace,
  MdHistory, MdSearch, MdRefresh, MdDialpad,
  MdPerson, MdArrowUpward, MdArrowDownward,
  MdSignalCellularAlt, MdWifi, MdWifiOff,
  MdVolumeOff, MdVolumeUp, MdPhone,
} from 'react-icons/md';
import { callsApi } from '@/lib/api';
import { useSip } from '@/hooks/useSip';
import toast from 'react-hot-toast';

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface CallRecord {
  id: string;
  callerPhone: string;
  calledPhone?: string;
  customer?: { fullName: string };
  status: string;
  direction?: string;
  durationSeconds: number;
  startedAt: string;
}

function dur(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function timeAgo(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'Hozir';
  if (diff < 3600) return `${Math.floor(diff / 60)}m oldin`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}s oldin`;
  return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' });
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  COMPLETED:  { label: 'Yakunlandi', color: 'text-emerald-600 bg-emerald-50' },
  MISSED:     { label: 'Javobsiz',   color: 'text-rose-600 bg-rose-50' },
  BUSY:       { label: 'Band',       color: 'text-amber-600 bg-amber-50' },
  IN_PROGRESS:{ label: 'Davomida',   color: 'text-indigo-600 bg-indigo-50' },
  CONNECTED:  { label: 'Ulandi',     color: 'text-indigo-600 bg-indigo-100' },
  ANSWERED:   { label: 'Javob berildi', color: 'text-blue-600 bg-blue-50' },
  RINGING:    { label: 'Jiringlaydi', color: 'text-yellow-600 bg-yellow-50' },
  REJECTED:   { label: 'Rad etildi', color: 'text-slate-500 bg-slate-50' },
};

// ─── SIP STATUS DOT ──────────────────────────────────────────────────────────
function SipDot({ status }: { status: string }) {
  const cfg = {
    registered: 'bg-emerald-400',
    connecting: 'bg-yellow-400 animate-pulse',
    calling:    'bg-indigo-400 animate-pulse',
    in_call:    'bg-indigo-500 animate-pulse',
    error:      'bg-rose-500',
    idle:       'bg-slate-300',
  }[status] || 'bg-slate-300';
  return <span className={`inline-block w-2 h-2 rounded-full ${cfg} flex-shrink-0`} />;
}

// ─── DIALPAD KEY ─────────────────────────────────────────────────────────────
const KEYS = [
  { k: '1', s: '' }, { k: '2', s: 'ABC' }, { k: '3', s: 'DEF' },
  { k: '4', s: 'GHI' }, { k: '5', s: 'JKL' }, { k: '6', s: 'MNO' },
  { k: '7', s: 'PQRS' }, { k: '8', s: 'TUV' }, { k: '9', s: 'WXYZ' },
  { k: '*', s: '' }, { k: '0', s: '+' }, { k: '#', s: '' },
];

// ─── MAIN ────────────────────────────────────────────────────────────────────
function OperatorCallsContent() {
  const [dialNum, setDialNum] = useState('');
  const [muted, setMuted] = useState(false);
  const [filter, setFilter] = useState('');
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'missed' | 'outgoing'>('all');
  const longPress = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchParams = useSearchParams();
  const sip = useSip();

  // ── Load history ──
  const loadCalls = useCallback(async () => {
    setLoading(true);
    try {
      const data = await callsApi.getAll();
      setCalls(Array.isArray(data) ? data : (data as any)?.data || []);
    } catch {
      setCalls([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCalls(); }, [loadCalls]);

  // ── URL phone prefill ──
  useEffect(() => {
    const p = searchParams.get('phone');
    if (p) setDialNum(p.replace(/[^0-9+*#]/g, ''));
  }, [searchParams]);

  // ── Keyboard ──
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (/^[0-9+*#]$/.test(e.key) && dialNum.length < 15) setDialNum(p => p + e.key);
      else if (e.key === 'Backspace') setDialNum(p => p.slice(0, -1));
      else if (e.key === 'Enter' && dialNum) handleMakeCall(dialNum);
      else if (e.key === 'Escape') sip.hangup();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [dialNum, sip]);

  const handleMakeCall = useCallback((num: string) => {
    if (!num.trim()) return;
    if (sip.status !== 'registered') {
      toast.error(sip.status === 'error'
        ? `SIP ulanmagan: ${sip.error || 'xato'}`
        : 'SIP hali tayyor emas...');
      return;
    }
    sip.makeCall(num);
  }, [sip]);

  const handleHangup = useCallback(() => {
    sip.hangup();
    setMuted(false);
  }, [sip]);

  const handle0Down = useCallback(() => {
    longPress.current = setTimeout(() => {
      setDialNum(p => p + '+');
      longPress.current = null;
    }, 600);
  }, []);

  const handle0Up = useCallback(() => {
    if (longPress.current) {
      clearTimeout(longPress.current);
      setDialNum(p => (p.length < 15 ? p + '0' : p));
      longPress.current = null;
    }
  }, []);

  const isActive = sip.status === 'in_call' || sip.status === 'calling';

  // ── Filtered call list ──
  const filteredCalls = useMemo(() => {
    let list = calls;
    if (tab === 'missed') list = list.filter(c => c.status === 'MISSED');
    else if (tab === 'outgoing') list = list.filter(c => c.direction === 'OUTGOING');
    if (filter) list = list.filter(c => (c.callerPhone || '').includes(filter));
    return list;
  }, [calls, tab, filter]);

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 min-h-screen pb-10 font-sans">

      {/* ── TOP STATUS BAR ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">

        {/* SIP status pill */}
        <div className={`flex items-center gap-2.5 px-4 py-2 border rounded-2xl shadow-sm ${
          sip.status === 'registered' ? 'bg-emerald-50 border-emerald-200' :
          sip.status === 'in_call' || sip.status === 'calling' ? 'bg-indigo-50 border-indigo-200' :
          sip.status === 'error' ? 'bg-amber-50 border-amber-200' :
          'bg-white border-slate-100'
        }`}>
          <SipDot status={sip.status} />
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.15em]">
            {sip.status === 'registered'  ? `SIP Ulangan ✓` :
             sip.status === 'connecting'  ? 'SIP ulanmoqda...' :
             sip.status === 'calling'     ? 'Chaqirilmoqda...' :
             sip.status === 'in_call'     ? `Qo'ng'iroqda • ${dur(sip.callDuration)}` :
             sip.status === 'error'       ? 'SIP ulanmagan (VPN kerak)' :
             'Ulanmagan'}
          </span>
        </div>

        {/* Error banner */}
        {sip.lastFailedReason && sip.status === 'registered' && (
          <motion.div
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 rounded-2xl max-w-md"
          >
            <span className="text-rose-500 text-sm">⚠️</span>
            <span className="text-[10px] font-bold text-rose-600 leading-snug">{sip.lastFailedReason}</span>
          </motion.div>
        )}

        <button
          onClick={loadCalls}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all shadow-md"
        >
          <MdRefresh className="text-sm" />
          Yangilash
        </button>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-12 gap-6 items-start">

        {/* ── CALL STATE PANEL ── */}
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-4">

          <AnimatePresence mode="wait">
            {/* IN CALL */}
            {sip.status === 'in_call' && (
              <motion.div key="in_call"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-10 flex flex-col items-center text-center shadow-2xl border border-white/5 min-h-[320px] justify-center"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 blur-[80px]" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-[60px]" />

                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-[28px] bg-white/5 border border-white/10 flex items-center justify-center">
                      <MdPerson className="text-4xl text-white/30" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-slate-900 flex items-center justify-center">
                      <MdCall className="text-[10px] text-white" />
                    </span>
                  </div>

                  <div>
                    <p className="text-4xl font-black text-white tracking-[0.15em] font-mono tabular-nums">
                      {dur(sip.callDuration)}
                    </p>
                    <p className="mt-2 text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">
                      Qo'ng'iroqda
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <button onClick={() => { sip.toggleMute(!muted); setMuted(v => !v); }}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${muted ? 'bg-amber-500 shadow-lg shadow-amber-500/30' : 'bg-white/5 hover:bg-white/10'}`}
                    >
                      {muted ? <MdMicOff className="text-white text-xl" /> : <MdMic className="text-white/40 text-xl" />}
                    </button>

                    <button onClick={handleHangup}
                      className="w-20 h-20 bg-rose-600 hover:bg-rose-500 rounded-[30px] flex items-center justify-center shadow-xl shadow-rose-900/40 active:scale-95 transition-all"
                    >
                      <MdCallEnd className="text-4xl text-white" />
                    </button>

                    <button className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 hover:bg-white/10 transition-all">
                      <MdVolumeUp className="text-white/40 text-xl" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CALLING / RINGING */}
            {sip.status === 'calling' && (
              <motion.div key="calling"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-slate-950 to-indigo-950 p-10 flex flex-col items-center text-center shadow-2xl border border-white/5 min-h-[320px] justify-center"
              >
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-[28px] bg-white/5 border border-indigo-500/20 flex items-center justify-center">
                      <MdPhone className="text-4xl text-indigo-400/60" />
                    </div>
                    {[0, 1, 2].map(i => (
                      <span key={i} className="absolute inset-0 rounded-[28px] border border-indigo-400/20 animate-ping"
                        style={{ animationDelay: `${i * 0.4}s`, animationDuration: '1.8s' }} />
                    ))}
                  </div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Chaqirilmoqda...</p>
                  <button onClick={handleHangup}
                    className="w-16 h-16 bg-rose-600 rounded-[24px] flex items-center justify-center shadow-lg active:scale-95 transition-all"
                  >
                    <MdCallEnd className="text-3xl text-white" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* IDLE */}
            {!isActive && (
              <motion.div key="idle"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`rounded-[36px] border-2 border-dashed min-h-[320px] flex items-center justify-center ${
                  sip.status === 'registered' ? 'border-emerald-200 bg-emerald-50/30' :
                  sip.status === 'error' ? 'border-amber-200 bg-amber-50/30' :
                  'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="text-center max-w-xs">
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto mb-4 shadow-sm ${
                    sip.status === 'registered' ? 'bg-emerald-50 border-emerald-200' :
                    sip.status === 'error' ? 'bg-amber-50 border-amber-200' :
                    'bg-white border-slate-200'
                  }`}>
                    <MdCall className={`text-2xl ${
                      sip.status === 'registered' ? 'text-emerald-500' :
                      sip.status === 'error' ? 'text-amber-400' :
                      'text-slate-300'
                    }`} />
                  </div>
                  {sip.status === 'registered' ? (
                    <>
                      <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em]">Qo'ng'iroqqa tayyor</p>
                      <p className="mt-2 text-[9px] font-bold text-slate-400">Raqam terib qo'ng'iroq boshlang</p>
                    </>
                  ) : sip.status === 'connecting' ? (
                    <>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">SIP ulanyapti...</p>
                      <div className="mt-3 w-6 h-6 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                    </>
                  ) : (
                    <>
                      <p className="text-[11px] font-black text-amber-600 uppercase tracking-[0.2em]">SIP ulanmagan</p>
                      <p className="mt-2 text-[9px] font-bold text-amber-500 leading-relaxed">
                        Qo'ng'iroq qilish uchun WireGuard VPN ulangan bo'lishi kerak.
                        Boshqa funksiyalar (Buyurtmalar, Mijozlar) ishlaydi.
                      </p>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── CALL LOG ── */}
          <div className="bg-white border border-slate-100 rounded-[32px] shadow-sm overflow-hidden">

            {/* Log header */}
            <div className="px-7 py-4 border-b border-slate-50 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <MdHistory className="text-slate-400 text-lg" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">Tarix</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{calls.length} qo'ng'iroq</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 bg-slate-50 rounded-xl p-1">
                {([['all','Barchasi'],['missed','Javobsiz'],['outgoing','Chiquvchi']] as const).map(([t, l]) => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >{l}</button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                <input value={filter} onChange={e => setFilter(e.target.value)}
                  placeholder="Raqam..."
                  className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 outline-none focus:border-indigo-300 focus:bg-white transition-all w-40"
                />
              </div>
            </div>

            {/* Log body */}
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-7 h-7 border-[3px] border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
                </div>
              ) : filteredCalls.length === 0 ? (
                <div className="text-center py-12 text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                  {filter ? 'Natija topilmadi' : "Tarix yo'q"}
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {filteredCalls.map(call => {
                    const meta = STATUS_META[call.status] || { label: call.status, color: 'text-slate-400 bg-slate-50' };
                    const isOut = call.direction === 'OUTGOING';
                    return (
                      <div key={call.id}
                        onClick={() => setDialNum(call.callerPhone)}
                        className="flex items-center gap-4 px-7 py-4 hover:bg-indigo-50/40 cursor-pointer transition-all group"
                      >
                        {/* Direction icon */}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${isOut ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-50 text-slate-400'} group-hover:scale-110 transition-all`}>
                          {isOut ? <MdArrowUpward className="text-sm" /> : <MdArrowDownward className="text-sm" />}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-black text-slate-800 leading-none mb-1 truncate">
                            {call.callerPhone}
                          </p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">
                            {call.customer?.fullName || 'Yangi raqam'} · {timeAgo(call.startedAt)}
                          </p>
                        </div>

                        {/* Status */}
                        <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider flex-shrink-0 ${meta.color}`}>
                          {meta.label}
                        </span>

                        {/* Duration */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-[12px] font-black text-slate-700 font-mono">{dur(call.durationSeconds || 0)}</p>
                        </div>

                        {/* Quick call */}
                        <button onClick={e => { e.stopPropagation(); handleMakeCall(call.callerPhone); }}
                          className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 active:scale-95 transition-all shadow-md"
                        >
                          <MdCall className="text-sm" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── DIALPAD PANEL ── */}
        <div className="col-span-12 xl:col-span-4 bg-white border border-slate-100 rounded-[32px] shadow-sm p-7 flex flex-col gap-5 sticky top-5">

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <MdDialpad className="text-white text-lg" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">Raqam terish</p>
              <div className="flex items-center gap-1.5 mt-1">
                <SipDot status={sip.status} />
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                  {sip.status === 'registered' ? 'Tayyor' : sip.status === 'connecting' ? 'Ulanyapti...' : 'Ulanmagan'}
                </span>
              </div>
            </div>
          </div>

          {/* Display */}
          <div className="relative bg-slate-50 rounded-2xl border border-slate-100 px-5 py-4 flex items-center focus-within:border-indigo-300 focus-within:bg-white transition-all">
            <div className="w-0.5 h-6 bg-indigo-500 rounded-full mr-3 flex-shrink-0" />
            <span className={`flex-1 text-2xl font-black font-mono tracking-widest ${dialNum ? 'text-slate-800' : 'text-slate-300'}`}>
              {dialNum || '...'}
            </span>
            {dialNum && (
              <button onClick={() => setDialNum(p => p.slice(0, -1))}
                onContextMenu={e => { e.preventDefault(); setDialNum(''); }}
                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              >
                <MdBackspace className="text-lg" />
              </button>
            )}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2">
            {KEYS.map(({ k, s }) => {
              const is0 = k === '0';
              return (
                <button key={k}
                  onPointerDown={is0 ? handle0Down : undefined}
                  onPointerUp={is0 ? handle0Up : undefined}
                  onClick={is0 ? undefined : () => { if (dialNum.length < 15) setDialNum(p => p + k); }}
                  className="relative aspect-square bg-slate-50 hover:bg-indigo-600 border border-slate-100 hover:border-indigo-600 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 group"
                >
                  <span className="text-xl font-black text-slate-700 group-hover:text-white transition-colors leading-none">
                    {k}
                  </span>
                  {s && (
                    <span className="text-[7px] font-black text-slate-400 group-hover:text-white/60 tracking-widest mt-0.5 transition-colors">
                      {s}
                    </span>
                  )}
                  {is0 && (
                    <span className="absolute bottom-1.5 text-[8px] font-black text-slate-300 group-hover:text-white/40">+</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Call / Hangup button */}
          {isActive ? (
            <button onClick={handleHangup}
              className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl shadow-rose-200 active:scale-95 transition-all"
            >
              <MdCallEnd className="text-xl" />
              Tugatish
            </button>
          ) : (
            <button onClick={() => handleMakeCall(dialNum)}
              disabled={!dialNum || sip.status !== 'registered'}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl shadow-indigo-200 active:scale-95 transition-all"
            >
              <MdCall className="text-xl" />
              {sip.status === 'registered' ? "Qo'ng'iroq" :
               sip.status === 'connecting' ? 'Ulanyapti...' : 'SIP ulanmagan'}
            </button>
          )}

          {/* Last failed reason */}
          {sip.lastFailedReason && !isActive && (
            <div className="px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl">
              <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">Oxirgi xato</p>
              <p className="text-[9px] font-bold text-rose-500 leading-relaxed">{sip.lastFailedReason}</p>

              {/* Dial format hint */}
              {sip.lastFailedReason.includes('503') && (
                <div className="mt-2 pt-2 border-t border-rose-100">
                  <p className="text-[8px] font-bold text-rose-400 leading-relaxed">
                    💡 Asterisk dial plan da bu raqam formatiga route yo'q.<br/>
                    Boshqa format sinab ko'ring yoki admin dan so'rang.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quick dial from recent calls */}
          {!dialNum && calls.length > 0 && (
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Oxirgi raqamlar</p>
              <div className="flex flex-col gap-1">
                {calls.slice(0, 3).map(c => (
                  <button key={c.id}
                    onClick={() => setDialNum(c.callerPhone)}
                    className="flex items-center gap-3 px-3 py-2 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-xl transition-all group text-left"
                  >
                    <div className="w-7 h-7 bg-white border border-slate-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all shadow-sm">
                      <MdPerson className="text-slate-400 group-hover:text-white text-xs transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-slate-700 truncate">{c.callerPhone}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{timeAgo(c.startedAt)}</p>
                    </div>
                    <MdCall className="text-slate-300 group-hover:text-indigo-500 text-sm transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OperatorCallsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    }>
      <OperatorCallsContent />
    </Suspense>
  );
}
