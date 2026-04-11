'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getUser } from '@/lib/api';
import { IncomingCallEvent, CallUpdateEvent } from '@/types';

export type { IncomingCallEvent, CallUpdateEvent };

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

export function useCallsSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [incomingCall, setIncomingCall] = useState<IncomingCallEvent | null>(null);
  const [callUpdate, setCallUpdate] = useState<CallUpdateEvent | null>(null);
  const [ringtone, setRingtone] = useState(false);

  const connect = useCallback(() => {
    const user = getUser();
    if (!user) return;

    if (socketRef.current?.connected) return;

    const socket = io(`${WS_URL}/calls`, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      setIsConnected(true);
      // Operator sifatida qo'shilish
      socket.emit('operator:join', {
        operatorId: user.id,
        companyId: user.companyId,
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('call:incoming', (data: IncomingCallEvent) => {
      setIncomingCall(data);
      setRingtone(true);
      // Browser notification
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(`📞 Yangi qo'ng'iroq: ${data.call.callerPhone}`, {
            body: `Kampaniya: ${data.campaign.name}${data.customer ? ` | Mijoz: ${data.customer.fullName}` : ''}`,
            icon: '/favicon.ico',
          });
        }
      }
    });

    socket.on('call:updated', (data: CallUpdateEvent) => {
      setCallUpdate(data);
      if (data.status === 'ANSWERED' || data.status === 'MISSED' || data.status === 'COMPLETED') {
        setRingtone(false);
      }
    });

    // Boshqa operator qo'ng'iroqni oldi — bu operatordagi kiruvchi modal yopiladi
    socket.on('call:taken', (data: { callId: string; operatorId: string }) => {
      const currentUser = getUser();
      // O'zi olgan bo'lsa yopmaydi (o'zi allaqachon active call ga o'tgan)
      if (currentUser && data.operatorId !== currentUser.id) {
        setIncomingCall(prev => {
          if (prev && prev.call.id === data.callId) {
            return null; // Bu qo'ng'iroq boshqa operator tomonidan olingan
          }
          return prev;
        });
        setRingtone(false);
      }
    });

    socketRef.current = socket;
  }, []);

  const disconnect = useCallback(() => {
    const user = getUser();
    if (socketRef.current && user) {
      socketRef.current.emit('operator:leave', { operatorId: user.id });
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    connect();
    // Browser notification ruxsati so'rash
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const dismissIncomingCall = useCallback(() => {
    setIncomingCall(null);
    setRingtone(false);
  }, []);

  const clearCallUpdate = useCallback(() => {
    setCallUpdate(null);
  }, []);

  return {
    isConnected,
    incomingCall,
    callUpdate,
    ringtone,
    dismissIncomingCall,
    clearCallUpdate,
  };
}
