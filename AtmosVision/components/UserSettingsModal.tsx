
import React, { useState, useEffect } from 'react';
import { UserSettings } from '../types';
import { XIcon } from './icons';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: UserSettings) => void;
  currentSettings: UserSettings;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose, onSave, currentSettings }) => {
  const [settings, setSettings] = useState(currentSettings);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    // Sync local state if the props change (e.g., initial load)
    setSettings(currentSettings);
  }, [currentSettings, isOpen]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices().filter(v => v.lang.startsWith('en')); // Filter for English voices
      if (voices.length > 0) {
        setAvailableVoices(voices);
        // If no voice is set, default to the first available one
        if (!settings.voiceURI && voices[0]) {
          setSettings(s => ({ ...s, voiceURI: voices[0].voiceURI }));
        }
      }
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, [settings.voiceURI]); // Dependency on settings.voiceURI to set default

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({ ...prev, voiceURI: e.target.value }));
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, voiceRate: parseFloat(e.target.value) }));
  };
  
  const handleSave = () => {
    onSave(settings);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-[2000]" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="bg-white dark:bg-[#161B22] rounded-xl shadow-2xl w-full max-w-lg border border-gray-300 dark:border-[#30363D] relative" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-[#30363D]">
          <h2 id="settings-title" className="text-xl font-bold text-gray-900 dark:text-white">User Settings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your profile and voice preferences.</p>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10" aria-label="Close settings">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Profile Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                <input type="text" name="firstName" id="firstName" value={settings.firstName} onChange={handleInputChange} className="mt-1 block w-full input-style" />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                <input type="text" name="lastName" id="lastName" value={settings.lastName} onChange={handleInputChange} className="mt-1 block w-full input-style" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="userName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
                <input type="text" name="userName" id="userName" value={settings.userName} onChange={handleInputChange} placeholder="e.g., Analyst One" className="mt-1 block w-full input-style" />
              </div>
            </div>
          </section>

          {/* Voice Settings Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">AI Voice Settings</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="voiceURI" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Voice</label>
                <select id="voiceURI" name="voiceURI" value={settings.voiceURI} onChange={handleSelectChange} className="mt-1 block w-full input-style" disabled={availableVoices.length === 0}>
                  {availableVoices.length > 0 ? (
                    availableVoices.map(voice => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))
                  ) : (
                    <option>Loading voices...</option>
                  )}
                </select>
              </div>
              <div>
                <label htmlFor="voiceRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Speed: <span className="font-mono text-cyan-500">{settings.voiceRate.toFixed(1)}x</span>
                </label>
                <input type="range" id="voiceRate" name="voiceRate" min="0.5" max="2" step="0.1" value={settings.voiceRate} onChange={handleRateChange} className="mt-1 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer" />
              </div>
            </div>
          </section>
        </div>
        
        <div className="p-6 bg-gray-50 dark:bg-[#0D1117] border-t border-gray-200 dark:border-[#30363D] flex justify-end gap-3 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 border border-transparent rounded-md transition-colors">Save Settings</button>
        </div>
      </div>
       <style>{`.input-style { background-color: transparent; border: 1px solid; border-color: #D1D5DB; padding: 0.5rem 0.75rem; border-radius: 0.375rem; } .dark .input-style { border-color: #4B5563; }`}</style>
    </div>
  );
};

export default UserSettingsModal;
