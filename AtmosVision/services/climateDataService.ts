
import { GeoJSON } from 'geojson';

export interface MapLayer {
  id: string;
  label: string;
  type?: 'geojson' | 'tile'; // Can be a shape or a whole map layer
  alertType?: ClimateAlert['icon']; // Links layer to an alert type
  color: string; // Semi-transparent color for map overlays
  uiColor: string; // Solid color for UI elements like toggles and dots
  description: string; // Description for UI tooltips
  geojson?: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>;
  tileUrl?: string; // URL for tile layers
}

export interface ClimateAlert {
  id: string;
  level: 'critical' | 'high' | 'moderate';
  icon: 'wildfire' | 'thunderstorm' | 'air' | 'flood' | 'earthquake' | 'storm';
  title: string;
  location: string;
  bbox: string; // Bounding box for OpenStreetMap iframe
  lat: number; // Latitude for marker
  lon: number; // Longitude for marker
  zoom: number; // Zoom level for map view
}

export const layersData: MapLayer[] = [
  { 
    id: 'wildfire', 
    label: 'Wildfire Risk', 
    type: 'geojson',
    alertType: 'wildfire',
    color: 'rgba(239, 68, 68, 0.4)', // red-500 for map
    uiColor: '#B91C1C', // red-700
    description: 'Highlights areas with a high probability of wildfire ignition and spread based on vegetation, weather, and topography.',
    geojson: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-122.6, 38.7], [-122.5, 38.9], [-122.7, 39.1], [-122.9, 38.8], [-122.6, 38.7]
          ]
        ]
      }
    }
  },
  { 
    id: 'flood', 
    label: 'Flood Plains (100-yr)', 
    type: 'geojson',
    alertType: 'flood',
    color: 'rgba(59, 130, 246, 0.3)', // blue-500 for map
    uiColor: '#3B82F6', // blue-500
    description: 'Identifies regions susceptible to flooding during a 100-year storm event, indicating significant long-term flood risk.',
    geojson: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [152.5, -27.8], [153.3, -27.8], [153.3, -27.2], [152.5, -27.2], [152.5, -27.8]
          ]
        ]
      }
    }
  },
  { 
    id: 'airquality', 
    label: 'Air Quality Index', 
    type: 'geojson',
    alertType: 'air',
    color: 'rgba(168, 85, 247, 0.3)', // purple-500
    uiColor: '#9333EA', // purple-600
    description: 'Displays real-time air pollution levels, tracking pollutants like PM2.5 and Ozone that affect public health.',
    geojson: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-82, 42], [-74, 42], [-74, 39], [-82, 39], [-82, 42]
          ]
        ]
      }
    }
  },
  {
    id: 'storms',
    label: 'Tropical Storms (Live)',
    alertType: 'storm',
    color: 'rgba(139, 92, 246, 0.4)', // Not used for rendering, just for consistency
    uiColor: '#8B5CF6', // violet-500
    description: 'Tracks active tropical cyclones, hurricanes, and typhoons in near real-time from NASA EONET.',
  },
  {
    id: 'earthquakes',
    label: 'Earthquakes (Live)',
    alertType: 'earthquake',
    color: 'rgba(239, 68, 68, 0.4)', // Not used for rendering, just for consistency
    uiColor: '#F87171', // red-400
    description: 'Displays real-time significant earthquake events (M2.5+) from the last 24 hours, provided by the USGS.',
  },
  { 
    id: 'drought', 
    label: 'Drought Severity', 
    type: 'geojson',
    // No specific alert type for general drought in this dataset
    color: 'rgba(234, 179, 8, 0.2)', // yellow-500
    uiColor: '#CA8A04', // yellow-600
    description: 'Measures the intensity and extent of drought conditions, impacting agriculture, water supply, and ecosystems.',
    geojson: {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-120, 37], [-112, 37], [-112, 32], [-120, 32], [-120, 37]
          ]
        ]
      }
    }
  },
  { 
    id: 'satellite', 
    label: 'Satellite - Night', 
    type: 'tile',
    color: 'rgba(0, 0, 0, 0.2)',
    uiColor: '#A1A1AA', // zinc-400
    description: 'Overlays nighttime satellite imagery from NASA, useful for tracking power outages, urban development, and wildfires at night.',
    tileUrl: 'https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_Black_Marble/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png'
  },
];

export const alertsData: ClimateAlert[] = [
    { id: 'alert1', level: 'critical', icon: 'wildfire', title: 'Wildfire Evacuation Order', location: 'Coastal Range, CA', bbox: '-122.9,38.5,-122.4,39.0', lat: 38.75, lon: -122.65, zoom: 9 },
    { id: 'alert2', level: 'high', icon: 'thunderstorm', title: 'Severe Thunderstorm Watch', location: 'Midwest Region, USA', bbox: '-96.0,39.0,-90.0,42.0', lat: 40.5, lon: -93.0, zoom: 6 },
    { id: 'alert3', level: 'moderate', icon: 'air', title: 'Air Quality Warning', location: 'Metro Delhi, India', bbox: '77.1,28.5,77.3,28.7', lat: 28.6, lon: 77.2, zoom: 10 },
    { id: 'alert4', level: 'high', icon: 'flood', title: 'Flash Flood Warning', location: 'Queensland, AU', bbox: '152.0,-28.0,153.5,-27.0', lat: -27.5, lon: 152.75, zoom: 9 },
];
