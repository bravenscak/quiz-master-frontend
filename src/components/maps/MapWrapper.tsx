import React from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

interface MapWrapperProps {
  children: React.ReactElement;
}

const MapWrapper: React.FC<MapWrapperProps> = ({ children }) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Greška:</strong> Google Maps API ključ nije postavljen.
      </div>
    );
  }

  const render = (status: Status): React.ReactElement => {
    switch (status) {
      case Status.LOADING:
        return (
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quiz-primary mx-auto mb-2"></div>
              <p className="text-gray-600">Učitavanje karte...</p>
            </div>
          </div>
        );
      case Status.FAILURE:
        return (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Greška:</strong> Neuspješno učitavanje Google Maps-a.
          </div>
        );
      case Status.SUCCESS:
        return children;
      default:
        return (
          <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Nepoznato stanje karte</p>
          </div>
        );
    }
  };

  return (
    <Wrapper 
      apiKey={apiKey} 
      render={render}
      libraries={['places']}
    >
      {children}
    </Wrapper>
  );
};

export default MapWrapper;