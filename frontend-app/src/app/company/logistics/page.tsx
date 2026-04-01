'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  MdRoute, 
  MdOutlineLocationOn, 
  MdRefresh, 
  MdDirectionsCar, 
  MdPersonPinCircle,
  MdLayers,
  MdMyLocation
} from 'react-icons/md';

// Add type definition for Yandex Maps
declare global {
  interface Window {
    ymaps: any;
  }
}

export default function LogisticsPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [activeDriver, setActiveDriver] = useState<string | null>(null);
  const [showLayers, setShowLayers] = useState(false);

  useEffect(() => {
    const loadYandexMaps = () => {
      if (typeof window === 'undefined') return;

      if (!window.ymaps) {
        const script = document.createElement('script');
        script.src = 'https://api-maps.yandex.ru/2.1/?lang=uz_UZ&apikey=f3424d5d-222c-4734-9271-e5d8a0c5c567'; // Using public key for demo or no key
        script.async = true;
        script.onload = () => {
          if (window.ymaps) {
            window.ymaps.ready(initMap);
          }
        };
        document.head.appendChild(script);
      } else {
        window.ymaps.ready(initMap);
      }
    };

    const initMap = () => {
      if (!mapRef.current || !window.ymaps) return;

      // Clear the container just in case
      mapRef.current.innerHTML = '';

      mapInstance.current = new window.ymaps.Map(mapRef.current, {
        center: [41.311081, 69.240562], // Tashkent center
        zoom: 12,
        controls: ['zoomControl', 'fullscreenControl'] // typeSelector removed for custom one
      });

      const map = mapInstance.current;

      // Custom Driver Markers
      const drivers = [
        { id: '1', name: 'Sardor', pos: [41.325, 69.245], car: 'Damas (01 A 001 AA)', status: 'Liniyada' },
        { id: '2', name: 'Umid', pos: [41.285, 69.215], car: 'Labo (01 B 002 BB)', status: 'Yetkazmoqda' },
      ];

      // Custom Order Points
      const orderPoints = [
        { id: 'p1', name: 'Mijoz: Aliyev Vali', pos: [41.345, 69.265], type: 'pickup' },
        { id: 'p2', name: 'Mijoz: Karimov Anvar', pos: [41.275, 69.235], type: 'delivery' },
        { id: 'p3', name: 'Mijoz: Rasulov Jamshid', pos: [41.305, 69.205], type: 'delivery' },
      ];

      drivers.forEach(driver => {
        const placemark = new window.ymaps.Placemark(driver.pos, {
          balloonContent: `
            <div style="padding: 10px; font-family: sans-serif;">
              <h4 style="margin: 0 0 5px 0; color: #1e293b; font-weight: 800;">${driver.name}</h4>
              <p style="margin: 0; font-size: 12px; color: #64748b;">${driver.car}</p>
              <p style="margin: 5px 0 0 0; font-size: 11px; font-weight: 700; color: #10b981;">● ${driver.status}</p>
            </div>
          `,
          hintContent: driver.name
        }, {
          preset: 'islands#emeraldAutoCircleIcon'
        });
        map.geoObjects.add(placemark);
      });

      orderPoints.forEach(point => {
        const placemark = new window.ymaps.Placemark(point.pos, {
          balloonContent: `<b>${point.name}</b><br/>${point.type === 'pickup' ? 'Olib ketish' : 'Yetkazib berish'}`,
          hintContent: point.name
        }, {
          preset: point.type === 'pickup' ? 'islands#blueDotIcon' : 'islands#redDotIcon'
        });
        map.geoObjects.add(placemark);
      });

      setIsMapReady(true);
    };

    loadYandexMaps();
  }, []);

  const handleRefresh = () => {
    setIsMapReady(false);
    setTimeout(() => {
      setIsMapReady(true);
      alert('Ma\'lumotlar yangilandi! 🔄');
    }, 1000);
  };

  const changeLayer = (type: string) => {
    if (mapInstance.current) {
      mapInstance.current.setType(type);
      setShowLayers(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Logistika boshqaruvi <MdRoute className="text-blue-500" />
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Haydovchilarni real vaqt rejimida kuzating va yo'nalishlarni boshqaring.</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex gap-3 relative">
          <div className="relative">
            <button 
              onClick={() => setShowLayers(!showLayers)}
              className="flex items-center gap-2 bg-slate-100 text-slate-600 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition-all"
            >
              <MdLayers className="text-xl" />
              Qatlamlar
            </button>
            
            {showLayers && (
              <div className="absolute top-full mt-2 right-0 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                {[
                  { label: 'Xarita (Sxema)', value: 'yandex#map' },
                  { label: 'Sun\'iy yo\'ldosh', value: 'yandex#satellite' },
                  { label: 'Gibrid', value: 'yandex#hybrid' },
                ].map((l) => (
                  <button
                    key={l.value}
                    onClick={() => changeLayer(l.value)}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
          >
            <MdRefresh className="text-xl" />
            Yangilash
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-220px)] min-h-[600px]">
        {/* Map Side */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          {!isMapReady && (
            <div className="absolute inset-0 z-20 bg-slate-50/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600 font-bold animate-pulse">Yandex Maps yuklanmoqda...</p>
            </div>
          )}
          
          <div ref={mapRef} className="w-full h-full z-10" />
          
          {/* Map Controls Overlay */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <button className="p-3 bg-white rounded-xl shadow-lg hover:bg-slate-50 text-slate-600 transition-all border border-slate-100">
              <MdMyLocation className="text-xl" />
            </button>
          </div>

          {/* Quick Stats Overlay */}
          <div className="absolute bottom-6 left-6 z-20 flex gap-4 pointer-events-none">
            <div className="px-4 py-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Faol haydovchilar</p>
                <p className="text-lg font-black text-slate-800">5 ta</p>
              </div>
            </div>
             <div className="px-4 py-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Jami nuqtalar</p>
                <p className="text-lg font-black text-slate-800">12 ta</p>
              </div>
            </div>
          </div>
        </div>

        {/* List Side */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-black text-slate-800 tracking-tight">Xodimlar Liniyasi</h3>
            <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
              ONLINE
            </span>
          </div>
          
          <div className="p-0 overflow-y-auto flex-1 divide-y divide-slate-100">
            {[
              { id: '1', name: 'Sardor', car: 'Damas', plate: '01 A 001 AA', status: 'Liniyada', color: 'emerald', tasks: 3 },
              { id: '2', name: 'Umid', car: 'Labo', plate: '01 B 002 BB', status: 'Yetkazmoqda', color: 'blue', tasks: 2 },
              { id: '3', name: 'Otabek', car: 'Damas', plate: '10 C 003 CC', status: 'Dam olishda', color: 'slate', tasks: 0 },
              { id: '4', name: 'Jasur', car: 'Labo', plate: '01 D 004 DD', status: 'Liniyada', color: 'emerald', tasks: 5 },
            ].map((driver) => (
              <div 
                key={driver.id} 
                onClick={() => setActiveDriver(driver.id)}
                className={`p-5 transition-all cursor-pointer group hover:bg-slate-50 ${activeDriver === driver.id ? 'bg-blue-50/50 ring-1 ring-inset ring-blue-100' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 group-hover:scale-110 transition-transform">
                        {driver.name[0]}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-${driver.color}-500`}></span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{driver.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{driver.car} • {driver.plate}</p>
                    </div>
                  </div>
                  <MdDirectionsCar className={`${activeDriver === driver.id ? 'text-blue-500' : 'text-slate-300'} text-xl transition-colors`} />
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md bg-${driver.color}-50 text-${driver.color}-600 uppercase`}>
                    {driver.status}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {driver.tasks > 0 ? `${driver.tasks} ta manzil` : "Vazifa yo'q"}
                  </span>
                </div>

                {activeDriver === driver.id && driver.tasks > 0 && (
                  <div className="mt-4 pt-4 border-t border-blue-100 space-y-2 animate-in slide-in-from-top-2 duration-300">
                     <div className="flex items-center gap-2 text-xs font-medium text-blue-700">
                        <MdPersonPinCircle className="text-base" />
                        <span>Hozirgi: Yunusobod, 4-kvartal</span>
                     </div>
                     <button className="w-full py-2 bg-blue-600 text-white text-[10px] font-black rounded-lg shadow-sm hover:bg-blue-700 transition-all uppercase tracking-widest">
                        Marshrutni ko'rish
                     </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <button className="w-full py-3 bg-white border border-slate-200 text-slate-600 text-xs font-black rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
              <MdRoute className="text-lg" />
              HAMMA MARSHRUTLARNI CHIZISH
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
