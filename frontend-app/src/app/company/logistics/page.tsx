'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  MdRoute, 
  MdRefresh, 
  MdDirectionsCar,
} from 'react-icons/md';
import { usersApi, ordersApi, getUser } from '@/lib/api';
import toast from 'react-hot-toast';

// Load map component dynamically to avoid SSR issues
const LogisticsMap = dynamic(() => import('@/components/logistics/LogisticsMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-50 animate-pulse flex items-center justify-center text-slate-400 font-bold uppercase text-xs tracking-widest">Xarita tayyorlanmoqda...</div>
});

export default function LogisticsPage() {
  const [activeDriver, setActiveDriver] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [orderPoints, setOrderPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBackendData = async () => {
    try {
      const user = getUser();
      if (!user?.companyId) return;
      const allUsers = await usersApi.getByCompany(user.companyId);
      const allOrders = await ordersApi.getByCompany(user.companyId);
      
      const realDrivers = allUsers.filter((u: any) => u.role === 'DRIVER');
      
      const points = allOrders
        .filter((o: any) => o.customer?.location || o.customer?.address)
        .map((o: any) => {
          let pos: [number, number] = [41.311081, 69.240562];
          if (o.customer?.location) {
            if (typeof o.customer.location === 'object') {
              pos = [o.customer.location.y || o.customer.location.lat, o.customer.location.x || o.customer.location.lng];
            } else if (typeof o.customer.location === 'string') {
               if (o.customer.location.trim().startsWith('{')) {
                 try {
                   const parsed = JSON.parse(o.customer.location);
                   pos = [parsed.y || parsed.lat, parsed.x || parsed.lng];
                 } catch(e) {}
               } else if (o.customer.location.includes(',')) {
                 const clean = o.customer.location.replace(/[()]/g, '');
                 const parts = clean.split(',').map(Number);
                 pos = [parts[1] || parts[0], parts[0] || parts[1]];
               }
            }
          }
          return {
            id: o.id,
            name: o.customer?.fullName || 'Mijoz',
            pos: pos,
            type: (o.status === 'NEW' || o.status === 'DRIVER_ASSIGNED') ? 'pickup' : 'delivery'
          }
        });
      
      const mappedDrivers = realDrivers.map((d: any, i: number) => {
        let pos: [number, number] = [41.311081 + (i*0.01), 69.240562 + (i*0.01)];
        if (d.currentLocation) {
          if (typeof d.currentLocation === 'object') {
            pos = [d.currentLocation.y || d.currentLocation.lat, d.currentLocation.x || d.currentLocation.lng];
          } else if (typeof d.currentLocation === 'string') {
            if (d.currentLocation.trim().startsWith('{')) {
              try {
                const parsed = JSON.parse(d.currentLocation);
                pos = [parsed.y || parsed.lat, parsed.x || parsed.lng];
              } catch(e) {}
            } else if (d.currentLocation.includes(',')) {
              const clean = d.currentLocation.replace(/[()]/g, '');
              const parts = clean.split(',').map(Number);
              // PostgreSQL point format is (x, y) meaning (longitude, latitude). Leaflet wants [latitude, longitude].
              pos = [parts[1] || parts[0], parts[0] || parts[1]];
            }
          }
        }
        return {
          id: d.id,
          name: d.fullName,
          pos: pos,
          car: d.phone,
          status: d.status === 'ACTIVE' ? 'Liniyada' : 'Dam olishda',
          tasks: points.filter(p => p.type === 'pickup').length
        };
      });

      setDrivers(mappedDrivers);
      setOrderPoints(points);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackendData();
    const interval = setInterval(() => {
      loadBackendData();
    }, 5000); // 5 seconds real-time auto-refresh interval.
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            Logistika <MdRoute className="text-blue-500" />
          </h1>
          <p className="text-slate-500 text-sm font-medium">Haydovchilarni real vaqtda kuzating (Google Maps Detailed)</p>
        </div>
        <button 
          onClick={() => { setLoading(true); loadBackendData(); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg transition-all"
        >
          <MdRefresh className="text-xl" /> Yangilash
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-220px)] min-h-[500px]">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <LogisticsMap drivers={drivers} orderPoints={orderPoints} activeDriverId={activeDriver} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-y-auto">
          <div className="p-5 border-b bg-slate-50 flex justify-between">
            <h3 className="font-black text-slate-800 text-sm">Haydovchilar</h3>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
          <div className="divide-y divide-slate-100">
            {drivers.map(driver => (
              <div 
                key={driver.id} 
                onClick={() => setActiveDriver(driver.id)}
                className={`p-4 cursor-pointer hover:bg-slate-50 transition-all ${activeDriver === driver.id ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold">{driver.name[0]}</div>
                  <div>
                    <p className="text-sm font-bold">{driver.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{driver.car}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
