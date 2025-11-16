
import { ClimateAlert } from './climateDataService';

// NASA EONET API for open (active) severe storm events
const EONET_URL = 'https://eonet.gsfc.nasa.gov/api/v3/events?category=severeStorms&status=open';

interface EonetEvent {
  id: string;
  title: string;
  geometry: {
    date: string;
    type: 'Point';
    coordinates: [number, number]; // lon, lat
  }[];
}

const mapEonetEventToAlert = (event: EonetEvent): ClimateAlert | null => {
  // Guard against events with no location data.
  if (!event.geometry || event.geometry.length === 0) {
    return null;
  }

  // A storm's geometry is a track of points. We need to find the most recent one.
  // The EONET API doesn't guarantee the order, so we sort by date descending.
  const latestPoint = [...event.geometry].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const [lon, lat] = latestPoint.coordinates;
  const { title } = event;

  let level: ClimateAlert['level'] = 'high';
  const lowerCaseTitle = title.toLowerCase();

  // Determine severity based on common storm category keywords in the title
  if (lowerCaseTitle.includes('hurricane') || lowerCaseTitle.includes('typhoon') || /(cat|category)\s+[3-5]/.test(lowerCaseTitle)) {
    level = 'critical';
  }

  return {
    id: `storm-${event.id}`,
    level,
    icon: 'storm',
    title: title,
    location: new Date(latestPoint.date).toLocaleString(),
    bbox: `${lon - 2},${lat - 2},${lon + 2},${lat + 2}`, // Approximate bounding box
    lat,
    lon,
    zoom: 6,
  };
};

export const fetchStorms = async (): Promise<ClimateAlert[]> => {
  try {
    const response = await fetch(EONET_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch storm data: ${response.statusText}`);
    }
    const data = await response.json();
    const events: EonetEvent[] = data.events || [];
    // Map events to alerts and filter out any that couldn't be processed (e.g., no geometry).
    return events.map(mapEonetEventToAlert).filter((alert): alert is ClimateAlert => alert !== null);
  } catch (error) {
    console.error("Storm Service Error:", error);
    return []; // Return empty array on error to prevent app crash
  }
};
