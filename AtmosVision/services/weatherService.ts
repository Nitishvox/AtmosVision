import { WeatherData } from '../types';

const API_URL = 'https://api.open-meteo.com/v1/forecast';

export const mapWeatherCodeToDescription = (code: number): string => {
  const codes: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return codes[code] || 'Unknown';
};


export const fetchWeatherData = async (latitude: number, longitude: number, locationName: string): Promise<WeatherData> => {
    const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
        hourly: 'temperature_2m,weather_code',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min',
        timezone: 'auto',
    });

    try {
        const response = await fetch(`${API_URL}?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`Weather API request failed: ${response.statusText}`);
        }
        const data = await response.json();

        const current = data.current;
        const currentData = {
            temperature: Math.round(current.temperature_2m),
            apparentTemperature: Math.round(current.apparent_temperature),
            humidity: current.relative_humidity_2m,
            windSpeed: Math.round(current.wind_speed_10m),
            weatherCode: current.weather_code,
        };
        
        const hourly = data.hourly;
        const hourlyData = hourly.time.slice(0, 24).map((t: string, index: number) => ({
            time: new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }).replace(' ', ''),
            temperature: Math.round(hourly.temperature_2m[index]),
            weatherCode: hourly.weather_code[index],
        }));

        const daily = data.daily;
        const dailyData = daily.time.slice(0, 7).map((d: string, index: number) => ({
            date: new Date(d).toLocaleDateString('en-US', { weekday: 'short' }),
            weatherCode: daily.weather_code[index],
            maxTemp: Math.round(daily.temperature_2m_max[index]),
            minTemp: Math.round(daily.temperature_2m_min[index]),
        }));


        return {
            current: currentData,
            hourly: hourlyData,
            daily: dailyData,
            locationName,
        };

    } catch (error) {
        console.error("Failed to fetch weather data:", error);
        throw error;
    }
};
