'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  MdPhone, MdPhoneEnabled, MdPhoneDisabled, MdSave, MdRefresh,
  MdVisibility, MdVisibilityOff, MdCheckCircle, MdError, MdWarning,
  MdSignalCellularAlt, MdVpnKey, MdRouter, MdTune, MdSecurity,
  MdInfo, MdWifi, MdWifiOff, MdSyncAlt,
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { telephonyApi, getUser } from '@/lib/api';
import { useSip } from '@/hooks/useSip';

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface SipForm {
  displayName: string;
  username: string;
  password: string;
  domain: string;
  server: string;
  port: string;
  transport: 'UDP' | 'TCP' | 'TLS';
  stunServer: string;
  registerExpiry: string;
  enabled: boolean;
}

const DEFAULT_FORM: SipForm = {
  displayName: '',
  username: '',
  password: '',
  domain: '',
  server: '',
  port: '5060',
  transport: 'UDP',
  stunServer: 'stun:stun.l.google.com:19302',
  registerExpiry: '300',
  enabled: true,
};

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status, error }: { status: string; error: string | null }) {
  const map = {
    registered: {
      icon: MdPhoneEnabled,
      label: 'Ulangan',
      dot: 'bg-emerald-400',
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-700',
    },
    connecting: {
      icon: MdSyncAlt,
      label: 'Ulanmoqda...',
      dot: 'bg-amber-400 animate-pulse',
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-700',
    },
    error: {
      icon: MdPhoneDisabled,
      label: 'Ulanmadi',
      dot: 'bg-rose-400',
      bg: 'bg-rose-50 border-rose-200',
      text: 'text-rose-700',
    },
    idle: {
      icon: MdPhone,
      label: 'Kutish',
      dot: 'bg-slate-300',
      bg: 'bg-slate-50 border-slate-200',
      text: 'text-slate-500',
    },
    in_call: {
      icon: MdPhoneEnabled,
      label: "Qo'ng'iroqda",
      dot: 'bg-indigo-400 animate-pulse',
      bg: 'bg-indigo-50 border-indigo-200',
      text: 'text-indigo-700',
    },
    calling: {
      icon: MdPhone,
      label: 'Qo\'ng\'iroq ketmoqda',
      dot: 'bg-blue-400 animate-pulse',
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-700',
    },
  } as const;

  const s = map[status as keyof typeof map] || map.idle;
  const Icon = s.icon;

  return (
    <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border ${s.bg}`}>
      <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
      <Icon className={`text-lg ${s.text}`} />
      <div>
        <p className={`text-sm font-black ${s.text}`}>{s.label}</p>
        {error && (
          <p className="text-[10px] font-bold text-rose-500 mt-0.5">{error}</p>
        )}
      </div>
    </div>
  );
}

// ─── FIELD ───────────────────────────────────────────────────────────────────
function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {label}
      </label>
      {children}
      {hint && <p className="text-[10px] text-slate-400 font-medium">{hint}</p>}
    </div>
  );
}

// ─── INPUT ────────────────────────────────────────────────────────────────────
function Input({
  type = 'text', value, onChange, placeholder, disabled, className = '',
}: {
  type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean; className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed font-mono ${className}`}
    />
  );
}

// ─── SECTION CARD ─────────────────────────────────────────────────────────────
function Section({
  icon: Icon, title, subtitle, children,
}: { icon: any; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-4 px-7 py-5 border-b border-slate-50 bg-slate-50/50">
        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
          <Icon className="text-lg text-indigo-500" />
        </div>
        <div>
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">{title}</h3>
          {subtitle && <p className="text-[10px] text-slate-400 font-medium mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-7">{children}</div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function TelephonyPage() {
  const user = getUser();
  const companyId = user?.companyId || user?.company?.id || '';

  const { status, error } = useSip();

  const [form, setForm] = useState<SipForm>(DEFAULT_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Mavjud konfiguratsiyani yuklash
  const load = useCallback(async () => {
    if (!companyId) { setLoading(false); return; }
    try {
      setLoading(true);
      const data = await telephonyApi.getConfig(companyId);
      if (data && (data.server || data.domain || data.username)) {
        setForm({
          displayName: data.displayName || '',
          username: data.username || data.login || '',
          password: data.password || '',
          domain: data.domain || data.server || '',
          server: data.server || data.domain || '',
          port: data.port ? String(data.port) : '5060',
          transport: data.transport || 'UDP',
          stunServer: data.stunServer || 'stun:stun.l.google.com:19302',
          registerExpiry: data.registerExpiry ? String(data.registerExpiry) : '300',
          enabled: data.enabled !== false,
        });
      }
    } catch {
      // Birinchi marta — bo'sh forma
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const patch = (key: keyof SipForm, val: any) => {
    setForm(f => ({ ...f, [key]: val }));
    setDirty(true);
  };

  const handleSave = async () => {
    if (!companyId) { toast.error('CompanyId topilmadi'); return; }
    if (!form.username) { toast.error('SIP username (kengaytma) kiritilmagan'); return; }
    if (!form.server && !form.domain) { toast.error('SIP server manzili kiritilmagan'); return; }

    setSaving(true);
    try {
      await telephonyApi.updateConfig({
        companyId,
        credentials: {
          ...form,
          port: Number(form.port) || 5060,
          registerExpiry: Number(form.registerExpiry) || 300,
        },
      });
      toast.success('SIP sozlamalari saqlandi');
      setDirty(false);
    } catch (e: any) {
      toast.error(e.message || 'Saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${
              status === 'registered' ? 'bg-emerald-400 animate-pulse'
              : status === 'connecting' ? 'bg-amber-400 animate-ping'
              : 'bg-rose-400'
            }`} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              IP-Telefoniya / SIP
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Telefoniya Sozlamalari</h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            SIP hisob ma'lumotlari — MicroSIP, Asterisk, FreePBX bilan ishlaydi
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            title="Qayta yuklash"
          >
            <MdRefresh className="text-xl" />
          </button>
          <AnimatePresence>
            {dirty && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                <MdSave className="text-lg" />
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── REAL-TIME STATUS ── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              status === 'registered' ? 'bg-emerald-50' : 'bg-slate-50'
            }`}>
              <MdPhone className={`text-2xl ${
                status === 'registered' ? 'text-emerald-500' : 'text-slate-300'
              }`} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                SIP Holati (real vaqt)
              </p>
              <StatusBadge status={status} error={error} />
            </div>
          </div>

          {/* Tezkor ma'lumot */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-2xl px-4 py-3 text-center min-w-[100px]">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Server</p>
              <p className="text-xs font-black text-slate-700 font-mono truncate max-w-[120px]">
                {form.server || '—'}
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl px-4 py-3 text-center min-w-[80px]">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Kengaytma</p>
              <p className="text-xs font-black text-slate-700 font-mono">
                {form.username || '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── SIP ACCOUNT ── */}
      <Section icon={MdVpnKey} title="SIP Hisob" subtitle="Shaxsiy ma'lumotlar va autentifikatsiya">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Ko'rsatiladigan Ism" hint="Qo'ng'iroqda ko'rinadigan ism">
            <Input
              value={form.displayName}
              onChange={v => patch('displayName', v)}
              placeholder="Masalan: Operator 101"
            />
          </Field>

          <Field label="SIP Kengaytma (Username)" hint="FreePBX / Asterisk da tayinlangan raqam">
            <Input
              value={form.username}
              onChange={v => patch('username', v)}
              placeholder="101"
            />
          </Field>

          <Field label="Parol" hint="SIP hisob paroli">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={v => patch('password', v)}
                placeholder="••••••••"
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <MdVisibilityOff className="text-lg" /> : <MdVisibility className="text-lg" />}
              </button>
            </div>
          </Field>

          <Field label="SIP Domain" hint="SIP server domeni yoki IP (agar server bilan farq qilsa)">
            <Input
              value={form.domain}
              onChange={v => patch('domain', v)}
              placeholder="10.100.100.1"
            />
          </Field>
        </div>

        {/* Faollashtirish */}
        <div className="mt-5 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <button
            type="button"
            onClick={() => patch('enabled', !form.enabled)}
            className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
              form.enabled ? 'bg-indigo-500' : 'bg-slate-300'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
              form.enabled ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
          <div>
            <p className="text-xs font-black text-slate-700">
              {form.enabled ? 'Hisob faollashtirilgan' : 'Hisob o\'chirilgan'}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              O'chirish SIP serverga ulanishni to'xtatadi
            </p>
          </div>
        </div>
      </Section>

      {/* ── SERVER SETTINGS ── */}
      <Section icon={MdRouter} title="Server Sozlamalari" subtitle="SIP server ulanish parametrlari">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <Field label="SIP Server Manzili" hint="IP yoki hostname">
              <Input
                value={form.server}
                onChange={v => patch('server', v)}
                placeholder="10.100.100.1  yoki  sip.zadarma.com"
              />
            </Field>
          </div>

          <Field label="Port" hint="Odatda 5060 (UDP/TCP) yoki 5061 (TLS)">
            <Input
              value={form.port}
              onChange={v => patch('port', v)}
              placeholder="5060"
            />
          </Field>
        </div>

        <div className="mt-5">
          <Field label="Transport Protokoli" hint="UDP — eng keng tarqalgan, TLS — shifrlangan">
            <div className="grid grid-cols-3 gap-3 mt-1">
              {(['UDP', 'TCP', 'TLS'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    patch('transport', t);
                    if (t === 'TLS' && form.port === '5060') patch('port', '5061');
                    if (t !== 'TLS' && form.port === '5061') patch('port', '5060');
                  }}
                  className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                    form.transport === t
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
                >
                  {t}
                  {t === 'TLS' && <span className="ml-1 text-[8px] opacity-70">🔒</span>}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="mt-5">
          <Field label="Ro'yxatdan O'tish Muddati (soniya)" hint="300s = 5 daqiqa — FreePBX tavsiyasi">
            <div className="flex items-center gap-3">
              <Input
                value={form.registerExpiry}
                onChange={v => patch('registerExpiry', v)}
                placeholder="300"
                className="flex-1"
              />
              <div className="flex gap-2">
                {['60', '300', '600', '3600'].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => patch('registerExpiry', v)}
                    className={`px-3 py-3 text-[10px] font-black rounded-xl border transition-all ${
                      form.registerExpiry === v
                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {v === '60' ? '1d' : v === '300' ? '5d' : v === '600' ? '10d' : '1s'}
                  </button>
                ))}
              </div>
            </div>
          </Field>
        </div>
      </Section>

      {/* ── NETWORK / STUN ── */}
      <Section icon={MdWifi} title="Tarmoq va NAT" subtitle="STUN server va NAT oshib o'tish">
        <Field label="STUN Server" hint="NAT orqasida ishlash uchun. Mahalliy tarmoqda shart emas">
          <div className="flex gap-3">
            <Input
              value={form.stunServer}
              onChange={v => patch('stunServer', v)}
              placeholder="stun:stun.l.google.com:19302"
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => patch('stunServer', '')}
              className="px-4 py-3 text-[10px] font-black bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all whitespace-nowrap"
            >
              O'chirish
            </button>
          </div>
        </Field>

        {/* NAT tavsiya */}
        <div className="mt-4 flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <MdInfo className="text-blue-400 text-lg shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-blue-700 mb-0.5">Mahalliy tarmoq uchun maslahat</p>
            <p className="text-[11px] text-blue-500 font-medium leading-relaxed">
              FreePBX va operator bir xil tarmoqda bo'lsa (masalan WireGuard orqali), STUN shart emas.
              WireGuard IP: <span className="font-mono font-black">10.100.100.x</span> dan foydalaning.
            </p>
          </div>
        </div>
      </Section>

      {/* ── SECURITY ── */}
      <Section icon={MdSecurity} title="Xavfsizlik Ma'lumoti">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: MdSecurity,
              title: 'Shifrlangan saqlash',
              desc: 'Parollar backend da JSONB formatida saqlanadi',
              ok: true,
            },
            {
              icon: form.transport === 'TLS' ? MdWifi : MdWifiOff,
              title: `Transport: ${form.transport}`,
              desc: form.transport === 'TLS'
                ? 'Aloqa shifrlangan (TLS)'
                : 'Aloqa shifrlanmagan — korporativ tarmoq uchun yetarli',
              ok: form.transport === 'TLS',
            },
            {
              icon: form.enabled ? MdCheckCircle : MdError,
              title: form.enabled ? 'Hisob faol' : 'Hisob o\'chirilgan',
              desc: form.enabled
                ? 'SIP server bilan doimiy ro\'yxatdan o\'tishga harakat qiladi'
                : 'SIP ulanish to\'xtatilgan',
              ok: form.enabled,
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className={`flex items-start gap-3 p-4 rounded-2xl border ${
                  item.ok ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'
                }`}
              >
                <Icon className={`text-lg shrink-0 mt-0.5 ${item.ok ? 'text-emerald-500' : 'text-amber-500'}`} />
                <div>
                  <p className={`text-xs font-black ${item.ok ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {item.title}
                  </p>
                  <p className={`text-[10px] font-medium mt-0.5 ${item.ok ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── SOZLAMALAR QOʻLLANMASI ── */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-7 text-white">
        <div className="flex items-center gap-3 mb-5">
          <MdTune className="text-xl text-indigo-300" />
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-200">
            FreePBX / MicroSIP Ulanish Yo'riqnomasi
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              step: '1',
              title: 'FreePBX da kengaytma yarating',
              items: [
                'Applications → Extensions → Add Extension',
                'User Extension: 101, 102, 103...',
                'Secret (parol) ni yozib oling',
                'Submit & Apply Config',
              ],
            },
            {
              step: '2',
              title: 'WireGuard orqali ulaning',
              items: [
                'WireGuard VPN ishlamoqda bo\'lsin',
                'FreePBX IP: 10.100.100.1',
                'SIP port: 5060 ochiq bo\'lsin',
                'WireGuard tunel orqali ping ishlashini tekshiring',
              ],
            },
            {
              step: '3',
              title: 'Bu yerda sozlamalarni kiriting',
              items: [
                'Server: 10.100.100.1',
                'Username: kengaytma raqam (101)',
                'Parol: FreePBX da belgilangan',
                'Transport: UDP (odatda)',
              ],
            },
          ].map(s => (
            <div key={s.step} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-black shrink-0">
                  {s.step}
                </div>
                <p className="text-xs font-black text-slate-200">{s.title}</p>
              </div>
              <ul className="space-y-1.5 ml-10">
                {s.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-indigo-400 rounded-full shrink-0 mt-1.5" />
                    <p className="text-[11px] text-slate-400 font-medium">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM SAVE BUTTON ── */}
      <div className="flex items-center justify-between bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-3">
          <StatusBadge status={status} error={error} />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
        >
          <MdSave className="text-lg" />
          {saving ? 'Saqlanmoqda...' : 'Sozlamalarni Saqlash'}
        </button>
      </div>

    </div>
  );
}
