import React, { useEffect, useRef, useState } from 'react';

interface LocationPickerProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  initialLatitude?: number;
  initialLongitude?: number;
  initialAddress?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationSelect, 
  initialLatitude, 
  initialLongitude, 
  initialAddress 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [searchTerm, setSearchTerm] = useState(initialAddress || '');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);

  useEffect(() => {
    console.log('LocationPicker useEffect:', { 
      mapRef: !!mapRef.current, 
      google: !!window.google,
      maps: !!window.google?.maps 
    });
    
    if (!mapRef.current) return;

    if (!window.google) {
      const checkGoogleMaps = () => {
        if (window.google) {
          initializeMap();
        } else {
          setTimeout(checkGoogleMaps, 100);
        }
      };
      checkGoogleMaps();
      return;
    }

    initializeMap();
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const initialPosition = {
      lat: initialLatitude || 45.8150,
      lng: initialLongitude || 15.9819
    };

    const initialMap = new google.maps.Map(mapRef.current, {
      center: initialPosition,
      zoom: initialLatitude ? 15 : 12,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    let initialMarker: google.maps.Marker | null = null;
    if (initialLatitude && initialLongitude) {
      initialMarker = createMarker(initialPosition, initialMap);
    }

    setMap(initialMap);
    setMarker(initialMarker);
  };

  const createMarker = (position: { lat: number; lng: number }, mapInstance: google.maps.Map) => {
    const newMarker = new google.maps.Marker({
      position: position,
      map: mapInstance,
      draggable: false,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" fill="#10B981"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 32)
      }
    });

    return newMarker;
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    onLocationSelect({
      latitude: lat,
      longitude: lng,
      address: address
    });
  };

  const searchPlaces = async (query: string) => {
    if (!query || query.length < 2) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    try {
      const { Place } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;
      
      const request = {
        textQuery: query,
        fields: ['displayName', 'location', 'formattedAddress', 'types'],
        locationBias: { 
          center: { lat: 45.8150, lng: 15.9819 }, 
          radius: 50000 
        },
        region: 'hr',
        maxResultCount: 5
      };

      const { places } = await Place.searchByText(request);
      
      if (places && places.length > 0) {
        setPredictions(places);
        setShowPredictions(true);
      } else {
        setPredictions([]);
        setShowPredictions(false);
      }
    } catch (error) {
      console.error('Places API error:', error);
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    setTimeout(() => {
      searchPlaces(value);
    }, 300);
  };

  const selectPlace = (place: any) => {
    if (!map) return;

    const location = place.location;
    const lat = location.lat();
    const lng = location.lng();
    const address = place.formattedAddress || place.displayName || 'Nepoznata lokacija';
    
    setSearchTerm(address);
    setShowPredictions(false);

    if (marker) {
      marker.setMap(null);
    }

    const newMarker = createMarker({ lat, lng }, map);
    setMarker(newMarker); 

    map.setCenter({ lat, lng });
    map.setZoom(15);

    handleLocationSelect(lat, lng, address);
  };

  return (
    <div className="space-y-4">
      {!window.google && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Google Maps se učitava...
        </div>
      )}
      
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pretraži lokaciju
        </label>
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setShowPredictions(predictions.length > 0)}
          placeholder="Unesite naziv mjesta ili adresu..."
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-quiz-primary focus:outline-none"
          disabled={!window.google}
        />
        
        {showPredictions && predictions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {predictions.map((place, index) => (
              <div
                key={place.id || index}
                onClick={() => selectPlace(place)}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <p className="text-sm font-medium text-gray-900">
                  {place.displayName || 'Nepoznato mjesto'}
                </p>
                <p className="text-xs text-gray-500">
                  {place.formattedAddress || ''}
                </p>
                <p className="text-xs text-gray-400">
                  {place.types?.slice(0, 2).join(', ') || ''}
                </p>
              </div>
            ))}
          </div>
        )}
        
        <p className="text-sm text-gray-500 mt-1">
          Pretraži lokaciju pomoću search polja
        </p>
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg border border-gray-200"
      />
    </div>
  );
};

export default LocationPicker;