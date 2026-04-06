'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export type SipStatus = 'idle' | 'connecting' | 'registered' | 'error' | 'calling' | 'in_call';

export interface SipCredentials {
  server: string;
  domain: string;
  username: string;
  password: string;
  displayName: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

export function useSip(_credentials?: SipCredentials | null) {
  const [status, setStatus] = useState<SipStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [incomingCaller, setIncomingCaller] = useState<string | null>(null);
  const [incomingCallId, setIncomingCallId] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    setCallDuration(0);
    timerRef.current = setInterval(() => setCallDuration(s => s + 1), 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setCallDuration(0);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setStatus('connecting');
    const token = localStorage.getItem('token');
    const socket = io(`${BACKEND_URL}/sip`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 3000,
      auth: { token },
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('sip:status');
    });

    socket.on('disconnect', () => {
      setStatus('idle');
    });

    socket.on('sip:status', (data: { registered: boolean }) => {
      setStatus(data.registered ? 'registered' : 'connecting');
    });

    socket.on('sip:calling', () => {
      setStatus('calling');
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
      setIncomingCaller(null);
      setIncomingCallId(null);
    });

    socket.on('sip:call_failed', (data: { reason: string }) => {
      stopTimer();
      setError(data.reason);
      setStatus('registered');
    });

    socket.on('sip:incoming_call', (data: { caller: string; callId: string }) => {
      setIncomingCaller(data.caller);
      setIncomingCallId(data.callId);
      setStatus('calling');
    });

    socket.on('sip:error', (data: { message: string }) => {
      setError(data.message);
      setStatus('error');
    });

    return () => {
      stopTimer();
      socket.disconnect();
    };
  }, []);

  const makeCall = useCallback((target: string) => {
    if (typeof window === 'undefined') return;
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    socketRef.current?.emit('client:log', { message: `Frontend makeCall triggered for: ${target}` });
    
    socketRef.current?.emit('sip:call', { 
      target,
      operatorId: user?.id,
      companyId: user?.companyId || user?.company?.id
    });
  }, []);

  const hangup = useCallback(() => {
    socketRef.current?.emit('sip:hangup');
    stopTimer();
    setStatus('registered');
  }, [stopTimer]);

  const acceptCall = useCallback(() => {
    if (incomingCallId) {
      socketRef.current?.emit('sip:accept', { callId: incomingCallId });
      setStatus('in_call');
      startTimer();
    }
  }, [incomingCallId, startTimer]);

  const rejectCall = useCallback(() => {
    if (incomingCallId) {
      socketRef.current?.emit('sip:reject', { callId: incomingCallId });
      setStatus('registered');
      setIncomingCaller(null);
      setIncomingCallId(null);
    }
  }, [incomingCallId]);

  const toggleMute = useCallback((_mute: boolean) => {
    // Audio backend orqali
  }, []);

  return {
    status,
    error,
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
