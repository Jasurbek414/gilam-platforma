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
  const [loading, setLoading] = useState(true);

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

        // Click on map
        mapInstance.current.events.add('click', (e: any) => {
          const coords = e.get('coords');
          markerRef.current.geometry.setCoordinates(coords);
          getAddress(coords);
        });

        // Marker drag
        markerRef.current.events.add('dragend', () => {
          const coords = markerRef.current.geometry.getCoordinates();
          getAddress(coords);
        });

        mapInstance.current.geoObjects.add(markerRef.current);
        setIsReady(true);
        setLoading(false);
      } catch (err) {
        console.error('Yandex Map Init Error:', err);
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
      const id = 'yandex-maps-script-v2';
      if (document.getElementById(id)) {
        if (window.ymaps) window.ymaps.ready(initMap);
        return;
      }

      const script = document.createElement('script');
      script.id = id;
      // Using 2.1 version without explicit key to trigger free usage limits
      script.src = 'https://api-maps.yandex.ru/2.1/?lang=uz_UZ';
      script.async = true;
      script.onload = () => {
        if (window.ymaps) window.ymaps.ready(initMap);
      };
      document.head.appendChild(script);
    };

    loadScript();
  }, []);

  // Search Logic
  useEffect(() => {
    if (!isReady || !searchQuery || searchQuery.length < 3 || !window.ymaps || !mapInstance.current) return;

    const timer = setTimeout(() => {
      const q = searchQuery.toLowerCase().includes('toshkent') ? searchQuery : `Toshkent, ${searchQuery}`;
      
      window.ymaps.geocode(q, { results: 1 }).then((res: any) => {
        const obj = res.geoObjects.get(0);
        if (obj && mapInstance.current && markerRef.current) {
          const coords = obj.geometry.getCoordinates();
          mapInstance.current.setCenter(coords, 17, { duration: 800 });
          markerRef.current.geometry.setCoordinates(coords);
        }
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery, isReady]);

  return (
    <div className="w-full h-[400px] min-h-[400px] rounded-2xl overflow-hidden border-2 border-slate-200 shadow-xl relative bg-slate-50">
      <div ref={mapRef} className="w-full h-full" />
      
      {loading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-[100] flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest">Yandex Maps yuklanmoqda...</p>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 z-[50] bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-100 pointer-events-none">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center italic">Yandex Xaritasi</p>
      </div>
    </div>
  );
}
