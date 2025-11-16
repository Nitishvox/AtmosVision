import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, Tooltip, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MenuIcon, SparklesIcon } from './icons';
import GeoJsonLayer from './GeoJsonLayer';

import { layersData, ClimateAlert, MapLayer } from '../services/climateDataService';

// Fix for default icon issue when using bundlers like Vite/Webpack with Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// This component controls the map view programmatically and fixes rendering issues.
const MapController = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      map.flyTo(center, zoom, {
        duration: 1.5,
        easeLinearity: 0.25,
      });
    }
  }, [center, zoom, map]);

  // This effect addresses a common issue with Leaflet in dynamic layouts (like flexbox).
  // The map can sometimes initialize before its container has been properly sized,
  // leading to a partially rendered map (the "grey area" problem).
  // By calling invalidateSize() after a short delay, we force Leaflet to
  // re-check the container's dimensions and render the map correctly.
  useEffect(() => {
      if(map) {
          const timer = setTimeout(() => {
              map.invalidateSize();
          }, 200);
          return () => clearTimeout(timer);
      }
  }, [map]);

  return null;
};


// This component handles clicks on the map to get location info
const MapClickHandler = ({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) => {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng);
        },
    });
    return null;
};


// Main Map Component using React-Leaflet
interface MapProps {
  alerts: ClimateAlert[];
  activeLayers: Record<string, boolean>;
  mapView: { center: [number, number]; zoom: number };
  selectedAlertId: string | null;
  theme: 'light' | 'dark';
  onMarkerClick: (alert: ClimateAlert) => void;
  onMapClick: (latlng: L.LatLng) => void;
  onOpenLeftSidebar: () => void;
  onOpenRightSidebar: () => void;
}

const Map: React.FC<MapProps> = ({ alerts, activeLayers, mapView, selectedAlertId, theme, onMarkerClick, onMapClick, onOpenLeftSidebar, onOpenRightSidebar }) => {
  const activeTileLayers = layersData.filter(l => l.type === 'tile' && activeLayers[l.id]);

  return (
    <div className="h-full w-full bg-gray-200 dark:bg-[#161B22] rounded-lg shadow-lg overflow-hidden relative border border-gray-300 dark:border-[#30363D]">
      {/* Mobile Sidebar Toggles */}
       <div className="lg:hidden absolute top-4 left-4 z-[1001] flex flex-col gap-3">
         <button 
            onClick={onOpenLeftSidebar}
            className="p-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-md rounded-full shadow-lg text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-[#30363D] transition-colors"
            aria-label="Open data and alerts panel"
        >
            <MenuIcon className="w-5 h-5" />
        </button>
      </div>
       <div className="lg:hidden absolute top-4 right-4 z-[1001] flex flex-col gap-3">
         <button 
            onClick={onOpenRightSidebar}
            className="p-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-md rounded-full shadow-lg text-cyan-500 hover:bg-white dark:hover:bg-[#30363D] transition-colors"
            aria-label="Open AI analyst panel"
        >
            <SparklesIcon className="w-5 h-5" />
        </button>
      </div>

      <MapContainer
        id="map"
        center={mapView.center}
        zoom={mapView.zoom}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
      >
        {theme === 'dark' ? (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
        ) : (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        )}


        {/* Render active tile layers */}
        {activeTileLayers.map(layer => layer.tileUrl && (
          <TileLayer
            key={layer.id}
            url={layer.tileUrl}
            attribution='&copy; NASA'
            maxNativeZoom={8} // Specific to NASA Black Marble service
          />
        ))}


        <MapController center={mapView.center} zoom={mapView.zoom} />
        <MapClickHandler onMapClick={onMapClick} />

        {/* Render GeoJSON data layers using the dedicated component */}
        {layersData
          .filter(layer => layer.type === 'geojson' && activeLayers[layer.id])
          .map(layer => (
            <GeoJsonLayer key={layer.id} layer={layer} theme={theme} />
          ))
        }

        {/* Render alert markers */}
        {alerts.map(alert => {
          const isSelected = alert.id === selectedAlertId;
          const isEarthquake = alert.icon === 'earthquake';
          const isStorm = alert.icon === 'storm';

          const levelClasses: Record<ClimateAlert['level'], string> = {
            critical: 'marker-critical',
            high: 'marker-high',
            moderate: 'marker-moderate',
          };

          let iconClassName: string;
          let markerHtml: string;
          
          if (isStorm) {
              iconClassName = `storm-marker ${levelClasses[alert.level]} ${isSelected ? 'selected' : ''}`;
              const stormSvgIcon = `<svg class="storm-icon" fill="none" viewBox="0 0 24 24"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
              markerHtml = `<div class="storm-core">${stormSvgIcon}</div>`;
          } else if (isEarthquake) {
              iconClassName = `earthquake-marker ${isSelected ? 'selected' : ''}`;
              markerHtml = `<div class="earthquake-ripple"></div><div class="earthquake-core"></div>`;
          } else {
              iconClassName = `alert-marker ${levelClasses[alert.level]} ${isSelected ? 'selected' : ''}`;
              markerHtml = `<div class="marker-beacon"></div><div class="marker-core"></div>`;
          }

          return (
            <Marker
              key={alert.id}
              position={[alert.lat, alert.lon]}
              icon={L.divIcon({
                className: iconClassName,
                html: markerHtml,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              })}
              zIndexOffset={isEarthquake ? 2000 : (isSelected ? 1000 : 0)}
              eventHandlers={{
                click: () => onMarkerClick(alert),
              }}
            >
              <Tooltip>{alert.title}</Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 m-4 p-2 bg-white/60 dark:bg-[#0D1117]/60 backdrop-blur-md rounded-lg shadow-lg pointer-events-none z-[1000]">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-200 tracking-wider">Global Risk Monitor</h2>
      </div>
       <div className="absolute bottom-0 right-0 p-1 text-xs text-gray-600 dark:text-gray-500 bg-white/50 dark:bg-[#0D1117]/50 rounded-tl-lg z-[1000]">
        {theme === 'dark' ? '&copy; OpenStreetMap & CARTO' : '&copy; OpenStreetMap'}
      </div>
    </div>
  );
};

export default Map;