'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';


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

const GOOGLE_MAPS_TILES = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";

interface LogisticsMapProps {
  drivers: any[];
  orderPoints: any[];
  activeDriverId?: string | null;
}

function MapController({ activeDriverId, drivers }: { activeDriverId?: string | null, drivers: any[] }) {
  const map = useMap();
  React.useEffect(() => {
    if (activeDriverId) {
      const driver = drivers.find(d => d.id === activeDriverId);
      if (driver && driver.pos && Array.isArray(driver.pos) && driver.pos.length === 2 && !isNaN(driver.pos[0])) {
        map.flyTo(driver.pos as L.LatLngExpression, 16, { animate: true, duration: 1.2 });
      }
    }
  }, [activeDriverId, drivers, map]);
  return null;
}

export default function LogisticsMap({ drivers, orderPoints, activeDriverId }: LogisticsMapProps) {
  return (
    <div className="w-full h-full min-h-[500px] border-4 border-slate-100 relative bg-slate-50">
      <MapContainer 
        center={[41.311081, 69.240562]} 
        zoom={12} 
        style={{ height: '100%', width: '100%', minHeight: '500px' }}
      >
        <MapController activeDriverId={activeDriverId} drivers={drivers} />
        <TileLayer
          attribution='&copy; Google Maps'
          url={GOOGLE_MAPS_TILES}
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
