import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin, Loader2, CheckCircle } from 'lucide-react';

// Create custom pin icon
const pinIcon = new L.DivIcon({
  className: 'custom-pin',
  html: `<div style="background-color: #ef4444; width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white;">
          <div style="background: white; width: 10px; height: 10px; border-radius: 50%;"></div>
         </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28]
});

// Component to handle map clicks
function LocationMarker({ position, setPosition, onLocationChange }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationChange(lat, lng);
    },
  });

  return position === null ? null : (
    <Marker 
      position={position} 
      icon={pinIcon}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition([pos.lat, pos.lng]);
          onLocationChange(pos.lat, pos.lng);
        }
      }}
    />
  );
}

export const LocationPicker = ({ 
  latitude, 
  longitude, 
  address, 
  onLocationSelect 
}) => {
  const [position, setPosition] = useState([latitude || 12.9716, longitude || 77.5946]);
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsMessage, setGpsMessage] = useState('');

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handleLocationChange = (lat, lng) => {
    onLocationSelect({
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lng.toFixed(6))
    });
  };

  const detectGps = () => {
    if (!navigator.geolocation) {
      setGpsMessage('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingGps(true);
    setGpsMessage('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition([lat, lng]);
        handleLocationChange(lat, lng);
        setDetectingGps(false);
        setGpsMessage('📍 GPS Location accurately detected!');
      },
      (err) => {
        console.warn('GPS detection failed:', err.message);
        // Fallback to sample smart city coordinates
        const sampleLat = 12.9716 + (Math.random() - 0.5) * 0.02;
        const sampleLng = 77.5946 + (Math.random() - 0.5) * 0.02;
        setPosition([sampleLat, sampleLng]);
        handleLocationChange(sampleLat, sampleLng);
        setDetectingGps(false);
        setGpsMessage('📍 Using Smart City Civic Center GPS coordinates (Simulated)');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Issue Location on Map
          </label>
          <p className="text-xs text-slate-500">
            Click on map or drag red marker to pinpoint exact location
          </p>
        </div>

        <button
          type="button"
          onClick={detectGps}
          disabled={detectingGps}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-smart-50 hover:bg-smart-100 text-smart-700 border border-smart-200 text-xs font-semibold transition shadow-sm"
        >
          {detectingGps ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-smart-600" />
          ) : (
            <Navigation className="w-3.5 h-3.5 text-smart-600" />
          )}
          <span>Detect GPS Location</span>
        </button>
      </div>

      {gpsMessage && (
        <div className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>{gpsMessage}</span>
        </div>
      )}

      {/* Map Container */}
      <div className="h-64 sm:h-72 w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner relative">
        <MapContainer
          center={position}
          zoom={14}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            position={position} 
            setPosition={setPosition} 
            onLocationChange={handleLocationChange} 
          />
        </MapContainer>

        {/* Floating coordinates indicator */}
        <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-700 border border-slate-200 shadow">
          📍 Lat: {position[0].toFixed(5)}, Lng: {position[1].toFixed(5)}
        </div>
      </div>
    </div>
  );
};
