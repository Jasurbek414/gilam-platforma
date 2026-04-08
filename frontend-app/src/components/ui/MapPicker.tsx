'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MdMyLocation, MdSearch, MdLocationOn } from 'react-icons/md';

// Google Maps Roadmap Tiles - Universal and stable globally
const GOOGLE_MAPS_TILES = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";

// Custom elegant marker
const customIcon = L.divIcon({
  className: 'custom-map-marker',
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
      <div style="position: absolute; width: 100%; height: 100%; background-color: rgba(79, 70, 229, 0.2); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: absolute; width: 24px; height: 24px; background-color: #4f46e5; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>
      <div style="position: absolute; bottom: -8px; width: 4px; height: 12px; background-color: #4f46e5; border-radius: 2px;"></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLocation?: { lat: number, lng: number };
}

function MapUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

function LocationMarker({ onSelect, position, setPosition }: { onSelect: any, position: [number, number], setPosition: any }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onSelect(lat, lng);
    },
  });

  return (
    <Marker 
      position={position} 
      icon={customIcon} 
      draggable={true} 
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const { lat, lng } = marker.getLatLng();
          setPosition([lat, lng]);
          onSelect(lat, lng);
        }
      }} 
    />
  );
}

export default function MapPicker({ onLocationSelect, initialLocation }: MapPickerProps) {
  const defaultPos: [number, number] = initialLocation ? [initialLocation.lat, initialLocation.lng] : [41.2995, 69.2401]; // Tashkent
  const [position, setPosition] = useState<[number, number]>(defaultPos);
  const [zoom, setZoom] = useState(13);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [addressLine, setAddressLine] = useState('Xaritadan joyni belgilang');

  // Handle Reverse Geocoding
  const handleSelect = (lat: number, lng: number) => {
    setIsSearching(true);
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(res => res.json())
      .then(data => {
        const addr = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        setAddressLine(addr);
        onLocationSelect(lat, lng, addr);
      })
      .catch(() => {
        const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        setAddressLine(fallback);
        onLocationSelect(lat, lng, fallback);
      })
      .finally(() => setIsSearching(false));
  };

  // Perform Forward Geocoding
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery || searchQuery.length < 3) return;

    setIsSearching(true);
    const q = searchQuery.toLowerCase().includes('toshkent') ? searchQuery : `Toshkent, ${searchQuery}`;
    
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          setPosition([lat, lng]);
          setZoom(17);
          handleSelect(lat, lng); // update address
        }
      })
      .catch(err => console.error('Geocoding error:', err))
      .finally(() => setIsSearching(false));
  };

  const locateMe = () => {
    if (navigator.geolocation) {
      setIsSearching(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setPosition([lat, lng]);
          setZoom(16);
          handleSelect(lat, lng);
          setIsSearching(false);
        },
        (err) => {
          console.error(err);
          setIsSearching(false);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Search Bar directly above the map */}
      <div className="relative z-10 w-full flex gap-2">
        <div className="relative flex-1">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input 
            type="text" 
            placeholder="Qidirish (Masalan: Yunusobod 4-mavze)"
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-sm text-slate-700 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch(e as any);
              }
            }}
          />
        </div>
        <button 
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className="px-6 py-3 bg-indigo-600 text-white font-black hover:bg-indigo-700 rounded-xl transition-all shadow-md active:scale-95 text-sm uppercase tracking-widest disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {isSearching ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : 'Izlash'}
        </button>
      </div>

      {/* Map Container */}
      <div className="w-full h-[380px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 relative group animate-in zoom-in-95 duration-500">
        
        {/* Floating current address indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-md px-4 py-2 flex items-center gap-2 rounded-full shadow-lg border border-slate-100 max-w-[90%] pointer-events-none transition-all">
          <MdLocationOn className="text-indigo-600 shrink-0 text-lg" />
          <p className="text-xs font-bold text-slate-700 truncate">{addressLine}</p>
        </div>

        {/* Locate Me button */}
        <button
          type="button"
          onClick={locateMe}
          className="absolute right-4 bottom-8 z-[1000] w-12 h-12 bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-slate-100 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
          title="Mening joylashuvim"
        >
          <MdMyLocation className="text-2xl" />
        </button>

        <MapContainer 
          center={position} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%', backgroundColor: '#f8fafc' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; Google Maps'
            url={GOOGLE_MAPS_TILES}
          />
          <LocationMarker onSelect={handleSelect} position={position} setPosition={setPosition} />
          <MapUpdater center={position} zoom={zoom} />
        </MapContainer>
      </div>
    </div>
  );
}
