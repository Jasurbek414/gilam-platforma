'use client';

import { useEffect, useState } from 'react';
import { request, getUser } from '@/lib/api';

interface Order {
  id: string;
  status: string;
  customer?: { fullName: string; phone1: string; address?: string };
  totalAmount: number;
  items?: any[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DriverHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        // Barcha buyurtmalarni olish va delivered/cancelled filterini qo'yish
        const companyId = user.companyId || user.company?.id;
        if (!companyId) return;
        const data = await request<Order[]>(`/orders/company/${companyId}`);
        const myOrders = (data || []).filter(
          (o: Order) => o.status === 'DELIVERED' || o.status === 'CANCELLED'
        );
        setOrders(myOrders);
      } catch (err) {
        console.error('Tarix yuklashda xatolik:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
        📜 Bajarilgan buyurtmalar
      </h2>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl block mb-3">📭</span>
          <p className="text-slate-400 font-medium">Hali bajarilgan buyurtma yo&apos;q</p>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{order.status === 'DELIVERED' ? '✅' : '❌'}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                  order.status === 'DELIVERED'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {order.status === 'DELIVERED' ? 'Yetkazildi' : 'Bekor qilindi'}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">#{order.id.substring(0, 8)}</span>
            </div>

            {order.customer && (
              <div>
                <p className="font-bold text-slate-700 text-sm">{order.customer.fullName}</p>
                <p className="text-xs text-slate-400">{order.customer.address || order.customer.phone1}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-slate-50">
              <span className="text-xs text-slate-400">
                {new Date(order.updatedAt).toLocaleDateString('uz-UZ')}
              </span>
              <span className="font-black text-emerald-600 text-sm">
                {Number(order.totalAmount).toLocaleString()} so&apos;m
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
