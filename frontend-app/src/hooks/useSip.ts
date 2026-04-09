'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

// ─── TYPES ─────────────────────────────────────────────────────────────────────
export type SipStatus =
  | 'idle'
  | 'connecting'
  | 'registered'
  | 'error'
  | 'calling'
  | 'in_call';

export interface SipCredentials {
  server: string;
  domain: string;
  username: string;
  password: string;
  displayName: string;
}

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────
const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
  (typeof window !== 'undefined' ? window.location.origin.replace(/:\d+$/, ':3000') : 'http://localhost:3000');

const SIP_DOMAIN = process.env.NEXT_PUBLIC_SIP_DOMAIN || '10.100.100.1';

// ─── HOOK ──────────────────────────────────────────────────────────────────────
export function useSip(_credentials?: SipCredentials | null) {
  const [status, setStatus] = useState<SipStatus>('registered');
  const [error, setError] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [incomingCaller, setIncomingCaller] = useState<string | null>(null);
  const [lastFailedReason, setLastFailedReason] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const activeCallRef = useRef<string | null>(null);
  const statusRef = useRef<SipStatus>('registered');
  const userHangupRef = useRef<boolean>(false);

  // Keep statusRef in sync
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    setCallDuration(0);
    timerRef.current = setInterval(() => setCallDuration((s) => s + 1), 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCallDuration(0);
  }, []);

  // ─── WebSocket ulanishi (kiruvchi qo'ng'iroq bildirish uchun) ────────────────
  useEffect(() => {
    const wsUrl = `${WS_BASE}/sip`;
    console.log('[useSip] Connecting to WS:', wsUrl);

    const socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[useSip] WS connected:', socket.id);
      setError(null);
      // X-Lite rejimida — doim "registered" ko'rsatamiz
      setStatus((prev) =>
        prev === 'in_call' || prev === 'calling' ? prev : 'registered',
      );
    });

    socket.on('connect_error', (err) => {
      console.error('[useSip] WS connection error:', err.message);
      // Backend bilan aloqa yo'qligi SIP ga bog'liq emas — X-Lite mustaqil ishlaydi
      // Faqat log qilamiz, error ko'rsatmaymiz
    });

    socket.on('disconnect', (reason) => {
      console.log('[useSip] WS disconnected:', reason);
    });

    // ── Backend SIP holati (agar qayta yoqilsa) ──
    socket.on('sip:status', (data: { registered: boolean }) => {
      console.log('[useSip] sip:status', data);
      // X-Lite rejimida buni e'tiborsiz qoldiramiz
    });

    // ── Diagnostik pong ──
    socket.on(
      'sip:pong',
      (data: {
        registered: boolean;
        localIp: string;
        sipServer: string;
        extension: string;
      }) => {
        console.log('[useSip] sip:pong', data);
      },
    );

    // ── Kiruvchi qo'ng'iroq (Asterisk webhook → backend → WS) ──
    socket.on('sip:incoming', (data: { caller: string }) => {
      console.log('[useSip] sip:incoming', data);
      setIncomingCaller(data.caller);
      setStatus('calling');
    });

    // ── Qo'ng'iroq qabul qilindi ──
    socket.on('sip:call_answered', () => {
      console.log('[useSip] sip:call_answered');
      setStatus('in_call');
      startTimer();
    });

    // ── Qo'ng'iroq tugatildi ──
    socket.on('sip:call_ended', () => {
      console.log('[useSip] sip:call_ended');
      if (statusRef.current === 'registered') return;
      stopTimer();
      setStatus('registered');
      activeCallRef.current = null;
      setIncomingCaller(null);
      setLastFailedReason(null);
      userHangupRef.current = false;
    });

    // ── Qo'ng'iroq muvaffaqiyatsiz ──
    socket.on('sip:call_failed', (data: { reason: string; code?: string }) => {
      console.log('[useSip] sip:call_failed', data);
      stopTimer();
      setStatus('registered');
      activeCallRef.current = null;

      const isExpectedCancel = data.code === '487' || userHangupRef.current;
      userHangupRef.current = false;

      if (!isExpectedCancel) {
        setLastFailedReason(data.reason);
        toast.error(`❌ Qo'ng'iroq bajarilmadi: ${data.reason}`, {
          duration: 6000,
          style: {
            background: '#1e1e2e',
            color: '#f38ba8',
            border: '1px solid #45475a',
            fontSize: '13px',
          },
        });
      } else {
        setLastFailedReason(null);
      }
    });

    // ── Xato ──
    socket.on('sip:error', (data: { message: string }) => {
      console.log('[useSip] sip:error', data);
      toast.error(data.message);
    });

    return () => {
      stopTimer();
      socket.disconnect();
    };
  }, [startTimer, stopTimer]);

  // ─── Qo'ng'iroq qilish (X-Lite orqali) ──────────────────────────────────────
  const makeCall = useCallback(
    (target: string) => {
      if (!target?.trim()) {
        toast.error("Raqam kiriting");
        return;
      }

      const num = target.replace(/[^0-9+*#]/g, '');
      if (!num) {
        toast.error("Noto'g'ri raqam formati");
        return;
      }

      // X-Lite / MicroSIP ga raqamni sip: URI orqali yuboramiz
      const sipUri = `sip:${num}@${SIP_DOMAIN}`;
      console.log('[useSip] X-Lite call →', sipUri);

      // Vaqtinchalik iframe orqali ochish (sahifa navigatsiya qilib ketmasligi uchun)
      const frame = document.createElement('iframe');
      frame.style.display = 'none';
      frame.src = sipUri;
      document.body.appendChild(frame);
      setTimeout(() => document.body.removeChild(frame), 3000);

      setStatus('calling');
      activeCallRef.current = num;
      setLastFailedReason(null);

      toast(`📞 X-Lite: ${num}`, {
        duration: 3000,
        icon: '📡',
        style: {
          background: '#1e1e2e',
          color: '#cdd6f4',
          border: '1px solid #45475a',
        },
      });

      // 30 soniyadan keyin agar hali ham "calling" bo'lsa, "registered" ga qaytaramiz
      setTimeout(() => {
        if (statusRef.current === 'calling') {
          setStatus('registered');
          activeCallRef.current = null;
        }
      }, 30000);
    },
    [],
  );

  // ─── Qo'ng'iroqni tugatish ───────────────────────────────────────────────────
  const hangup = useCallback(() => {
    console.log('[useSip] hangup');
    userHangupRef.current = true;
    socketRef.current?.emit('sip:hangup');
    stopTimer();
    setStatus('registered');
    setLastFailedReason(null);
    activeCallRef.current = null;
  }, [stopTimer]);

  const acceptCall = useCallback(() => {
    setStatus('in_call');
    startTimer();
  }, [startTimer]);

  const rejectCall = useCallback(() => {
    setStatus('registered');
    setIncomingCaller(null);
  }, []);

  const toggleMute = useCallback((_mute: boolean) => {
    // X-Lite dagi mute funksiyasi — foydalanuvchi X-Lite interfeysidan boshqaradi
  }, []);

  return {
    status,
    error,
    lastFailedReason,
    callDuration,
    hasIncomingCall: status === 'calling' && !!incomingCaller,
    incomingCaller,
    acceptCall,
    rejectCall,
    makeCall,
    hangup,
    toggleMute,
  };
}
