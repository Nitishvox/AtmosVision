import React, { useState } from 'react';

const ChevronIcon: React.FC<{ isExpanded: boolean }> = ({ isExpanded }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-5 w-5 transform transition-transform duration-300 ${isExpanded ? '' : '-rotate-90'}`}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

interface CollapsiblePanelProps {
  title: string;
  children: React.ReactNode;
}

const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({ title, children }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white/50 dark:bg-[#0D1117]/50 rounded-lg border border-gray-300 dark:border-[#30363D] backdrop-blur-sm transition-all duration-300">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-opacity-75"
        aria-expanded={isExpanded}
        aria-controls={`panel-content-${title.replace(/\s+/g, '-')}`}
      >
        <h3 className="text-base font-semibold text-gray-800 dark:text-white">{title}</h3>
        <ChevronIcon isExpanded={isExpanded} />
      </button>
      <div
        id={`panel-content-${title.replace(/\s+/g, '-')}`}
        className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
            <div className="p-4 pt-0">
                {children}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CollapsiblePanel;