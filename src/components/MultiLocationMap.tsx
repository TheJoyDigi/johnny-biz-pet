import React from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const libraries: ("places")[] = ["places"];

// Define the type for a single location
interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

// Define the props for the component
interface MultiLocationMapProps {
  locations: Location[];
}

const MultiLocationMap: React.FC<MultiLocationMapProps> = ({ locations }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries
  });

  const mapRef = React.useRef<google.maps.Map | null>(null);

  const onMapLoad = React.useCallback((map: google.maps.Map) => {
    const bounds = new google.maps.LatLngBounds();
    locations.forEach(({ lat, lng }) => {
      bounds.extend(new google.maps.LatLng(lat, lng));
    });
    map.fitBounds(bounds);
    mapRef.current = map;
  }, [locations]);

  const onUnmount = React.useCallback(() => {
    mapRef.current = null;
  }, []);

  return isLoaded ? (
      <GoogleMap
        mapContainerStyle={containerStyle}
        onLoad={onMapLoad}
        onUnmount={onUnmount}
      >
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={{ lat: location.lat, lng: location.lng }}
            title={location.name}
          />
        ))}
      </GoogleMap>
  ) : <></>;
}

export default React.memo(MultiLocationMap);
