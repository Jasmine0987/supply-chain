import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

mapboxgl.accessToken = MAPBOX_TOKEN;

export const createMap = (container: string | HTMLElement, options?: Partial<mapboxgl.MapboxOptions>) => {
  return new mapboxgl.Map({
    container,
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [-95.7129, 37.0902], // Center of USA
    zoom: 3,
    ...options,
  });
};

export const addMarker = (
  map: mapboxgl.Map,
  coordinates: [number, number],
  options?: {
    color?: string;
    popup?: string;
  }
) => {
  const marker = new mapboxgl.Marker({ color: options?.color || '#3B82F6' })
    .setLngLat(coordinates);

  if (options?.popup) {
    marker.setPopup(new mapboxgl.Popup().setHTML(options.popup));
  }

  marker.addTo(map);
  return marker;
};

export const addRoute = (
  map: mapboxgl.Map,
  coordinates: [number, number][],
  color: string = '#3B82F6'
) => {
  const routeId = `route-${Date.now()}`;
  
  map.addSource(routeId, {
    type: 'geojson',
    data: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates,
      },
    },
  });

  map.addLayer({
    id: routeId,
    type: 'line',
    source: routeId,
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': color,
      'line-width': 3,
    },
  });

  return routeId;
};

export default mapboxgl;