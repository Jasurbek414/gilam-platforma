'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export type SipStatus = 'idle' | 'connecting' | 'registered' | 'error' | 'calling' | 'in_call';

export interface SipCredentials {
  server: string; domain: string; username: string; password: string; displayName: string;
}

const SIP_DOMAIN = process.env.NEXT_PUBLIC_SIP_DOMAIN || '10.100.100.1';

export function useSip(_credentials?: SipCredentials | null) {
  const [status, setStatus]           = useState<SipStatus>('registered'); // MicroSIP always ready
  const [error, setError]             = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [incomingCaller, setIncomingCaller] = useState<string | null>(null);
  const [incomingCallId, setIncomingCallId] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeCallRef = useRef<string | null>(null);

  const startTimer = useCallback(() => {
    setCallDuration(0);
    timerRef.current = setInterval(() => setCallDuration(s => s + 1), 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setCallDuration(0);
  }, []);

  useEffect(() => {
    // Status: registered — MicroSIP orqali ishlashga tayyor
    setStatus('registered');
    setError(null);
    return () => { stopTimer(); };
  }, []);

  // MicroSIP orqali qo'ng'iroq — sip: URI scheme
  const makeCall = useCallback((target: string) => {
    if (!target) return;
    const num = target.replace(/[^0-9+]/g, '');

    // sip: URI — MicroSIP avtomatik ochiladi (Windows da default SIP handler)
    const sipUri = `sip:${num}@${SIP_DOMAIN}`;

    try {
      window.location.href = sipUri;
      setStatus('calling');
      activeCallRef.current = num;

      // 30 soniyadan keyin "registered" ga qaytamiz (call simulatsiyasi)
      setTimeout(() => {
        setStatus('in_call');
        startTimer();
      }, 3000);

      toast.success(`MicroSIP orqali qo'ng'iroq: ${num}`, { duration: 3000 });
    } catch {
      toast.error('MicroSIP ishga tushmadi. MicroSIP o\'rnatilganligini tekshiring.');
      setStatus('registered');
    }
  }, [startTimer]);

  const hangup = useCallback(() => {
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
    setIncomingCallId(null);
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
