'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdCall, MdCallEnd, MdPerson, MdPersonAdd, MdClose,
  MdPhone, MdHome, MdCampaign, MdCheck, MdEdit,
} from 'react-icons/md';
import { callsApi } from '@/lib/api';
import { IncomingCallEvent } from '@/types';
import toast from 'react-hot-toast';

interface Props {
  event: IncomingCallEvent;
  onDismiss: () => void;
  onCompleted: () => void;
}

type ModalStep = 'ringing' | 'answered' | 'completing';

/**
 * IncomingCallModal — Operatorga kiruvchi qo'ng'iroqni ko'rsatadi.
 *
 * 1. RINGING: Qo'ng'iroq jiringlaydi → Operator "Qabul" yoki "Rad" bosadi
 * 2. ANSWERED: Operator gaplashmoqda → Mijoz ma'lumotlarini ko'radi/kiritadi
 * 3. COMPLETING: Yakunlash → Yangi mijoz yaratish yoki mavjudini tanlash
 *
 * Kampaniya nomi va raqami doim ko'rsatiladi — operator qaysi kampaniyaga
 * qo'ng'iroq kelganini bilib turadi.
 */
export default function IncomingCallModal({ event, onDismiss, onCompleted }: Props) {
  const { call, customer: existingCustomer, campaign } = event;

  const [step, setStep] = useState<ModalStep>('ringing');
  const [loading, setLoading] = useState(false);

  // Yangi mijoz formasi
  const [fullName, setFullName] = useState(existingCustomer?.fullName || '');
  const [phone1, setPhone1] = useState(existingCustomer?.phone1 || call.callerPhone || '');
  const [phone2, setPhone2] = useState(existingCustomer?.phone2 || '');
  const [address, setAddress] = useState(existingCustomer?.address || '');
  const [notes, setNotes] = useState('');

  // ── QABUL QILISH ──
  const handleAnswer = useCallback(async () => {
    setLoading(true);
    try {
      await callsApi.answer(call.id);
      setStep('answered');
      toast.success("Qo'ng'iroq qabul qilindi");
    } catch (err: any) {
      toast.error(err.message || "Qabul qilishda xatolik");
    } finally {
      setLoading(false);
    }
  }, [call.id]);

  // ── YAKUNLASH (Mijozni saqlash + qo'ng'iroqni tugatish) ──
  const handleComplete = useCallback(async () => {
    if (!fullName.trim()) {
      toast.error("Mijoz ismini kiriting");
      return;
    }
    setLoading(true);
    try {
      const completeData: any = { notes };

      if (existingCustomer?.id) {
        // Mavjud mijoz — faqat ID yuboramiz
        completeData.customerId = existingCustomer.id;
      } else {
        // Yangi mijoz yaratish
        completeData.newCustomer = {
          fullName: fullName.trim(),
          phone: phone1.trim() || call.callerPhone,
          phone2: phone2.trim() || undefined,
          address: address.trim() || undefined,
        };
      }

      await callsApi.complete(call.id, completeData);
      toast.success("Qo'ng'iroq yakunlandi va mijoz saqlandi!");
      onCompleted();
    } catch (err: any) {
      toast.error(err.message || "Yakunlashda xatolik");
    } finally {
      setLoading(false);
    }
  }, [call, existingCustomer, fullName, phone1, phone2, address, notes, onCompleted]);

  // ── RAD ETISH (Javob bermaslik) ──
  const handleReject = useCallback(async () => {
    try {
      await callsApi.miss(call.id);
    } catch {
      // Xato bo'lsa ham modalni yopamiz
    }
    onDismiss();
  }, [call.id, onDismiss]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100"
        >
          {/* ── HEADER: Kampaniya ma'lumotlari ── */}
          <div className={`px-6 pt-6 pb-4 text-center relative ${
            step === 'ringing' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
            step === 'answered' ? 'bg-gradient-to-br from-indigo-600 to-violet-700' :
            'bg-gradient-to-br from-slate-800 to-slate-900'
          }`}>
            {/* Close button */}
            {step !== 'ringing' && (
              <button onClick={onDismiss}
                className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
              >
                <MdClose className="text-white text-sm" />
              </button>
            )}

            {/* Campaign badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-full mb-3">
              <MdCampaign className="text-white/80 text-xs" />
              <span className="text-[9px] font-black text-white/90 uppercase tracking-widest">
                {campaign.name}
              </span>
            </div>

            {/* Caller avatar */}
            <div className="relative inline-block mb-3">
              <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center mx-auto ${
                existingCustomer ? 'bg-white/20' : 'bg-white/10 border-2 border-dashed border-white/30'
              }`}>
                {existingCustomer
                  ? <MdPerson className="text-3xl text-white" />
                  : <MdPersonAdd className="text-3xl text-white/60" />
                }
              </div>
              {step === 'ringing' && (
                <>
                  {[0, 1, 2].map(i => (
                    <span key={i}
                      className="absolute inset-0 rounded-[22px] border-2 border-white/20 animate-ping"
                      style={{ animationDelay: `${i * 0.4}s`, animationDuration: '2s' }}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Caller info */}
            <h2 className="text-xl font-black text-white tracking-tight">
              {existingCustomer ? existingCustomer.fullName : 'Yangi raqam'}
            </h2>
            <p className="text-sm font-bold text-white/70 mt-1 font-mono tracking-wider">
              {call.callerPhone}
            </p>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-2">
              {campaign.phoneNumber} ga qo'ng'iroq
            </p>
          </div>

          {/* ── BODY ── */}
          <div className="p-6">

            {/* ═══ STEP: RINGING ═══ */}
            {step === 'ringing' && (
              <div className="flex flex-col items-center gap-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">
                  Kiruvchi qo'ng'iroq...
                </p>

                {existingCustomer && (
                  <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Ro'yxatdagi mijoz</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <MdPerson className="text-indigo-500 text-lg" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{existingCustomer.fullName}</p>
                        {existingCustomer.address && (
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{existingCustomer.address}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-6 mt-2">
                  <button onClick={handleReject}
                    className="w-16 h-16 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-rose-200 active:scale-90 transition-all"
                  >
                    <MdCallEnd className="text-2xl" />
                  </button>
                  <button onClick={handleAnswer} disabled={loading}
                    className="w-16 h-16 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-200 active:scale-90 transition-all animate-bounce"
                  >
                    <MdCall className="text-2xl" />
                  </button>
                </div>
              </div>
            )}

            {/* ═══ STEP: ANSWERED — Gaplashmoqda ═══ */}
            {(step === 'answered' || step === 'completing') && (
              <div className="space-y-4">
                <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] text-center">
                  {existingCustomer ? 'Mavjud mijoz ma\'lumotlari' : 'Yangi mijozni ro\'yxatga oling'}
                </p>

                {/* Mijoz formasi */}
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Ism Familiya *</label>
                    <input
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Mijoz ism familiyasi"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:border-indigo-300 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Telefon 1</label>
                      <div className="relative">
                        <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                        <input
                          value={phone1}
                          onChange={e => setPhone1(e.target.value)}
                          className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-300 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Telefon 2</label>
                      <div className="relative">
                        <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                        <input
                          value={phone2}
                          onChange={e => setPhone2(e.target.value)}
                          placeholder="Qo'shimcha"
                          className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-300 outline-none focus:border-indigo-300 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Manzil</label>
                    <div className="relative">
                      <MdHome className="absolute left-3 top-3 text-slate-300 text-sm" />
                      <input
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="Shahar, ko'cha, uy"
                        className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-300 outline-none focus:border-indigo-300 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Izoh</label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Qo'shimcha izoh..."
                      rows={2}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-300 outline-none focus:border-indigo-300 resize-none transition-all"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <button onClick={onDismiss}
                    className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all active:scale-95"
                  >
                    Keyinroq
                  </button>
                  <button onClick={handleComplete} disabled={loading}
                    className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <MdCheck className="text-base" />
                        Saqlash
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
