import React, { useState, useEffect } from 'react';
import { fetchWeatherData, mapWeatherCodeToDescription } from '../services/weatherService';
import { WeatherData } from '../types';
import { LoaderIcon } from './icons';
import { WeatherIcon } from './WeatherIcon';

interface WeatherDashboardProps {
  location: { latitude: number; longitude: number; locationName: string };
  onClose: () => void;
}

const WeatherDashboard: React.FC<WeatherDashboardProps> = ({ location, onClose }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWeatherData(location.latitude, location.longitude, location.locationName);
        setWeatherData(data);
      } catch (err) {
        setError('Failed to load weather data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadWeather();
  }, [location]);

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-cyan-400">
        <LoaderIcon className="w-12 h-12 animate-spin" />
        <p className="ml-4 text-xl text-gray-600 dark:text-cyan-400">Fetching Local Weather Data...</p>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-red-400 flex-col">
          <p className="text-xl">{error || 'No weather data available.'}</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-red-600 rounded-lg hover:bg-red-500 text-white">Close</button>
      </div>
    );
  }
  
  const { current, hourly, daily, locationName } = weatherData;

  return (
    <section className="w-full max-w-7xl mx-auto p-4 md:p-6" id="weather-dashboard">
      <div className="bg-white/50 dark:bg-[#161B22]/50 p-6 rounded-lg border border-gray-300 dark:border-[#30363D] backdrop-blur-md">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Weather Analysis</h2>
                <p className="text-cyan-500 dark:text-cyan-400 text-lg">{locationName}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/10 transition-colors" aria-label="Close weather dashboard">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Conditions */}
            <div className="md:col-span-1 bg-gradient-to-br from-cyan-500/80 to-blue-600/80 dark:from-cyan-800/50 dark:to-blue-900/50 text-white p-6 rounded-lg flex flex-col justify-between shadow-lg">
                <div>
                    <p className="text-blue-100 text-sm">Now</p>
                    <p className="text-6xl font-bold tracking-tighter text-white">{current.temperature}°</p>
                    <p className="text-blue-200">Feels like {current.apparentTemperature}°</p>
                </div>
                <div className="flex items-center mt-4">
                    <WeatherIcon code={current.weatherCode} className="w-12 h-12 text-white" />
                    <p className="ml-4 font-semibold text-lg text-white">{mapWeatherCodeToDescription(current.weatherCode)}</p>
                </div>
            </div>

            {/* Hourly Forecast */}
            <div className="md:col-span-2 bg-gray-100/50 dark:bg-[#0D1117]/50 p-6 rounded-lg border border-gray-300 dark:border-[#30363D]">
                <h3 className="font-semibold mb-4 text-gray-800 dark:text-white">Hourly Forecast</h3>
                <div className="flex overflow-x-auto custom-scrollbar pb-2 -mb-2">
                    {hourly.map((hour, index) => (
                        <div key={index} className="flex-shrink-0 w-20 text-center border-r border-gray-300 dark:border-[#30363D] last:border-r-0 px-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">{hour.time}</p>
                            <WeatherIcon code={hour.weatherCode} className="w-8 h-8 mx-auto my-2 text-cyan-500 dark:text-cyan-400" />
                            <p className="font-bold text-gray-800 dark:text-white">{hour.temperature}°</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 7-Day Forecast */}
            <div className="md:col-span-3 bg-gray-100/50 dark:bg-[#0D1117]/50 p-6 rounded-lg border border-gray-300 dark:border-[#30363D]">
                 <h3 className="font-semibold mb-3 text-gray-800 dark:text-white">7-Day Forecast</h3>
                 <div className="space-y-1">
                    {daily.map((day, index) => (
                        <div key={index} className={`grid grid-cols-3 items-center gap-4 text-sm text-gray-800 dark:text-gray-200 p-2 rounded-md ${index % 2 === 0 ? 'bg-gray-200/50 dark:bg-white/5' : ''}`}>
                            <p className="font-medium">{day.date}</p>
                            <div className="flex items-center justify-center gap-2">
                                <WeatherIcon code={day.weatherCode} className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                                <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400">{mapWeatherCodeToDescription(day.weatherCode)}</span>
                            </div>
                            <p className="text-right"><span className="font-semibold">{day.maxTemp}°</span> / <span className="text-gray-500 dark:text-gray-400">{day.minTemp}°</span></p>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(WeatherDashboard);