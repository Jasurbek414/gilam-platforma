'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icons
const driverIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

const pickupIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1673/1673188.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const deliveryIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1673/1673221.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const YANDEX_TILES = "https://vec0{s}.maps.yandex.net/tiles?l=map&v=2.26.0&x={x}&y={y}&z={z}&lang=uz_UZ";

interface LogisticsMapProps {
  drivers: any[];
  orderPoints: any[];
}

export default function LogisticsMap({ drivers, orderPoints }: LogisticsMapProps) {
  return (
    <div className="w-full h-full min-h-[500px] border-4 border-slate-100 relative bg-slate-50">
      <MapContainer 
        center={[41.311081, 69.240562]} 
        zoom={12} 
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; Yandex'
          url={YANDEX_TILES}
          subdomains={['1', '2', '3', '4']}
        />
        {drivers.map(driver => (
          <Marker key={driver.id} position={driver.pos} icon={driverIcon}>
            <Popup>
              <div className="p-2">
                <h4 className="font-bold">{driver.name}</h4>
                <p className="text-xs text-slate-500">{driver.car}</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase mt-1">● {driver.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        {orderPoints.map(point => (
          <Marker key={point.id} position={point.pos} icon={point.type === 'pickup' ? pickupIcon : deliveryIcon}>
            <Popup>
              <div className="p-1">
                <p className="font-bold text-xs">{point.name}</p>
                <p className="text-[10px] uppercase font-bold text-blue-500">{point.type === 'pickup' ? 'Olib ketish' : 'Yetkazib berish'}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
