import React, { useState, useEffect } from 'react';
import { ClimateAlert } from '../services/climateDataService';

interface NotificationBannerProps {
  alert: ClimateAlert | null;
  onClose: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ alert, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (alert) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [alert]);

  if (!alert) {
    return null;
  }

  return (
    <div
      className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl z-[2000] p-4 transition-transform duration-500 ease-in-out ${isVisible ? 'translate-y-4' : '-translate-y-full'}`}
    >
      <div className="bg-red-800/90 backdrop-blur-sm border border-red-600 text-white rounded-lg shadow-2xl flex items-center justify-between p-3">
        <div className="flex items-center">
            <svg className="w-8 h-8 mr-4 text-red-300 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
                <p className="font-bold text-base">{alert.title}</p>
                <p className="text-sm text-red-200">{alert.location}</p>
            </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-red-700/50 transition-colors"
          aria-label="Dismiss notification"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationBanner;