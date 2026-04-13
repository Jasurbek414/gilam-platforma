'use client';

import { useEffect, useState, useCallback } from 'react';
import { request, getUser } from '@/lib/api';

interface Order {
  id: string;
  status: string;
  customer?: { fullName: string; phone1: string; address?: string };
  items?: any[];
  totalAmount: number;
  notes?: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string; next?: string; nextLabel?: string }> = {
  DRIVER_ASSIGNED: {
    label: 'Tayinlangan',
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    icon: '📌',
    next: 'PICKED_UP',
    nextLabel: '🏠 Olib ketdim',
  },
  PICKED_UP: {
    label: 'Olib ketilgan',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: '📦',
    next: 'AT_FACILITY',
    nextLabel: '🏭 Sexga olib keldim',
  },
  AT_FACILITY: {
    label: 'Sexda',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    icon: '🏭',
  },
  WASHING: {
    label: 'Yuvilmoqda',
    color: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    icon: '🧼',
  },
  DRYING: {
    label: 'Quritilmoqda',
    color: 'bg-sky-100 text-sky-700 border-sky-300',
    icon: '☀️',
  },
  READY_FOR_DELIVERY: {
    label: 'Yetkazishga tayyor',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    icon: '✅',
    next: 'OUT_FOR_DELIVERY',
    nextLabel: '🚐 Yetkazishga chiqdim',
  },
  OUT_FOR_DELIVERY: {
    label: 'Yetkazilmoqda',
    color: 'bg-green-100 text-green-700 border-green-300',
    icon: '🚐',
    next: 'DELIVERED',
    nextLabel: '✅ Topshirdim',
  },
};

export default function DriverDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const user = getUser();

  const loadOrders = useCallback(async () => {
    if (!user) return;
    try {
      const data = await request<Order[]>(`/orders/driver/${user.id}`);
      setOrders(data || []);
    } catch (err) {
      console.error('Buyurtmalar yuklashda xatolik:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadOrders();
    // Har 30 sekundda yangilash
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await request(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      await loadOrders();
    } catch (err: any) {
      alert('Xatolik: ' + (err.message || 'Status yangilanmadi'));
    } finally {
      setUpdatingId(null);
    }
  };

  const callCustomer = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Stats header */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 text-white shadow-lg">
          <p className="text-3xl font-black">{orders.length}</p>
          <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wider mt-1">Aktiv buyurtmalar</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 text-white shadow-lg">
          <p className="text-3xl font-black">
            {orders.filter(o => o.status === 'DRIVER_ASSIGNED').length}
          </p>
          <p className="text-xs font-semibold text-amber-100 uppercase tracking-wider mt-1">Kutayotgan</p>
        </div>
      </div>

      {/* Pull to refresh hint */}
      <button
        onClick={loadOrders}
        className="w-full py-2 text-center text-xs text-slate-400 font-bold uppercase tracking-wider hover:text-emerald-500 transition-colors"
      >
        🔄 Yangilash
      </button>

      {/* Orders list */}
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-6xl block mb-4">📭</span>
          <h3 className="text-lg font-bold text-slate-600">Hozircha buyurtma yo&apos;q</h3>
          <p className="text-sm text-slate-400 mt-1">Yangi buyurtma kelganda bu yerda ko&apos;rinadi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const config = STATUS_CONFIG[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-600', icon: '📋' };

            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                {/* Order header */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{config.icon}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    #{order.id.substring(0, 8)}
                  </span>
                </div>

                {/* Customer info */}
                {order.customer && (
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">{order.customer.fullName}</p>
                        <p className="text-sm text-slate-500">{order.customer.phone1}</p>
                      </div>
                      <button
                        onClick={() => callCustomer(order.customer!.phone1)}
                        className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 hover:bg-green-600 active:scale-95 transition-all"
                      >
                        <span className="text-xl">📞</span>
                      </button>
                    </div>

                    {order.customer.address && (
                      <div className="bg-slate-50 rounded-xl p-3 flex items-start gap-2">
                        <span className="text-lg shrink-0">📍</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{order.customer.address}</p>
                          <button
                            onClick={() => window.open(`https://yandex.uz/maps/?text=${encodeURIComponent(order.customer!.address || '')}`, '_blank')}
                            className="text-xs text-blue-500 font-bold mt-1 hover:underline"
                          >
                            Xaritada ochish →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Items count + total */}
                <div className="px-4 py-2 flex items-center justify-between bg-slate-50 text-sm">
                  <span className="text-slate-500 font-medium">
                    {order.items?.length || 0} ta mahsulot
                  </span>
                  <span className="font-black text-emerald-600 text-base">
                    {Number(order.totalAmount).toLocaleString()} so&apos;m
                  </span>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="px-4 py-2 border-t border-slate-100">
                    <p className="text-xs text-slate-500 italic">💬 {order.notes}</p>
                  </div>
                )}

                {/* Action button */}
                {config.next && (
                  <div className="p-3 border-t border-slate-100">
                    <button
                      onClick={() => updateStatus(order.id, config.next!)}
                      disabled={updatingId === order.id}
                      className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-base rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-xl active:scale-[0.98] disabled:opacity-50 transition-all uppercase tracking-wider"
                    >
                      {updatingId === order.id ? '⏳ Yuklanmoqda...' : config.nextLabel}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
