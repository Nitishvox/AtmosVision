import React from 'react';

interface WeatherIconProps {
  code: number;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ code, className = 'w-6 h-6' }) => {
  let iconPath = '';
  // Mapping WMO codes to SVG paths.
  switch (code) {
    case 0: // Clear sky
      iconPath = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
      break;
    case 1: // Mainly clear
    case 2: // Partly cloudy
    case 3: // Overcast
      iconPath = '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>';
      break;
    case 45: // Fog
    case 48:
      iconPath = '<line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>';
      break;
    case 51: // Drizzle
    case 53:
    case 55:
    case 61: // Rain
    case 63:
    case 65:
    case 80: // Rain showers
    case 81:
    case 82:
      iconPath = '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path><path d="M8 14v6"></path><path d="M12 16v6"></path><path d="M16 14v6"></path>';
      break;
    case 71: // Snow
    case 73:
    case 75:
    case 85: // Snow showers
    case 86:
      iconPath = '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path><path d="m8 15-1.9 1.9"></path><path d="m12 13-1.9 1.9"></path><path d="m16 15-1.9 1.9"></path><path d="m8 19 1.9-1.9"></path><path d="m12 21 1.9-1.9"></path><path d="m16 19 1.9-1.9"></path>';
      break;
    case 95: // Thunderstorm
    case 96:
    case 99:
      iconPath = '<path d="M21.73 18a4.5 4.5 0 0 0-8.46-1c-.51-.62-1-1-1.27-1a4 4 0 0 0-3.14 6.94"></path><path d="m13 2-4 9h6l-4 9"></path>';
      break;
    default: // Default to cloudy
      iconPath = '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>';
      break;
  }

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      dangerouslySetInnerHTML={{ __html: iconPath }}
    />
  );
};
