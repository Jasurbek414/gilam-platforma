'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

const STATUS_COLOR: Record<string, string> = {
  "BO'SH": '#10b981',
  'BUYURTMA OLMOQDA': '#f59e0b',
  'YETKAZIB BERMOQDA': '#6366f1',
  'OVQATLANISHDA': '#94a3b8',
};

function createDriverIcon(status: string, selected: boolean, name: string) {
  const color = STATUS_COLOR[status] || '#6366f1';
  const size = selected ? 50 : 40;
  const initial = name[0] || 'D';
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 10}" viewBox="0 0 50 60">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="0" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      ${selected ? `<circle cx="25" cy="25" r="24" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="4 2">
        <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="10s" repeatCount="indefinite" />
      </circle>` : ''}
      <circle cx="25" cy="25" r="20" fill="${color}" filter="url(#shadow)" />
      <circle cx="25" cy="25" r="17" fill="white" fill-opacity="0.2" />
      <text x="25" y="31" text-anchor="middle" fill="white" font-size="14" font-family="Inter, sans-serif" font-weight="900">${initial}</text>
      <path d="M20,42 L25,55 L30,42" fill="${color}" filter="url(#shadow)" />
    </svg>`;

  return L.divIcon({
    html: svg,
    iconSize: [size, size + 10],
    iconAnchor: [size / 2, size + 10],
    popupAnchor: [0, -(size + 10)],
    className: 'driver-marker-icon',
  });
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 15, { duration: 1.5, easeLinearity: 0.25 });
  }, [lat, lng, map]);
  return null;
}

interface Driver {
  id: number;
  name: string;
  status: string;
  phone: string;
  car: string;
  location: string;
  lat: number;
  lng: number;
}

interface Props {
  drivers: Driver[];
  selected: Driver | null;
  onSelect: (d: Driver) => void;
  mapType: 'streets' | 'satellite' | 'terrain';
  showTraffic: boolean;
}

export default function DriverMap({ drivers, selected, onSelect, mapType, showTraffic }: Props) {
  const tileUrl = useMemo(() => {
    switch (mapType) {
      case 'satellite': return 'https://sat01.maps.yandex.net/tiles?l=sat&x={x}&y={y}&z={z}&lang=ru_RU';
      case 'terrain': return 'https://sat01.maps.yandex.net/tiles?l=sat,skl&x={x}&y={y}&z={z}&lang=ru_RU';
      default: return 'https://vec01.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}&lang=ru_RU';
    }
  }, [mapType]);

  const trafficUrl = 'https://core-jams-rdr-cache.maps.yandex.net/tiles?l=trf&x={x}&y={y}&z={z}&scale=1&lang=ru_RU';
  const attribution = '&copy; <a href="https://yandex.ru/maps/">Yandeks</a>';
  return (
    <div className="w-full h-full relative group bg-slate-50">
      <MapContainer
        center={[41.2995, 69.2401]}
        zoom={12}
        zoomControl={false}
        style={{ height: '100%', width: '100%', background: '#f8fafc' }}
        className="z-0"
      >
        <TileLayer
          attribution={attribution}
          url={tileUrl}
        />

        {showTraffic && (
          <TileLayer
             url={trafficUrl}
             opacity={0.7}
             zIndex={10}
          />
        )}
        
        {selected && <FlyTo lat={selected.lat} lng={selected.lng} />}
        
        {drivers.map(d => (
          <Marker
            key={d.id}
            position={[d.lat, d.lng]}
            icon={createDriverIcon(d.status, selected?.id === d.id, d.name)}
            eventHandlers={{ 
              click: () => onSelect(d),
              mouseover: (e) => e.target.openPopup(),
            }}
          >
            <Popup className="driver-popup">
              <div className="p-2 min-w-[160px] text-slate-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                    {d.name[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 leading-none mb-1">{d.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{d.status}</p>
                  </div>
                </div>
                <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                  <p className="text-[11px] text-slate-600 font-bold">🚗 {d.car}</p>
                  <p className="text-[11px] text-slate-400">📍 {d.location}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Zoom Indicators Overlay */}
      <div className="absolute bottom-10 right-10 z-10 flex flex-col gap-3">
        <button className="w-12 h-12 bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl flex items-center justify-center text-slate-800 font-bold hover:bg-slate-900 hover:text-white transition-all border border-white/50">+</button>
        <button className="w-12 h-12 bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl flex items-center justify-center text-slate-800 font-bold hover:bg-slate-900 hover:text-white transition-all border border-white/50">-</button>
      </div>

      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          border-radius: 20px;
          padding: 0;
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.8);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
        }
        .leaflet-popup-content {
          margin: 10px;
        }
        .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.95);
        }
      `}</style>
    </div>
  );
}
