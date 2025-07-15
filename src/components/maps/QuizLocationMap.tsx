import React, { useEffect, useRef, useState } from 'react';

interface QuizLocationMapProps {
  latitude: number;
  longitude: number;
  locationName: string;
  address: string;
}

const QuizLocationMap: React.FC<QuizLocationMapProps> = ({ 
  latitude, 
  longitude, 
  locationName, 
  address 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const position = { lat: latitude, lng: longitude };

    const initialMap = new google.maps.Map(mapRef.current, {
      center: position,
      zoom: 15,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    const marker = new google.maps.Marker({
      position: position,
      map: initialMap,
      title: locationName,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="#EF4444"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 40)
      }
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="p-2">
          <h3 class="font-bold text-lg mb-1">${locationName}</h3>
          <p class="text-gray-600">${address}</p>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(initialMap, marker);
    });

    setMap(initialMap);
  }, [latitude, longitude, locationName, address]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-96 rounded-lg border border-gray-200"
    />
  );
};

export default QuizLocationMap;