import React from 'react';
import { layersData } from '../services/climateDataService';
import { InfoIcon } from './icons';

interface LayerToggleProps {
  label: string;
  uiColor: string;
  description: string;
  isChecked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const LayerToggle: React.FC<LayerToggleProps> = ({ label, uiColor, description, isChecked, onToggle, disabled = false }) => {
  return (
    <div className={`flex items-center justify-between p-2 rounded-md transition-opacity ${disabled ? 'opacity-50' : 'hover:bg-gray-200/50 dark:hover:bg-white/10'}`}>
      <div className="flex items-center group relative">
        <span
          className="w-3 h-3 rounded-full mr-3 border border-black/20 dark:border-white/20"
          style={{ backgroundColor: uiColor }}
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
        <InfoIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-white dark:bg-[#0D1117] text-gray-800 dark:text-gray-200 text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 border border-gray-200 dark:border-[#30363D]">
            {description}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-white dark:border-t-[#0D1117]"></div>
        </div>
      </div>
      <label className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onToggle}
          className="sr-only"
          disabled={disabled}
        />
        <div
          className="relative w-9 h-5 bg-gray-300 dark:bg-gray-600 rounded-full transition-colors"
          style={{ backgroundColor: isChecked && !disabled ? uiColor : undefined }}
        >
          <span
            className={`absolute top-[2px] left-[2px] bg-white border-gray-300 border rounded-full h-4 w-4 transition-transform duration-300 ease-in-out transform ${isChecked && !disabled ? 'translate-x-4' : 'translate-x-0'}`}
          />
        </div>
      </label>
    </div>
  );
};


interface DataLayersPanelProps {
  activeLayers: Record<string, boolean>;
  onLayerToggle: (layerId: string) => void;
}

const DataLayersPanel: React.FC<DataLayersPanelProps> = ({ activeLayers, onLayerToggle }) => {
  return (
    <div className="space-y-2">
      {layersData.map(layer => {
        const isDisabled = !layer.geojson && layer.type !== 'tile' && !layer.alertType;
        return (
          <LayerToggle
            key={layer.id}
            label={layer.label}
            uiColor={layer.uiColor}
            description={layer.description}
            isChecked={!isDisabled && !!activeLayers[layer.id]}
            onToggle={() => !isDisabled && onLayerToggle(layer.id)}
            disabled={isDisabled}
          />
        );
      })}
    </div>
  );
};

export default DataLayersPanel;