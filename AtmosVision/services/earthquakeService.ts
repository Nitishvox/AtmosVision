import { ClimateAlert } from './climateDataService';

// USGS URL for significant earthquakes (M2.5+) in the last 24 hours
const USGS_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson';

interface UsgsFeature {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    title: string;
  };
  geometry: {
    coordinates: [number, number, number]; // lon, lat, depth
  };
}

const mapUsgsFeatureToAlert = (feature: UsgsFeature): ClimateAlert => {
  const { mag, place } = feature.properties;
  const [lon, lat] = feature.geometry.coordinates;

  let level: ClimateAlert['level'] = 'moderate';
  if (mag >= 4.5) level = 'high';
  if (mag >= 6.0) level = 'critical';

  return {
    id: `eq-${feature.id}`,
    level,
    icon: 'earthquake',
    title: `M ${mag.toFixed(1)} - ${place}`,
    location: new Date(feature.properties.time).toLocaleString(),
    // Bbox is not available from this feed, we can approximate it or ignore for this alert type
    bbox: `${lon-1},${lat-1},${lon+1},${lat+1}`,
    lat,
    lon,
    zoom: Math.max(5, Math.floor(mag) + 1),
  };
};

export const fetchEarthquakes = async (): Promise<ClimateAlert[]> => {
  try {
    const response = await fetch(USGS_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch earthquake data: ${response.statusText}`);
    }
    const data = await response.json();
    const features: UsgsFeature[] = data.features || [];
    return features.map(mapUsgsFeatureToAlert);
  } catch (error) {
    console.error("Earthquake Service Error:", error);
    return []; // Return empty array on error to prevent app crash
  }
};
