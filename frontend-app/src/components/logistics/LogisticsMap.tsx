'use client';

import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    ymaps: any;
  }
}

interface LogisticsMapProps {
  drivers: any[];
  orderPoints: any[];
}

export default function LogisticsMap({ drivers, orderPoints }: LogisticsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.ymaps || mapInstance.current) return;

      mapInstance.current = new window.ymaps.Map(mapRef.current, {
        center: [41.311081, 69.240562],
        zoom: 12,
        controls: ['zoomControl', 'fullscreenControl', 'geolocationControl']
      });

      // Drivers
      drivers.forEach(driver => {
        const placemark = new window.ymaps.Placemark(driver.pos, {
          balloonContent: `<b>${driver.name}</b><br/>${driver.car}<br/>${driver.status}`
        }, {
          preset: 'islands#emeraldAutoCircleIcon'
        });
        mapInstance.current.geoObjects.add(placemark);
      });

      // Orders
      orderPoints.forEach(point => {
        const placemark = new window.ymaps.Placemark(point.pos, {
          balloonContent: `<b>${point.name}</b><br/>${point.type === 'pickup' ? 'Olib ketish' : 'Yetkazib berish'}`
        }, {
          preset: point.type === 'pickup' ? 'islands#blueDotIcon' : 'islands#redDotIcon'
        });
        mapInstance.current.geoObjects.add(placemark);
      });

      setIsReady(true);
    };

    const loadScript = () => {
      const id = 'yandex-maps-script-v2';
      if (document.getElementById(id)) {
        if (window.ymaps) window.ymaps.ready(initMap);
        return;
      }

      const script = document.createElement('script');
      script.id = id;
      script.src = 'https://api-maps.yandex.ru/2.1/?lang=uz_UZ';
      script.async = true;
      script.onload = () => {
        if (window.ymaps) window.ymaps.ready(initMap);
      };
      document.head.appendChild(script);
    };

    loadScript();
  }, [drivers.length, orderPoints.length]);

  return (
    <div className="w-full h-full min-h-[500px] border-4 border-slate-100 relative bg-slate-50">
      <div ref={mapRef} className="w-full h-full" />
      {!isReady && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-[100]">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
