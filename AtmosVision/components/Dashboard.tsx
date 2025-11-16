
import React, { useState, useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import LeftSidebar from './LeftSidebar';
import Map from './Map';
import RightSidebar from './RightSidebar';
import NotificationBanner from './NotificationBanner';
import { alertsData, ClimateAlert, layersData } from '../services/climateDataService';
import { fetchEarthquakes } from '../services/earthquakeService';
import { fetchStorms } from '../services/stormService';
import WeatherDashboard from './WeatherDashboard';
import UserSettingsModal from './UserSettingsModal';
import { UserSettings } from '../types';

const DEFAULT_MAP_VIEW = { center: [28.6, 77.2] as [number, number], zoom: 10 }; // Centered on Delhi
type Theme = 'light' | 'dark';

const DEFAULT_SETTINGS: UserSettings = {
    firstName: '',
    lastName: '',
    userName: '',
    voiceURI: '',
    voiceRate: 1,
};

interface DashboardProps {
    onLogout: () => void;
    userEmail: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, userEmail }) => {
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    wildfire: true,
    flood: true,
    airquality: true,
    storms: true,
    earthquakes: true,
    drought: true,
    satellite: true,
  });
  const [mapView, setMapView] = useState(DEFAULT_MAP_VIEW);
  const [allAlerts, setAllAlerts] = useState<ClimateAlert[]>(alertsData);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>('alert3');
  const [notification, setNotification] = useState<ClimateAlert | null>(null);
  const [weatherDataLocation, setWeatherDataLocation] = useState<{ latitude: number; longitude: number; locationName: string } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const knownEarthquakeIds = useRef(new Set<string>());
  const [theme, setTheme] = useState<Theme>('dark');
  const [userSettings, setUserSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);

  const [isLeftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setRightSidebarOpen] = useState(false);

  useEffect(() => {
    const currentHour = new Date().getHours();
    setTheme(currentHour >= 6 && currentHour < 18 ? 'light' : 'dark');
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  useEffect(() => {
    // Load user settings
    const savedSettings = localStorage.getItem('atmosvision-user-settings');
    if (savedSettings) {
        try {
            const parsed = JSON.parse(savedSettings);
            // Merge with defaults to ensure all keys are present after updates
            setUserSettings(prev => ({ ...prev, ...parsed }));
        } catch (e) {
            console.error("Failed to parse user settings from localStorage", e);
        }
    }
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (error) => {
                console.warn("Could not get user location:", error.message);
            }
        );
    }
  }, []);

  // Effect for fetching and updating live data (Earthquakes and Storms)
  useEffect(() => {
    const sortAlerts = (alerts: ClimateAlert[]) => {
        return alerts.sort((a, b) => {
            const levels: Record<ClimateAlert['level'], number> = { critical: 2, high: 1, moderate: 0 };
            return levels[b.level] - levels[a.level];
        });
    }

    const updateEarthquakes = async () => {
      const newEarthquakes = await fetchEarthquakes();
      
      setAllAlerts(prevAlerts => {
        const staticAndStormAlerts = prevAlerts.filter(a => !a.id.startsWith('eq-'));
        const combined = [...staticAndStormAlerts, ...newEarthquakes];
        return sortAlerts(combined);
      });

      const significantNewQuake = newEarthquakes.find(
        quake => quake.level !== 'moderate' && !knownEarthquakeIds.current.has(quake.id)
      );

      if (significantNewQuake) {
        setNotification(significantNewQuake);
        setMapView({ center: [significantNewQuake.lat, significantNewQuake.lon], zoom: significantNewQuake.zoom });
        setSelectedAlertId(significantNewQuake.id);
        setActiveLayers(prev => ({ ...prev, earthquakes: true }));
      }

      newEarthquakes.forEach(quake => knownEarthquakeIds.current.add(quake.id));
    };
    
    const updateStorms = async () => {
        const newStorms = await fetchStorms();
        setAllAlerts(prevAlerts => {
            const otherAlerts = prevAlerts.filter(a => a.icon !== 'storm');
            const combined = [...otherAlerts, ...newStorms];
            return sortAlerts(combined);
        });
    };

    updateEarthquakes();
    updateStorms();
    const earthquakeInterval = setInterval(updateEarthquakes, 60000); // Poll every 60 seconds
    const stormInterval = setInterval(updateStorms, 300000); // Poll every 5 minutes
    
    return () => {
        clearInterval(earthquakeInterval);
        clearInterval(stormInterval);
    };
  }, []);

  const filteredAlerts = useMemo(() => {
    const activeLayerAlertTypes = new Set(
      layersData
        .filter(layer => activeLayers[layer.id] && layer.alertType)
        .map(layer => layer.alertType)
    );

    return allAlerts.filter(alert => {
      return activeLayerAlertTypes.has(alert.icon);
    });
  }, [allAlerts, activeLayers]);

  // Effect to deselect an alert if it gets filtered out
  useEffect(() => {
    if (selectedAlertId && !filteredAlerts.find(a => a.id === selectedAlertId)) {
      setSelectedAlertId(null);
    }
  }, [filteredAlerts, selectedAlertId]);


  const handleLayerToggle = (layerId: string) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  };

  const handleAlertClick = (alert: ClimateAlert) => {
    setMapView({ center: [alert.lat, alert.lon], zoom: alert.zoom });
    setSelectedAlertId(alert.id);
     if (window.innerWidth < 1024) { // 1024px is lg breakpoint in Tailwind
        setLeftSidebarOpen(false);
    }
  };
  
  const handleMapClick = (latlng: L.LatLng) => {
    setClickedLocation({ lat: latlng.lat, lng: latlng.lng });
    // Open the right sidebar on mobile for immediate feedback
    if (window.innerWidth < 1024) {
      setRightSidebarOpen(true);
    }
  };

  const handleNotificationClose = () => {
    setNotification(null);
  };

  const handleShowWeather = (location: { latitude: number; longitude: number; locationName: string }) => {
    setWeatherDataLocation(location);
    if (window.innerWidth < 1024) {
      setRightSidebarOpen(false);
    }
  };

  const handleCloseWeather = () => {
    setWeatherDataLocation(null);
  };
  
  const handleSaveSettings = (newSettings: UserSettings) => {
    setUserSettings(newSettings);
    localStorage.setItem('atmosvision-user-settings', JSON.stringify(newSettings));
    setSettingsModalOpen(false);
  };

  return (
    <div className="h-screen w-screen bg-gray-100 dark:bg-[#0D1117] text-gray-800 dark:text-gray-200 font-sans overflow-hidden">
      <div className="relative h-full w-full flex lg:flex-row lg:p-4 lg:gap-4">
        <NotificationBanner alert={notification} onClose={handleNotificationClose} />
        
        <LeftSidebar
          alerts={filteredAlerts}
          activeLayers={activeLayers}
          selectedAlertId={selectedAlertId}
          onLayerToggle={handleLayerToggle}
          onAlertClick={handleAlertClick}
          isOpen={isLeftSidebarOpen}
          onClose={() => setLeftSidebarOpen(false)}
          onLogout={onLogout}
          userEmail={userEmail}
          userSettings={userSettings}
          onOpenSettings={() => setSettingsModalOpen(true)}
        />

        <main className="h-full flex-1 min-w-0">
          <Map
            alerts={filteredAlerts}
            activeLayers={activeLayers}
            mapView={mapView}
            selectedAlertId={selectedAlertId}
            theme={theme}
            onMarkerClick={handleAlertClick}
            onMapClick={handleMapClick}
            onOpenLeftSidebar={() => setLeftSidebarOpen(true)}
            onOpenRightSidebar={() => setRightSidebarOpen(true)}
          />
        </main>

        <RightSidebar 
            activeLayers={activeLayers} 
            onLocationAnalysis={handleShowWeather} 
            userLocation={userLocation}
            clickedLocation={clickedLocation}
            onClearClickedLocation={() => setClickedLocation(null)}
            isOpen={isRightSidebarOpen}
            onClose={() => setRightSidebarOpen(false)}
            userSettings={userSettings}
        />

        {weatherDataLocation && (
          <div className="absolute inset-0 z-[1500] bg-gray-100/80 dark:bg-[#0D1117]/80 backdrop-blur-md overflow-y-auto custom-scrollbar p-4 weather-dashboard-enter">
             <WeatherDashboard location={weatherDataLocation} onClose={handleCloseWeather} />
          </div>
        )}
        
        <UserSettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setSettingsModalOpen(false)}
            onSave={handleSaveSettings}
            currentSettings={userSettings}
        />
      </div>
    </div>
  );
};

export default Dashboard;
