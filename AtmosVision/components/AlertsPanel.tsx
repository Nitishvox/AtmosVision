

import React from 'react';
import { ClimateAlert } from '../services/climateDataService';

const iconMap: Record<ClimateAlert['icon'], React.ReactNode> = {
  wildfire: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.25 9.75c0 3.47-2.82 6.29-6.29 6.29s-6.29-2.82-6.29-6.29c0-3.47 2.82-6.29 6.29-6.29 1.63 0 3.1.62 4.2 1.64.4-.22.84-.39 1.3-.5 1.43-.33 2.88.7 2.88 2.15 0 .96-.54 1.8-1.32 2.25z M12 15.75c-1.55 0-2.93-.8-3.75-2" />,
  thunderstorm: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 14.5a4.5 4.5 0 00-8.49-1.99A4.002 4.002 0 004 16.5h12.5a3.5 3.5 0 00-2.5-4z M10.5 18.5l-2 4h5l-2 4" />,
  air: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.75 9.75h16.5M3.75 14.25h16.5M7.5 5.25s-1.5 3-1.5 4.5 1.5 4.5 1.5 4.5M16.5 5.25s1.5 3 1.5 4.5-1.5 4.5-1.5 4.5" />,
  flood: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 22.5c4.14 0 7.5-3.36 7.5-7.5S16.14 7.5 12 7.5 4.5 10.86 4.5 15s3.36 7.5 7.5 7.5zM12 7.5V3M9 3h6M12 17.25a2.25 2.25 0 01-2.25-2.25c0-1.66 2.25-4.5 2.25-4.5s2.25 2.84 2.25 4.5A2.25 2.25 0 0112 17.25z" />,
  earthquake: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 21a9 9 0 100-18 9 9 0 000 18z M4.5 12.75h3l1.5-3 3 6 1.5-3h3" />,
  storm: <path strokeLinecap="round"strokeLinejoin="round" strokeWidth="1.5" d="M12 6.75c-3.45 0-6.25 2.8-6.25 6.25S8.55 19.25 12 19.25s6.25-2.8 6.25-6.25c0-1.72-.7-3.28-1.83-4.42m-4.42-1.83C10.28 2.8 8.72 2.1 7.25 2.1c-3.45 0-6.25 2.8-6.25 6.25" />,
};

const AlertIcon: React.FC<{ icon: ClimateAlert['icon']; level: ClimateAlert['level'] }> = ({ icon, level }) => {
  const levelMap = {
    critical: 'text-red-500',
    high: 'text-orange-400',
    moderate: 'text-yellow-400',
  };
  let color = levelMap[level];
  if (icon === 'storm') {
    color = level === 'critical' ? 'text-pink-500' : 'text-violet-500';
  }
  if (icon === 'flood') {
    color = 'text-blue-500';
  }

  const svgIcon = iconMap[icon];
  return <svg className={`w-6 h-6 flex-shrink-0 mr-4`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><g className={color}>{svgIcon}</g></svg>;
};

interface AlertItemProps {
  alert: ClimateAlert;
  isSelected: boolean;
  onClick: () => void;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert, isSelected, onClick }) => (
  <button 
    onClick={onClick} 
    className={`flex items-center p-3 rounded-lg w-full text-left transition-colors ${isSelected ? 'bg-gray-200 dark:bg-cyan-500/20' : 'hover:bg-gray-200/50 dark:hover:bg-white/10'}`}
  >
    <AlertIcon icon={alert.icon} level={alert.level} />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{alert.title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{alert.location}</p>
    </div>
  </button>
);

interface AlertsPanelProps {
  alerts: ClimateAlert[];
  selectedAlertId: string | null;
  onAlertClick: (alert: ClimateAlert) => void;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, selectedAlertId, onAlertClick }) => {
  return (
    <div className="space-y-1">
      {alerts.length > 0 ? alerts.map(alert => (
        <AlertItem
          key={alert.id}
          alert={alert}
          isSelected={alert.id === selectedAlertId}
          onClick={() => onAlertClick(alert)}
        />
      )) : (
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 p-4">No active alerts match the selected data layers.</p>
      )}
    </div>
  );
};

export default AlertsPanel;