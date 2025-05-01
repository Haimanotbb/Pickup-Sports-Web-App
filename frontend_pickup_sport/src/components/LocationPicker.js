import React, { useState, useCallback, useRef } from 'react';
import {
  GoogleMap,
  Marker,
  InfoWindow,
  Autocomplete,
  useLoadScript
} from '@react-google-maps/api';

const MAP_CONTAINER_STYLE = { height: '300px', width: '100%' };
const DEFAULT_CENTER      = { lat: 41.3163, lng: -72.9223 };

export default function LocationPicker({ location, setLocation, setLatLng }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY,
    libraries: ['places'],              // ← load the autocomplete library
  });

  const [marker, setMarker]     = useState(null);
  const [address, setAddress]   = useState(location || '');
  const autocompleteRef         = useRef(null);
  const updateMarkerAndAddress = useCallback((lat, lng) => {
    setMarker({ lat, lng });
    setLatLng({ lat, lng });

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const formatted = results[0].formatted_address;
        setAddress(formatted);
        setLocation(formatted);
      }
    });
  }, [setLocation, setLatLng]);
  const onPlaceChanged = () => {
    const auto = autocompleteRef.current;
    if (!auto) return;
    const place = auto.getPlace();
    if (place?.geometry) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const formatted = place.formatted_address;
      setMarker({ lat, lng });
      setLatLng({ lat, lng });
      setAddress(formatted);
      setLocation(formatted);
    }
  };
  const onInputKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const { lat, lng } = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          };
          const formatted = results[0].formatted_address;
          setMarker({ lat, lng });
          setLatLng({ lat, lng });
          setAddress(formatted);
          setLocation(formatted);
        }
      });
    }
  };

  if (loadError) return <p>Map failed to load</p>;
  if (!isLoaded) return <p>Loading map…</p>;

  return (
    <>
      <Autocomplete
        onLoad={ref => (autocompleteRef.current = ref)}
        onPlaceChanged={onPlaceChanged}
      >
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Start typing an address…"
          value={address}
          onChange={e => setAddress(e.target.value)}
          onKeyDown={onInputKeyDown}
        />
      </Autocomplete>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        zoom={14}
        center={marker || DEFAULT_CENTER}
        onClick={e => updateMarkerAndAddress(e.latLng.lat(), e.latLng.lng())}
      >
        {marker && (
          <>
            <Marker
              position={marker}
              draggable
              onDragEnd={e => updateMarkerAndAddress(e.latLng.lat(), e.latLng.lng())}
            />
            <InfoWindow position={marker}>
              <div style={{ maxWidth: 200 }}>{address}</div>
            </InfoWindow>
          </>
        )}
      </GoogleMap>
    </>
  );
}
