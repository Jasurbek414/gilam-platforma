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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadYandexMaps = () => {
      if (!window.ymaps) {
        const script = document.createElement('script');
        script.src = 'https://api-maps.yandex.ru/2.1/?lang=uz_UZ&apikey=f3424d5d-222c-4734-9271-e5d8a0c5c567';
        script.async = true;
        script.onload = () => {
          window.ymaps.ready(initMap);
        };
        document.head.appendChild(script);
      } else {
        window.ymaps.ready(initMap);
      }
    };

    const initMap = () => {
      if (!mapRef.current || !window.ymaps) return;

      mapRef.current.innerHTML = '';
      
      const center = initialLocation ? [initialLocation.lat, initialLocation.lng] : [41.2995, 69.2401];
      
      mapInstance.current = new window.ymaps.Map(mapRef.current, {
        center: center,
        zoom: 16,
        controls: ['zoomControl', 'fullscreenControl', 'geolocationControl']
      });

      // Create draggable marker
      markerRef.current = new window.ymaps.Placemark(center, {
        hintContent: 'Manzilni belgilang'
      }, {
        preset: 'islands#redDotIconWithCaption',
        draggable: true
      });

      mapInstance.current.geoObjects.add(markerRef.current);

      // Listen for click on map
      mapInstance.current.events.add('click', (e: any) => {
        const coords = e.get('coords');
        markerRef.current.geometry.setCoordinates(coords);
        getAddress(coords);
      });

      // Listen for marker drag end
      markerRef.current.events.add('dragend', () => {
        const coords = markerRef.current.geometry.getCoordinates();
        getAddress(coords);
      });

      setLoading(false);
    };

    const getAddress = (coords: [number, number]) => {
      window.ymaps.geocode(coords).then((res: any) => {
        const firstGeoObject = res.geoObjects.get(0);
        const address = firstGeoObject.getAddressLine();
        onLocationSelect(coords[0], coords[1], address);
      });
    };

    loadYandexMaps();
  }, []);

  // Handle Search Query Geocoding (Yandex version)
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 4 || !mapInstance.current) return;

    const delayDebounceFn = setTimeout(() => {
      window.ymaps.geocode(searchQuery, { results: 1 }).then((res: any) => {
        const firstGeoObject = res.geoObjects.get(0);
        if (firstGeoObject) {
          const coords = firstGeoObject.geometry.getCoordinates();
          mapInstance.current.setCenter(coords, 17, { duration: 500 });
          markerRef.current.geometry.setCoordinates(coords);
          const address = firstGeoObject.getAddressLine();
          onLocationSelect(coords[0], coords[1], address);
        }
      });
    }, 1200);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className="w-full h-[350px] rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner relative">
      <div ref={mapRef} className="w-full h-full" />
      
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-[1000] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 z-[1000] bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-100 pointer-events-none">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Yandex Maps • Aniq manzil</p>
      </div>
    </div>
  );
}
