'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet + Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLocation?: { lat: number, lng: number };
}

function LocationMarker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

// Center map to current location if available
function SetViewOnClick({ animateRef }: { animateRef: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (animateRef) {
       map.locate().on("locationfound", function (e) {
          map.flyTo(e.latlng, map.getZoom());
       });
    }
  }, [animateRef, map]);
  return null;
}

export default function MapPicker({ onLocationSelect, initialLocation }: MapPickerProps) {
  const [loading, setLoading] = useState(false);

  const handleSelect = async (lat: number, lng: number) => {
    setLoading(true);
    try {
      // Reverse geocoding using Nominatim (OpenStreetMap)
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=uz`);
      const data = await res.json();
      onLocationSelect(lat, lng, data.display_name || `Kordinata: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      onLocationSelect(lat, lng, `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-[300px] rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner relative">
      <MapContainer 
        center={[initialLocation?.lat || 41.2995, initialLocation?.lng || 69.2401]} // Tashkent
        zoom={13} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onSelect={handleSelect} />
        <SetViewOnClick animateRef={!initialLocation} />
      </MapContainer>
      
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-[1000] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 z-[1000] bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Xaritadan tanlang</p>
      </div>
    </div>
  );
}
