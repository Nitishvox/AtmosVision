import React from 'react';

type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface AuraOrbProps {
  state: OrbState;
  onClick: () => void;
}

const AuraOrb: React.FC<AuraOrbProps> = ({ state, onClick }) => {
  const isThinking = state === 'thinking';
  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';

  return (
    <button 
      onClick={onClick}
      className="w-20 h-20 relative flex items-center justify-center transition-transform duration-300 ease-in-out transform hover:scale-105 focus:outline-none"
      aria-label={state === 'listening' ? 'Stop listening' : 'Start listening'}
      style={{ filter: 'url(#goo)' }}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full animate-pulse opacity-50"></div>
      
      <svg className="w-full h-full absolute" width="80" height="80" >
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      
      <div className={`absolute w-16 h-16 rounded-full transition-all duration-500 ${isThinking ? 'animate-spin' : ''}`}>
        <div 
          className="absolute w-12 h-12 bg-cyan-300 rounded-full"
          style={{ animation: `move1 10s alternate infinite ease-in-out ${isListening || isSpeaking ? '2s' : ''}` }}
        />
        <div 
          className="absolute w-10 h-10 bg-blue-400 rounded-full" 
          style={{ animation: `move2 12s alternate-reverse infinite ease-in-out ${isListening || isSpeaking ? '2s' : ''}`}}
        />
        <div 
          className="absolute w-8 h-8 bg-teal-400 rounded-full"
          style={{ animation: `move3 8s alternate infinite ease-in-out ${isListening || isSpeaking ? '2s' : ''}` }}
        />
      </div>

      <div className={`absolute w-full h-full rounded-full transition-all duration-300 border-2 ${isListening ? 'border-cyan-400 animate-pulse scale-125' : 'border-transparent'} ${isSpeaking ? 'border-blue-400 animate-pulse scale-110' : ''}`}></div>

      <div className="relative z-10 text-white">
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z"></path>
            <path d="M5.5 9.5a.5.5 0 01.5.5v1a4 4 0 004 4h.5a.5.5 0 010 1h-.5a5 5 0 01-5-5v-1a.5.5 0 01.5-.5z"></path>
            <path d="M10 18a5 5 0 005-5v-1a.5.5 0 011 0v1a6 6 0 01-6 6v2a.5.5 0 01-1 0v-2a6 6 0 01-6-6v-1a.5.5 0 011 0v1a5 5 0 005 5z"></path>
        </svg>
      </div>

      <style>
        {`
          @keyframes move1 {
            0% { transform: translate(10px, -15px) scale(1.1); }
            100% { transform: translate(-10px, 15px) scale(0.9); }
          }
          @keyframes move2 {
            0% { transform: translate(-12px, -8px) scale(0.8); }
            100% { transform: translate(12px, 8px) scale(1.2); }
          }
          @keyframes move3 {
            0% { transform: translate(-8px, 10px) scale(1.2); }
            100% { transform: translate(8px, -10px) scale(0.8); }
          }
        `}
      </style>
    </button>
  );
};

export default AuraOrb;
