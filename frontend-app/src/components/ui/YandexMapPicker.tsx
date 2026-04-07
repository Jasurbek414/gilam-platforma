'use client';

import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    ymaps: any;
  }
}

interface YandexMapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLocation?: { lat: number, lng: number };
  searchQuery?: string;
}

export default function YandexMapPicker({ onLocationSelect, initialLocation, searchQuery }: YandexMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.ymaps || mapInstance.current) return;

      try {
        const center = initialLocation ? [initialLocation.lat, initialLocation.lng] : [41.2995, 69.2401];
        
        mapInstance.current = new window.ymaps.Map(mapRef.current, {
          center: center,
          zoom: 16,
          controls: ['zoomControl', 'fullscreenControl', 'geolocationControl']
        });

        markerRef.current = new window.ymaps.Placemark(center, {
          hintContent: 'Manzilni belgilang'
        }, {
          preset: 'islands#redDotIconWithCaption',
          draggable: true
        });

        // Event: Click on map
        mapInstance.current.events.add('click', (e: any) => {
          const coords = e.get('coords');
          markerRef.current.geometry.setCoordinates(coords);
          getAddress(coords);
        });

        // Event: Marker drag
        markerRef.current.events.add('dragend', () => {
          const coords = markerRef.current.geometry.getCoordinates();
          getAddress(coords);
        });

        mapInstance.current.geoObjects.add(markerRef.current);
        setIsReady(true);
      } catch (err) {
        console.error('Yandex Map Init Error:', err);
        setError('Xaritani yuklashda xatolik');
      }
    };

    const getAddress = (coords: [number, number]) => {
      if (!window.ymaps) return;
      window.ymaps.geocode(coords).then((res: any) => {
        const firstGeoObject = res.geoObjects.get(0);
        const address = firstGeoObject ? firstGeoObject.getAddressLine() : `${coords[0]}, ${coords[1]}`;
        onLocationSelect(coords[0], coords[1], address);
      });
    };

    const loadScript = () => {
      if (window.ymaps) {
        window.ymaps.ready(initMap);
        return;
      }

      const id = 'yandex-maps-api-script';
      if (document.getElementById(id)) return;

      const script = document.createElement('script');
      script.id = id;
      script.src = 'https://api-maps.yandex.ru/2.1/?lang=uz_UZ&apikey=f3424d5d-222c-4734-9271-e5d8a0c5c567';
      script.async = true;
      script.onload = () => {
        if (window.ymaps) window.ymaps.ready(initMap);
      };
      script.onerror = () => setError('Xarita skripti yuklanmadi');
      document.head.appendChild(script);
    };

    loadScript();

    return () => {
      // We don't destroy the map to keep the ref clean during HMR
    };
  }, [initialLocation, onLocationSelect]);

  // Unified Search Logic
  useEffect(() => {
    if (!isReady || !searchQuery || searchQuery.length < 3 || !window.ymaps || !mapInstance.current) return;

    const timer = setTimeout(() => {
      const q = searchQuery.toLowerCase().includes('toshkent') ? searchQuery : `Toshkent, ${searchQuery}`;
      
      window.ymaps.geocode(q, { results: 1 }).then((res: any) => {
        const obj = res.geoObjects.get(0);
        if (obj && mapInstance.current && markerRef.current) {
          const coords = obj.geometry.getCoordinates();
          
          // Use basic setCenter for maximum compatibility
          mapInstance.current.setCenter(coords, 17, {
            checkZoomRange: true,
            duration: 800
          });
          
          markerRef.current.geometry.setCoordinates(coords);
        }
      }).catch((e: any) => console.error('Geocode error:', e));
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery, isReady]);

  return (
    <div className="w-full h-[350px] rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner relative bg-slate-50">
      <div ref={mapRef} className="w-full h-full" />
      
      {!isReady && !error && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-[100] flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">Xarita tayyorlanmoqda...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-rose-50 z-[100] flex flex-col items-center justify-center p-6 text-center">
          <p className="text-rose-600 font-bold text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-500/20"
          >
            SAHIFANI YANGILASH
          </button>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 z-[50] bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-100 pointer-events-none">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Yandex Maps API 2.1</p>
      </div>
    </div>
  );
}
