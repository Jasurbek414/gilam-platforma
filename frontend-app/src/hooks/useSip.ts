'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

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

// WS URL: env dan olinadi. Backend localhost:3000 da ishlaydi —
// frontend ham shu mashinada bo'lsa localhost, bo'lmasa server IP
const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL ||
  (typeof window !== 'undefined' ? window.location.origin.replace(/:\d+$/, ':3000') : 'http://localhost:3000');

const SIP_DOMAIN = process.env.NEXT_PUBLIC_SIP_DOMAIN || '10.100.100.1';

export function useSip(_credentials?: SipCredentials | null) {
  const [status, setStatus] = useState<SipStatus>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [incomingCaller, setIncomingCaller] = useState<string | null>(null);
  const [lastFailedReason, setLastFailedReason] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const activeCallRef = useRef<string | null>(null);
  const statusRef = useRef<SipStatus>('connecting');

  // Keep statusRef in sync
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const startTimer = useCallback(() => {
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

  useEffect(() => {
    const wsUrl = `${WS_BASE}/sip`;
    console.log('[useSip] Connecting to:', wsUrl);

    const socket = io(wsUrl, {
      transports: ['websocket'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[useSip] WS connected:', socket.id);
      setError(null);
      // Request current SIP status
      socket.emit('sip:ping');
    });

    socket.on('connect_error', (err) => {
      console.error('[useSip] Connection error:', err.message);
      setStatus('error');
      setError(`Backend bilan ulanib bo'lmadi (${WS_BASE})`);
    });

    socket.on('disconnect', (reason) => {
      console.log('[useSip] Disconnected:', reason);
      setStatus((prev) =>
        prev === 'in_call' || prev === 'calling' ? prev : 'idle',
      );
    });

    // ── SIP holati (backend dan keladi) ──
    socket.on('sip:status', (data: { registered: boolean }) => {
      console.log('[useSip] sip:status', data);
      if (data.registered) {
        setStatus((prev) =>
          prev === 'in_call' || prev === 'calling' ? prev : 'registered',
        );
        setError(null);
      } else {
        setStatus((prev) =>
          prev === 'in_call' || prev === 'calling' ? prev : 'error',
        );
        setError('SIP serverga ulanilmagan (WireGuard faolmi?)');
      }
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
        if (data.registered) {
          setStatus((prev) =>
            prev === 'in_call' || prev === 'calling' ? prev : 'registered',
          );
          setError(null);
        } else {
          setStatus('error');
          setError(
            `SIP ro'yxatdan o'tilmagan | Server: ${data.sipServer} | Local: ${data.localIp} | Ext: ${data.extension}`,
          );
        }
      },
    );

    // ── Chaqirilmoqda (180 Ringing) ──
    socket.on('sip:ringing', () => {
      console.log('[useSip] sip:ringing');
      setStatus('calling');
    });

    // ── Qo'ng'iroq qabul qilindi (200 OK) ──
    socket.on('sip:call_answered', () => {
      console.log('[useSip] sip:call_answered');
      setStatus('in_call');
      startTimer();
    });

    // ── Chiquvchi qo'ng'iroq boshlandi ──
    socket.on('sip:calling', (data: { target?: string }) => {
      console.log('[useSip] sip:calling', data);
      setStatus('calling');
    });

    // ── Qo'ng'iroq tugatildi ──
    socket.on('sip:call_ended', () => {
      console.log('[useSip] sip:call_ended');
      stopTimer();
      setStatus('registered');
      activeCallRef.current = null;
      setIncomingCaller(null);
    });

    // ── Qo'ng'iroq muvaffaqiyatsiz ──
    socket.on('sip:call_failed', (data: { reason: string; code?: string }) => {
      console.log('[useSip] sip:call_failed', data);
      stopTimer();
      setLastFailedReason(data.reason);
      setStatus('registered');
      activeCallRef.current = null;
      toast.error(`❌ Qo'ng'iroq bajarilmadi: ${data.reason}`, {
        duration: 6000,
        style: {
          background: '#1e1e2e',
          color: '#f38ba8',
          border: '1px solid #45475a',
          fontSize: '13px',
        },
      });
    });

    // ── Xato ──
    socket.on('sip:error', (data: { message: string }) => {
      console.log('[useSip] sip:error', data);
      setStatus('error');
      setError(data.message);
      toast.error(data.message);
    });

    return () => {
      stopTimer();
      socket.disconnect();
    };
  }, [startTimer, stopTimer]);

  // ── Qo'ng'iroq qilish ──
  const makeCall = useCallback(
    (target: string) => {
      if (!target?.trim()) {
        toast.error("Raqam kiriting");
        return;
      }

      const currentStatus = statusRef.current;

      if (currentStatus !== 'registered') {
        toast.error(
          currentStatus === 'error'
            ? `SIP xato: ${error || 'Ulanmagan'}`
            : 'SIP hali tayyor emas, kuting...',
        );
        return;
      }

      const num = target.replace(/[^0-9+*#]/g, '');
      if (!num) {
        toast.error("Noto'g'ri raqam formati");
        return;
      }

      const socket = socketRef.current;

      if (socket?.connected) {
        let userData: { id?: string; companyId?: string } = {};
        try {
          userData = JSON.parse(localStorage.getItem('user') || '{}');
        } catch {}

        console.log('[useSip] makeCall →', num);
        socket.emit('sip:call', {
          target: num,
          operatorId: userData.id || null,
          companyId: userData.companyId || null,
        });

        setStatus('calling');
        activeCallRef.current = num;
        setLastFailedReason(null);

        toast(`📞 Qo'ng'iroq: ${num}`, {
          duration: 3000,
          icon: '📡',
          style: {
            background: '#1e1e2e',
            color: '#cdd6f4',
            border: '1px solid #45475a',
          },
        });
      } else {
        // Fallback: MicroSIP sip: URI scheme
        const sipUri = `sip:${num}@${SIP_DOMAIN}`;
        console.log('[useSip] fallback MicroSIP →', sipUri);
        window.location.href = sipUri;
        setStatus('calling');
        activeCallRef.current = num;
        toast.success(`MicroSIP: ${num}`);
      }
    },
    [error],
  );

  // ── Qo'ng'iroqni tugatish ──
  const hangup = useCallback(() => {
    console.log('[useSip] hangup');
    socketRef.current?.emit('sip:hangup');
    stopTimer();
    setStatus('registered');
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
    // Backend SIP bridge orqali mute hozircha frontend tomonida
    // MicroSIP ga mute signali yuborilmayapti — keyinchalik RTP level da amalga oshiriladi
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
