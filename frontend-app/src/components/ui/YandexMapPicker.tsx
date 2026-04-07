'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface GoogleMapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLocation?: { lat: number, lng: number };
  searchQuery?: string;
}

// Map updater to handle flying/panning
function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

// Location selection handler
function LocationMarker({ onSelect, initialPos }: { onSelect: any, initialPos: [number, number] }) {
  const [position, setPosition] = useState<[number, number]>(initialPos);
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onSelect(lat, lng);
    },
  });

  return (
    <Marker position={position} icon={icon} draggable={true} eventHandlers={{
      dragend: (e) => {
        const marker = e.target;
        const { lat, lng } = marker.getLatLng();
        setPosition([lat, lng]);
        onSelect(lat, lng);
      }
    }} />
  );
}

export default function GoogleMapPicker({ onLocationSelect, initialLocation, searchQuery }: GoogleMapPickerProps) {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [zoom, setZoom] = useState(13);
  const [loading, setLoading] = useState(false);

  // Handle address geocoding using Nominatim (Free)
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3) return;

    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      const q = searchQuery.toLowerCase().includes('toshkent') ? searchQuery : `Toshkent, ${searchQuery}`;
      
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            setCoords([lat, lng]);
            setZoom(18); // Zoom in close to see buildings
          }
        })
        .catch(err => console.error('Geocoding error:', err))
        .finally(() => setLoading(false));
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelect = (lat: number, lng: number) => {
    // Reverse geocoding to get address string
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(res => res.json())
      .then(data => {
        const addr = data.display_name || 'Tanlangan manzil';
        onLocationSelect(lat, lng, addr);
      });
  };

  const initialPos: [number, number] = initialLocation ? [initialLocation.lat, initialLocation.lng] : [41.2995, 69.2401];

  return (
    <div className="w-full h-[350px] rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner relative bg-slate-50">
      <MapContainer 
        center={initialPos} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
      >
        {/* Google Maps Roadmap Layer (Very detailed for Tashkent) */}
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        />
        <LocationMarker onSelect={handleSelect} initialPos={initialPos} />
        {coords && <MapUpdater center={coords} zoom={zoom} />}
      </MapContainer>

      {loading && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-[1000] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 z-[1000] bg-white px-3 py-1.5 rounded-xl shadow-lg border border-slate-100 pointer-events-none">
        <p className="text-[9px] font-black text-slate-400调节 uppercase tracking-widest text-center">Google Maps • Detailed</p>
      </div>
    </div>
  );
}
