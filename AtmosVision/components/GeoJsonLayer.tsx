import React from 'react';
import { GeoJSON } from 'react-leaflet';
import { MapLayer } from '../services/climateDataService';

interface GeoJsonLayerProps {
  layer: MapLayer;
  theme: 'light' | 'dark';
}

const GeoJsonLayer: React.FC<GeoJsonLayerProps> = ({ layer, theme }) => {
  // Only render if it's a GeoJSON layer with valid data
  if (layer.type !== 'geojson' || !layer.geojson) {
    return null;
  }

  // Define the style for the GeoJSON layer
  const layerStyle = {
    fillColor: layer.color,
    weight: 1,
    opacity: 0.8,
    color: theme === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)',
    fillOpacity: 0.6,
  };

  return <GeoJSON data={layer.geojson} style={layerStyle} />;
};

export default GeoJsonLayer;
