import React, { useEffect, useRef } from 'react';
import { createMap, addMarker, addRoute } from '../../services/mapbox';
import mapboxgl from 'mapbox-gl';

interface TrackingMapProps {
  currentLocation?: { lat: number; lng: number };
  origin?: { lat: number; lng: number; label?: string };
  destination?: { lat: number; lng: number; label?: string };
  height?: string;
}

const TrackingMap: React.FC<TrackingMapProps> = ({
  currentLocation,
  origin,
  destination,
  height = '400px',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = createMap(mapContainer.current);

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    const bounds = new mapboxgl.LngLatBounds();

    // Add origin marker
    if (origin) {
      const marker = addMarker(
        map.current,
        [origin.lng, origin.lat],
        {
          color: '#10B981',
          popup: `<strong>Origin</strong><br/>${origin.label || 'Starting point'}`,
        }
      );
      markers.current.push(marker);
      bounds.extend([origin.lng, origin.lat]);
    }

    // Add destination marker
    if (destination) {
      const marker = addMarker(
        map.current,
        [destination.lng, destination.lat],
        {
          color: '#EF4444',
          popup: `<strong>Destination</strong><br/>${destination.label || 'End point'}`,
        }
      );
      markers.current.push(marker);
      bounds.extend([destination.lng, destination.lat]);
    }

    // Add current location marker
    if (currentLocation) {
      const marker = addMarker(
        map.current,
        [currentLocation.lng, currentLocation.lat],
        {
          color: '#3B82F6',
          popup: '<strong>Current Location</strong>',
        }
      );
      markers.current.push(marker);
      bounds.extend([currentLocation.lng, currentLocation.lat]);
    }

    // Draw route line if we have origin and destination
    if (origin && destination) {
      const coordinates: [number, number][] = [
        [origin.lng, origin.lat],
      ];

      if (currentLocation) {
        coordinates.push([currentLocation.lng, currentLocation.lat]);
      }

      coordinates.push([destination.lng, destination.lat]);

      map.current.on('load', () => {
        if (map.current) {
          addRoute(map.current, coordinates);
        }
      });
    }

    // Fit map to bounds
    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 10 });
    }
  }, [currentLocation, origin, destination]);

  return <div ref={mapContainer} style={{ height, width: '100%' }} className="rounded-lg" />;
};

export default TrackingMap;