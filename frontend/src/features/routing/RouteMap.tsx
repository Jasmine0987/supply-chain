import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Use token if available, otherwise will fallback to OpenStreetMap
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

if (MAPBOX_TOKEN && MAPBOX_TOKEN !== 'your-mapbox-token') {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

interface Location {
  name: string;
  coordinates: [number, number]; // [lat, lon]
  volume?: number;
}

interface RouteMapProps {
  locations: Location[];
  route?: string[];
}

export const RouteMap: React.FC<RouteMapProps> = ({ locations, route }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      // Initialize map with better error handling
      const mapStyle = MAPBOX_TOKEN && MAPBOX_TOKEN !== 'your-mapbox-token'
        ? 'mapbox://styles/mapbox/streets-v12'
        : {
            version: 8,
            sources: {
              'osm': {
                type: 'raster',
                tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors'
              }
            },
            layers: [{
              id: 'osm',
              type: 'raster',
              source: 'osm',
              minzoom: 0,
              maxzoom: 19
            }]
          };

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle as any,
        center: locations.length > 0 
          ? [locations[0].coordinates[1], locations[0].coordinates[0]]  // [lon, lat]
          : [-74.006, 40.7128],
        zoom: 11,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    } catch (error) {
      console.error('Map initialization error:', error);
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !locations.length) return;

    const updateMap = () => {
      if (!map.current) return;
      
      // Wait for map to be ready
      if (!map.current.isStyleLoaded()) {
        console.warn('Map style not loaded yet, waiting...');
        return;
      }

      try {
        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Safe removal of existing layers/sources
        if (map.current.getLayer('route')) {
          map.current.removeLayer('route');
        }
        if (map.current.getSource('route')) {
          map.current.removeSource('route');
        }

        // Add location markers
        locations.forEach((location, index) => {
          const el = document.createElement('div');
          el.className = 'marker';
          el.style.width = '30px';
          el.style.height = '30px';
          el.style.borderRadius = '50%';
          el.style.cursor = 'pointer';
          el.style.display = 'flex';
          el.style.alignItems = 'center';
          el.style.justifyContent = 'center';
          el.style.fontWeight = 'bold';
          el.style.fontSize = '12px';
          el.style.color = 'white';

          if (index === 0) {
            el.style.backgroundColor = '#10b981';
            el.textContent = '🏭';
          } else {
            el.style.backgroundColor = '#3b82f6';
            el.textContent = String.fromCharCode(64 + index);
          }

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 8px;">
              <h3 style="font-weight: bold; margin-bottom: 4px;">${location.name}</h3>
              ${location.volume ? `<p style="font-size: 12px;">Volume: ${location.volume} units</p>` : ''}
            </div>
          `);

          const marker = new mapboxgl.Marker(el)
            .setLngLat([location.coordinates[1], location.coordinates[0]])
            .setPopup(popup)
            .addTo(map.current!);
          
          markersRef.current.push(marker);
        });

        // Draw route if available
        if (route && route.length > 1) {
          const routeCoordinates = route
            .map((name) => {
              const loc = locations.find((l) => l.name === name);
              return loc ? [loc.coordinates[1], loc.coordinates[0]] : null;
            })
            .filter(Boolean) as [number, number][];

          if (routeCoordinates.length > 1) {
            map.current!.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: routeCoordinates,
                },
              },
            });

            map.current!.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round',
              },
              paint: {
                'line-color': '#3b82f6',
                'line-width': 4,
                'line-opacity': 0.8,
              },
            });

            // Fit map to route bounds
            const bounds = new mapboxgl.LngLatBounds();
            routeCoordinates.forEach((coord) => bounds.extend(coord as [number, number]));
            map.current!.fitBounds(bounds, { padding: 50 });
          }
        } else {
          // Fit to all locations
          const bounds = new mapboxgl.LngLatBounds();
          locations.forEach((loc) =>
            bounds.extend([loc.coordinates[1], loc.coordinates[0]] as [number, number])
          );
          map.current!.fitBounds(bounds, { padding: 50 });
        }
      } catch (error) {
        console.error('Error updating map:', error);
      }
    };

    // Wait for style to load
    if (map.current.isStyleLoaded()) {
      updateMap();
    } else {
      map.current.once('load', updateMap);
    }

  }, [locations, route]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Route Map</h3>
        {(!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your-mapbox-token') && (
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
            Using OpenStreetMap. Add VITE_MAPBOX_ACCESS_TOKEN to .env for better maps.
          </p>
        )}
      </div>
      <div ref={mapContainer} className="w-full h-96" />
      <div className="p-4 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">Warehouse</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">Delivery Stops</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-1 bg-blue-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Optimized Route</span>
          </div>
        </div>
      </div>
    </div>
  );
};