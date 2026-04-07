'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

export type SipStatus = 'idle' | 'connecting' | 'registered' | 'error' | 'calling' | 'in_call';

export interface SipCredentials {
  server: string; domain: string; username: string; password: string; displayName: string;
}

const SIP_DOMAIN = process.env.NEXT_PUBLIC_SIP_DOMAIN || '10.100.100.1';
const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

export function useSip(_credentials?: SipCredentials | null) {
  const [status, setStatus]             = useState<SipStatus>('connecting');
  const [error, setError]               = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [incomingCaller, setIncomingCaller] = useState<string | null>(null);

  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const socketRef  = useRef<Socket | null>(null);
  const activeCall = useRef<string | null>(null);

  const startTimer = useCallback(() => {
    setCallDuration(0);
    timerRef.current = setInterval(() => setCallDuration(s => s + 1), 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setCallDuration(0);
  }, []);

  // Backend SipBridgeGateway ga ulanib real holatni olish
  useEffect(() => {
    const socket = io(`${WS_BASE}/sip`, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      // Ulangandan so'ng backend SIP ro'yxatdan o'tgan-o'tmaganini xabar qiladi
      setError(null);
    });

    socket.on('connect_error', () => {
      setStatus('error');
      setError('Backend bilan ulanib bo\'lmadi');
    });

    socket.on('disconnect', () => {
      // Faqat qo'ng'iroqda bo'lmasa idle ga o'tamiz
      setStatus(prev => prev === 'in_call' || prev === 'calling' ? prev : 'idle');
    });

    // Real SIP ro'yxatdan o'tish holati
    socket.on('sip:status', (data: { registered: boolean }) => {
      if (data.registered) {
        setStatus(prev => prev === 'in_call' || prev === 'calling' ? prev : 'registered');
        setError(null);
      } else {
        setStatus(prev => prev === 'in_call' || prev === 'calling' ? prev : 'error');
        setError('SIP serverga ulanilmagan (WireGuard faolmi?)');
      }
    });

    socket.on('sip:ringing', () => {
      setStatus('calling');
    });

    socket.on('sip:call_answered', () => {
      setStatus('in_call');
      startTimer();
    });

    socket.on('sip:call_ended', () => {
      stopTimer();
      setStatus('registered');
      activeCall.current = null;
    });

    socket.on('sip:call_failed', (data: { reason: string }) => {
      stopTimer();
      setStatus('registered');
      activeCall.current = null;
      toast.error(`Qo'ng'iroq bajarilmadi: ${data.reason}`);
    });

    return () => {
      stopTimer();
      socket.disconnect();
    };
  }, [startTimer, stopTimer]);

  // MicroSIP orqali qo'ng'iroq — backend SipBridgeGateway orqali
  const makeCall = useCallback((target: string) => {
    if (!target) return;
    if (status !== 'registered') {
      toast.error('SIP serverga ulanilmagan. WireGuard VPN ulanganligini tekshiring.');
      return;
    }

    const num = target.replace(/[^0-9+]/g, '');
    const socket = socketRef.current;

    if (socket?.connected) {
      // Backend orqali SIP INVITE yuborish
      socket.emit('sip:call', {
        target: num,
        operatorId: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}').id : null,
        companyId: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}').companyId : null,
      });
      setStatus('calling');
      activeCall.current = num;
      toast.success(`Qo'ng'iroq: ${num}`, { duration: 3000 });
    } else {
      // Fallback: MicroSIP sip: URI scheme
      const sipUri = `sip:${num}@${SIP_DOMAIN}`;
      window.location.href = sipUri;
      setStatus('calling');
      activeCall.current = num;
      toast.success(`MicroSIP orqali qo'ng'iroq: ${num}`, { duration: 3000 });
    }
  }, [status]);

  const hangup = useCallback(() => {
    socketRef.current?.emit('sip:hangup');
    stopTimer();
    setStatus('registered');
    activeCall.current = null;
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
    // MicroSIP orqali mute — foydalanuvchi o'zida boshqaradi
  }, []);

  return {
    status, error, callDuration,
    hasIncomingCall: status === 'calling' && !!incomingCaller,
    incomingCaller,
    acceptCall, rejectCall, makeCall, hangup, toggleMute,
  };
}
