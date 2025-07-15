import React, { useEffect, useRef, useState } from 'react';
import { QuizCardData } from '../../types/quiz';

interface QuizMapProps {
  quizzes: QuizCardData[];
  onQuizClick: (quizId: number) => void;
}

const groupQuizzesByLocation = (quizzes: QuizCardData[]) => {
  const groups: { [key: string]: QuizCardData[] } = {};
  
  quizzes.forEach(quiz => {
    if (quiz.latitude && quiz.longitude) {
      const key = `${quiz.latitude.toFixed(4)},${quiz.longitude.toFixed(4)}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(quiz);
    }
  });
  
  return groups;
};

const QuizMap: React.FC<QuizMapProps> = ({ quizzes, onQuizClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    if (!mapRef.current || map) return;

    const initialMap = new google.maps.Map(mapRef.current, {
      center: { lat: 45.8150, lng: 15.9819 }, 
      zoom: 12,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    const initialInfoWindow = new google.maps.InfoWindow();

    setMap(initialMap);
    setInfoWindow(initialInfoWindow);
  }, [map]);

  useEffect(() => {
    if (!map || !infoWindow) return;

    markers.forEach(marker => marker.setMap(null));

    const newMarkers: google.maps.Marker[] = [];
    const locationGroups = groupQuizzesByLocation(quizzes);

    Object.entries(locationGroups).forEach(([locationKey, quizzesAtLocation]) => {
      const [lat, lng] = locationKey.split(',').map(Number);
      const quizCount = quizzesAtLocation.length;
      
      let markerColor = '#3B82F6'; 
      let markerSize = 32;
      
      if (quizCount > 1) {
        markerColor = '#EF4444'; 
        markerSize = 40;
      }
      
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: quizCount === 1 ? quizzesAtLocation[0].name : `${quizCount} kvizova`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="${markerSize}" height="${markerSize}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="${markerColor}"/>
              ${quizCount > 1 ? `<text x="12" y="10" font-family="Arial" font-size="8" fill="white" text-anchor="middle" dominant-baseline="middle">${quizCount}</text>` : ''}
            </svg>
          `),
          scaledSize: new google.maps.Size(markerSize, markerSize),
          anchor: new google.maps.Point(markerSize/2, markerSize)
        }
      });

      marker.addListener('click', () => {
        let content: string;
        
        if (quizCount === 1) {
          const quiz = quizzesAtLocation[0];
          content = `
            <div class="p-3 max-w-xs">
              <h3 class="font-bold text-lg mb-2">${quiz.name}</h3>
              <p class="text-gray-600 mb-1">
                <strong>Organizator:</strong> ${quiz.organizerName}
              </p>
              <p class="text-gray-600 mb-1">
                <strong>Kategorija:</strong> ${quiz.categoryName}
              </p>
              <p class="text-gray-600 mb-1">
                <strong>Lokacija:</strong> ${quiz.locationName}
              </p>
              <p class="text-gray-600 mb-1">
                <strong>Datum:</strong> ${new Date(quiz.dateTime).toLocaleDateString('hr-HR')}
              </p>
              <p class="text-gray-600 mb-3">
                <strong>Prijavljeni timovi:</strong> ${quiz.registeredTeamsCount}/${quiz.maxTeams}
              </p>
              <button 
                onclick="window.openQuizDetails(${quiz.id})" 
                class="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Vidi detalje
              </button>
            </div>
          `;
        } else {
          content = `
            <div class="p-3 max-w-sm">
              <h3 class="font-bold text-lg mb-3">${quizCount} kvizova na ovoj lokaciji</h3>
              <div class="space-y-2 max-h-60 overflow-y-auto">
                ${quizzesAtLocation.map(quiz => `
                  <div class="border-b border-gray-200 pb-2 last:border-b-0">
                    <h4 class="font-medium text-gray-900">${quiz.name}</h4>
                    <p class="text-sm text-gray-600">${quiz.organizerName}</p>
                    <p class="text-sm text-gray-500">${new Date(quiz.dateTime).toLocaleDateString('hr-HR')}</p>
                    <button 
                      onclick="window.openQuizDetails(${quiz.id})" 
                      class="text-blue-600 text-sm hover:underline mt-1"
                    >
                      Vidi detalje →
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }

        infoWindow.setContent(content);
        infoWindow.open(map, marker);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    if (newMarkers.length > 0) {
      if (newMarkers.length === 1) {
        map.setCenter(newMarkers[0].getPosition()!);
        map.setZoom(14);
      } else {
        const bounds = new google.maps.LatLngBounds();
        newMarkers.forEach(marker => {
          const position = marker.getPosition();
          if (position) bounds.extend(position);
        });
        map.fitBounds(bounds);
        
        google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          if (map.getZoom()! > 15) {
            map.setZoom(15);
          }
        });
      }
    }
  }, [map, quizzes, infoWindow]);

  useEffect(() => {
    (window as any).openQuizDetails = (quizId: number) => {
      onQuizClick(quizId);
    };

    return () => {
      delete (window as any).openQuizDetails;
    };
  }, [onQuizClick]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[750px] rounded-lg border border-gray-200"
      style={{ minHeight: '400px' }}
    />
  );
};

export default QuizMap;