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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadYandexMaps = () => {
      const existingScript = document.getElementById('yandex-maps-script');
      
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'yandex-maps-script';
        script.src = 'https://api-maps.yandex.ru/2.1/?lang=uz_UZ&apikey=f3424d5d-222c-4734-9271-e5d8a0c5c567';
        script.async = true;
        script.onload = () => {
          if (window.ymaps) window.ymaps.ready(initMap);
        };
        document.head.appendChild(script);
      } else if (window.ymaps) {
        window.ymaps.ready(initMap);
      } else {
        existingScript.addEventListener('load', () => {
          if (window.ymaps) window.ymaps.ready(initMap);
        });
      }
    };

    const initMap = () => {
      if (!mapRef.current || !window.ymaps || mapInstance.current) return;

      mapRef.current.innerHTML = '';
      
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

      mapInstance.current.geoObjects.add(markerRef.current);

      mapInstance.current.events.add('click', (e: any) => {
        const coords = e.get('coords');
        markerRef.current.geometry.setCoordinates(coords);
        getAddress(coords);
      });

      markerRef.current.events.add('dragend', () => {
        const coords = markerRef.current.geometry.getCoordinates();
        getAddress(coords);
      });

      setLoading(false);
      setIsReady(true);
    };

    const getAddress = (coords: [number, number]) => {
      window.ymaps.geocode(coords).then((res: any) => {
        const firstGeoObject = res.geoObjects.get(0);
        const address = firstGeoObject.getAddressLine();
        onLocationSelect(coords[0], coords[1], address);
      });
    };

    loadYandexMaps();
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  // Handle Search Query Geocoding
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3 || !isReady || !window.ymaps || !mapInstance.current) return;

    const delayDebounceFn = setTimeout(() => {
      const fullQuery = searchQuery.toLowerCase().includes('toshkent') || searchQuery.toLowerCase().includes('tashkent') 
        ? searchQuery 
        : `Toshkent, ${searchQuery}`;

      window.ymaps.geocode(fullQuery, { results: 1 }).then((res: any) => {
        const firstGeoObject = res.geoObjects.get(0);
        if (firstGeoObject && mapInstance.current && markerRef.current) {
          const coords = firstGeoObject.geometry.getCoordinates();
          
          mapInstance.current.panTo(coords, {
            flying: true,
            duration: 800
          }).then(() => {
             mapInstance.current.setZoom(17, { duration: 400 });
          });
          
          markerRef.current.geometry.setCoordinates(coords);
        }
      });
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, isReady]);

  return (
    <div className="w-full h-[350px] rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner relative">
      <div ref={mapRef} className="w-full h-full" />
      
      {(loading || !isReady) && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-[1000] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 z-[1000] bg-white px-3 py-2 rounded-xl shadow-lg border border-slate-100 pointer-events-none">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Yandex Maps • Aqlli qidiruv</p>
      </div>
    </div>
  );
}
