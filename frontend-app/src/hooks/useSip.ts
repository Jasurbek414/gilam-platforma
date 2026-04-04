'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export type SipStatus = 'idle' | 'connecting' | 'registered' | 'error' | 'calling' | 'in_call';

export interface SipCredentials {
  server: string;    // wss://sip.zadarma.com:8443 yoki Asterisk WSS
  domain: string;    // sip.zadarma.com yoki asterisk host
  username: string;  // SIP login (masalan: 100 yoki zadarma user number)
  password: string;  // SIP parol
  displayName: string;
}

export function useSip(credentials: SipCredentials | null) {
  const [status, setStatus] = useState<SipStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  const UARef = useRef<any>(null);
  const sessionRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCallDuration(0);
    sessionRef.current = null;
    setStatus(UARef.current ? 'registered' : 'idle');
  }, []);

  // Remote audio elementi yaratish
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const audio = new Audio();
    audio.autoplay = true;
    remoteAudioRef.current = audio;
    return () => { audio.src = ''; };
  }, []);

  // SIP.js import va ro'yxatdan o'tish
  const register = useCallback(async (creds: SipCredentials) => {
    if (typeof window === 'undefined') return;

    try {
      setStatus('connecting');
      setError(null);

      // SIP.js dynamic import (SSR muammosidan qochish uchun)
      const { UserAgent, Registerer, RegistererState, SessionState } = await import('sip.js');

      const uri = UserAgent.makeURI(`sip:${creds.username}@${creds.domain}`);
      if (!uri) throw new Error('Noto\'g\'ri SIP URI');

      const ua = new UserAgent({
        uri,
        authorizationUsername: creds.username,
        authorizationPassword: creds.password,
        displayName: creds.displayName,
        transportOptions: {
          server: creds.server,
        },
        sessionDescriptionHandlerFactoryOptions: {
          constraints: { audio: true, video: false },
        },
        logLevel: 'error',
        delegate: {
          // Kiruvchi qo'ng'iroq
          onInvite: (invitation: any) => {
            sessionRef.current = invitation;
            setStatus('calling');
          },
        },
      });

      await ua.start();

      const registerer = new Registerer(ua);
      registerer.stateChange.addListener((state: any) => {
        if (state === RegistererState.Registered) setStatus('registered');
        if (state === RegistererState.Unregistered) setStatus('idle');
        if (state === RegistererState.Terminated) setStatus('error');
      });
      await registerer.register();

      UARef.current = { ua, registerer, SessionState };
    } catch (err: any) {
      setError(err.message || 'SIP ulanish xatosi');
      setStatus('error');
    }
  }, []);

  const unregister = useCallback(async () => {
    if (!UARef.current) return;
    try {
      await UARef.current.registerer.unregister();
      await UARef.current.ua.stop();
      UARef.current = null;
      setStatus('idle');
    } catch (_) {}
  }, []);

  // Kiruvchi qo'ng'iroqqa javob berish (SIP audio)
  const acceptCall = useCallback(async () => {
    if (!sessionRef.current || !UARef.current) return;
    const { SessionState } = UARef.current;
    const invitation = sessionRef.current;

    try {
      // Mikrofonni olish
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      await invitation.accept();
      setStatus('in_call');

      // Remote audio ulash
      invitation.stateChange.addListener((state: any) => {
        if (state === SessionState.Established) {
          const receiver = invitation.sessionDescriptionHandler?.peerConnection
            ?.getReceivers()
            .find((r: any) => r.track?.kind === 'audio');
          if (receiver && remoteAudioRef.current) {
            const stream = new MediaStream([receiver.track]);
            remoteAudioRef.current.srcObject = stream;
          }
          // Timer boshlash
          let sec = 0;
          timerRef.current = setInterval(() => {
            sec++;
            setCallDuration(sec);
          }, 1000);
        }
        if (state === SessionState.Terminated) cleanup();
      });
    } catch (err: any) {
      setError(err.message);
      cleanup();
    }
  }, [cleanup]);

  // Qo'ng'iroqni rad etish
  const rejectCall = useCallback(async () => {
    if (!sessionRef.current) return;
    try {
      await sessionRef.current.reject();
    } catch (_) {}
    cleanup();
  }, [cleanup]);

  // Chiquvchi qo'ng'iroq
  const makeCall = useCallback(async (target: string) => {
    if (!UARef.current) return;
    const { ua, SessionState } = UARef.current;
    const { Inviter } = await import('sip.js');

    try {
      const { UserAgent: UA } = await import('sip.js');
      const targetUri = UA.makeURI(`sip:${target}@${UARef.current.ua.userAgentOptions?.uri?.host}`);
      if (!targetUri) return;

      localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inviter = new Inviter(ua, targetUri);
      sessionRef.current = inviter;
      setStatus('calling');

      inviter.stateChange.addListener((state: any) => {
        if (state === SessionState.Established) {
          setStatus('in_call');
          const receiver = (inviter.sessionDescriptionHandler as any)?.peerConnection
            ?.getReceivers()
            .find((r: any) => r.track?.kind === 'audio');
          if (receiver && remoteAudioRef.current) {
            const stream = new MediaStream([receiver.track]);
            remoteAudioRef.current.srcObject = stream;
          }
          let sec = 0;
          timerRef.current = setInterval(() => {
            sec++;
            setCallDuration(sec);
          }, 1000);
        }
        if (state === SessionState.Terminated) cleanup();
      });

      await inviter.invite();
    } catch (err: any) {
      setError(err.message);
      cleanup();
    }
  }, [cleanup]);

  // Qo'ng'iroqni tugatish
  const hangup = useCallback(async () => {
    if (!sessionRef.current) return;
    try {
      const session = sessionRef.current;
      if (session.state === 'Established') await session.bye();
      else await session.reject?.() || session.cancel?.();
    } catch (_) {}
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    cleanup();
  }, [cleanup]);

  // Mute toggle
  const toggleMute = useCallback((mute: boolean) => {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !mute; });
  }, []);

  useEffect(() => {
    if (credentials) register(credentials);
    return () => { unregister(); };
  }, [credentials?.username, credentials?.server]);

  return {
    status,
    error,
    callDuration,
    hasIncomingCall: !!sessionRef.current && status === 'calling',
    acceptCall,
    rejectCall,
    makeCall,
    hangup,
    toggleMute,
  };
}
