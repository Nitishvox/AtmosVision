
import React from 'react';
import AlertsPanel from './AlertsPanel';
import DataLayersPanel from './DataLayersPanel';
import { GlobeIcon, XIcon, LogoutIcon, SettingsIcon } from './icons';
import { ClimateAlert } from '../services/climateDataService';
import CollapsiblePanel from './CollapsiblePanel';
import { UserSettings } from '../types';

interface LeftSidebarProps {
  alerts: ClimateAlert[];
  activeLayers: Record<string, boolean>;
  selectedAlertId: string | null;
  onLayerToggle: (layerId: string) => void;
  onAlertClick: (alert: ClimateAlert) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  userEmail: string;
  userSettings: UserSettings;
  onOpenSettings: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ alerts, activeLayers, selectedAlertId, onLayerToggle, onAlertClick, isOpen, onClose, onLogout, userEmail, userSettings, onOpenSettings }) => {
  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
      />
      
      {/* Sidebar Panel */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 h-full w-[85%] max-w-sm
        lg:static lg:h-full lg:w-1/4 lg:max-w-sm lg:min-w-[300px] lg:z-auto
        flex flex-col gap-4 p-4 lg:p-0
        bg-gray-100 dark:bg-[#161B22] 
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <header className="flex-shrink-0 flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-[#0D1117]/50 border border-gray-300 dark:border-[#30363D] backdrop-blur-sm">
          <div className="flex items-center">
            <GlobeIcon className="w-7 h-7 text-cyan-500" />
            <h1 className="ml-3 text-xl font-bold tracking-tight text-gray-800 dark:text-gray-200">
              Atmos<span className="font-semibold text-cyan-500">Vision</span> AI
            </h1>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white" aria-label="Close sidebar">
            <XIcon className="w-5 h-5"/>
          </button>
        </header>
        <div className="flex-grow flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 rounded-lg min-h-0">
          <CollapsiblePanel title="Data Layers">
              <DataLayersPanel activeLayers={activeLayers} onLayerToggle={onLayerToggle} />
          </CollapsiblePanel>
          <CollapsiblePanel title="Active Alerts">
              <AlertsPanel alerts={alerts} selectedAlertId={selectedAlertId} onAlertClick={onAlertClick} />
          </CollapsiblePanel>
        </div>
        
        {/* Footer with User Info and Logout */}
        <div className="flex-shrink-0 pt-4 border-t border-gray-300 dark:border-[#30363D]">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/50 dark:bg-[#0D1117]/50">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate" title={userSettings.userName || userEmail}>
                        {userSettings.firstName && userSettings.lastName ? `${userSettings.firstName} ${userSettings.lastName}` : (userSettings.userName || userEmail)}
                    </p>
                    { (userSettings.firstName || userSettings.lastName) &&
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={userEmail}>
                            {userEmail}
                        </p>
                    }
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onOpenSettings}
                        className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                        aria-label="Open Settings"
                        title="Open Settings"
                    >
                        <SettingsIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onLogout}
                        className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                        aria-label="Sign Out"
                        title="Sign Out"
                    >
                        <LogoutIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
      </aside>
    </>
  );
};

export default LeftSidebar;
