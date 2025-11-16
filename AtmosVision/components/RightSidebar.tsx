
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ChatPanel from './ChatPanel';
import AuraOrb from './AuraOrb';
import ChatInput from './ChatInput';
import { ChatMessage, GroundingChunk, UserSettings } from '../types';
import { streamMessageToAI } from '../services/aiService';
import { layersData } from '../services/climateDataService';
import { KeyboardIcon, MicIcon, XIcon, BroomIcon } from './icons';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type AppState = 'idle' | 'listening' | 'thinking' | 'speaking';
type InteractionMode = 'voice' | 'text';
type MicPermission = 'checking' | 'prompt' | 'granted' | 'denied';
type SelectedImage = { url: string; base64: string; mimeType: string };


const initialMessages = (): ChatMessage[] => [{ 
    id: '1', 
    role: 'model', 
    text: `I am the AtmosVision AI, a world-class climate and environmental analyst integrated into the AtmosVision AI Resilience Platform's Global Risk Monitor. My primary function is to provide you with expert intelligence on environmental risks and climate resilience, leveraging real-time geospatial data.

Here's what I can do:
* **Analyze Active Data Layers**: I monitor and interpret the active data layers you have selected on the map. My analysis will be directly relevant to these visible layers.
* **Analyze Uploaded Images**: Upload an image for detailed visual analysis of environmental conditions, damage assessment, or geographic features.
* **Provide Expert Risk Assessments**: I can give you detailed, location-specific summaries of critical environmental risks, including risk levels and actionable preparedness steps.
* **Access Real-Time Data**: I synthesize information from global monitoring systems to give you the latest updates.

You can ask me questions like:
* "What are the biggest risks in the current view?"
* "Give me a detailed analysis of the active alert in Delhi."
* "Analyze this image for flood damage and identify affected infrastructure."

How can I help you analyze climate risks today?`
}];

const stripMarkdownForSpeech = (text: string): string => {
  return text
    // Remove multi-line code blocks, which might contain markdown characters
    .replace(/```[\s\S]*?```/g, '')
    // Remove headings (e.g., ### Title)
    .replace(/^###\s/gm, '')
    // Remove ordered list markers (e.g., "1. ")
    .replace(/^\s*\d+\.\s/gm, '')
    // Remove unordered list markers (e.g., "* " or "- ")
    .replace(/^\s*([*-])\s/gm, '')
    // Remove bold/italics markers (**, *, __, _)
    .replace(/(\*\*|__|\*|_)/g, '')
    .trim();
};

interface RightSidebarProps {
  activeLayers: Record<string, boolean>;
  onLocationAnalysis: (location: { latitude: number; longitude: number; locationName: string }) => void;
  userLocation: { lat: number; lng: number } | null;
  clickedLocation: { lat: number; lng: number } | null;
  onClearClickedLocation: () => void;
  isOpen: boolean;
  onClose: () => void;
  userSettings: UserSettings | null;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ activeLayers, onLocationAnalysis, userLocation, clickedLocation, onClearClickedLocation, isOpen, onClose, userSettings }) => {
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        const saved = localStorage.getItem('atmosvision-chat-history');
        return saved ? JSON.parse(saved) : initialMessages();
    });
    const [appState, setAppState] = useState<AppState>('idle');
    const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
    const [interactionMode, setInteractionMode] = useState<InteractionMode>('voice');
    const [micPermission, setMicPermission] = useState<MicPermission>('checking');
    const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
    const recognitionRef = useRef<any>(null);
    const speechCancelledRef = useRef(false);

    useEffect(() => {
        localStorage.setItem('atmosvision-chat-history', JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        const checkMicPermission = async () => {
            if (!navigator.permissions || !window.SpeechRecognition && !window.webkitSpeechRecognition) {
                setMicPermission('denied');
                setInteractionMode('text');
                 setMessages(prev => {
                    if(prev.find(m => m.id === 'mic-unsupported')) return prev;
                    return [...prev, { id: 'mic-unsupported', role: 'model', text: 'Voice input is not supported by your browser. Switched to text mode.' }];
                });
                return;
            }

            try {
                const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
                setMicPermission(permissionStatus.state);

                if (permissionStatus.state === 'denied') {
                    setInteractionMode('text');
                    setMessages(prev => {
                        if(prev.find(m => m.id === 'mic-denied-initial')) return prev;
                        return [...prev, { id: 'mic-denied-initial', role: 'model', text: "Microphone access is blocked. To use voice commands, please enable it in your browser's site settings. I've switched to text mode." }];
                    });
                }
                
                permissionStatus.onchange = () => {
                    setMicPermission(permissionStatus.state);
                     if (permissionStatus.state === 'denied') {
                        setInteractionMode('text');
                     }
                };
            } catch (error) {
                console.error("Error checking microphone permissions:", error);
                setMicPermission('prompt');
                setInteractionMode('text');
                setMessages(prev => {
                    if(prev.find(m => m.id === 'mic-check-fail')) return prev;
                    return [...prev, { id: 'mic-check-fail', role: 'model', text: 'Could not check microphone permissions. Defaulting to text mode.' }];
                });
            }
        };
        checkMicPermission();
    }, []);

    const speak = useCallback((text: string, messageId: string) => {
        speechCancelledRef.current = false;
        speechSynthesis.cancel();
        setAppState('speaking');
        setSpeakingMessageId(messageId);

        const cleanText = stripMarkdownForSpeech(text);
        const sentences = cleanText.match(/[^.!?]+[.!?]*|[^.!?\n]+(?=\n|$)/g) || [];
        const utteranceQueue = sentences.map(s => s.trim()).filter(s => s.length > 0);

        if (utteranceQueue.length === 0) {
          setAppState('idle');
          setSpeakingMessageId(null);
          return;
        }

        let currentUtteranceIndex = 0;

        const playNext = () => {
          if (speechCancelledRef.current) {
            return;
          }
          
          if (currentUtteranceIndex >= utteranceQueue.length) {
            setAppState('idle');
            setSpeakingMessageId(null);
            return;
          }
          
          const utterance = new SpeechSynthesisUtterance(utteranceQueue[currentUtteranceIndex]);
          
          if (userSettings) {
              const voices = speechSynthesis.getVoices();
              if (voices.length > 0) {
                  const selectedVoice = voices.find(v => v.voiceURI === userSettings.voiceURI);
                  if (selectedVoice) {
                      utterance.voice = selectedVoice;
                  }
              }
              utterance.rate = userSettings.voiceRate || 1;
          }
          
          utterance.onend = playNext;
          utterance.onerror = (e) => {
            if (speechCancelledRef.current || e.error === 'canceled') {
              return;
            }
            console.error("Speech synthesis error:", e);
            setMessages(prev => [...prev, {id: `tts-error-${Date.now()}`, role: 'model', text: `Sorry, a voice output error occurred. (Reason: ${e.error})`}]);
            setAppState('idle');
            setSpeakingMessageId(null);
          };
          
          speechSynthesis.speak(utterance);
          currentUtteranceIndex++;
        };
        playNext();
    }, [userSettings]);

    const processAndRespond = useCallback(async (userText: string, locationOverride?: { lat: number, lng: number }) => {
        if (!userText.trim() && !selectedImage) return;

        const userMessage: ChatMessage = { 
            id: Date.now().toString(), 
            role: 'user', 
            text: userText,
            imageUrl: selectedImage?.url
        };
        setMessages(prev => [...prev, userMessage]);
        
        const imageToSend = selectedImage ? { base64: selectedImage.base64, mimeType: selectedImage.mimeType } : undefined;
        setSelectedImage(null); // Clear image from input area after adding to chat history

        setAppState('thinking');

        const modelMessageId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: '', groundingChunks: [] }]);

        const activeLayerNames = layersData
            .filter(layer => activeLayers[layer.id])
            .map(layer => layer.label);

        let fullResponse = '';
        let allGroundingChunks: GroundingChunk[] = [];
        const locationForAI = locationOverride || userLocation;

        try {
            const stream = streamMessageToAI(userText, activeLayerNames, locationForAI, imageToSend);
            for await (const chunk of stream) {
                fullResponse += chunk.text;
                const newChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

                if (newChunks.length > 0) {
                    const currentUris = new Set(allGroundingChunks.map(c => c.web?.uri || c.maps?.uri).filter(Boolean));
                    const uniqueNew = newChunks.filter(nc => !currentUris.has(nc.web?.uri || nc.maps?.uri));
                    allGroundingChunks.push(...uniqueNew);
                }
                
                setMessages(prev => prev.map(msg => 
                    msg.id === modelMessageId ? { ...msg, text: fullResponse, groundingChunks: allGroundingChunks } : msg
                ));
            }
        } catch (error: any) { 
            console.error("Error processing AI response:", error);
            fullResponse = error.message || "Sorry, I encountered an error. Please try again.";
        } finally {
             // Final update after stream ends
             if (fullResponse.includes('```json')) {
                const jsonMatch = fullResponse.match(/```json\s*([\s\S]*?)\s*```/);
                if (jsonMatch && jsonMatch[1]) {
                    try {
                        const locationData = JSON.parse(jsonMatch[1]);
                        if (locationData.latitude && locationData.longitude && locationData.locationName) {
                            onLocationAnalysis(locationData);
                        }
                        fullResponse = fullResponse.replace(/```json\s*([\s\S]*?)\s*```/, '').trim();
                    } catch (e) {
                        console.error("Failed to parse location JSON from AI response:", e);
                    }
                }
            }

            setMessages(prev => prev.map(msg => 
                msg.id === modelMessageId ? { ...msg, text: fullResponse.trim(), groundingChunks: allGroundingChunks } : msg
            ));
        }
        
        if (interactionMode === 'voice') {
          speak(fullResponse.trim(), modelMessageId);
        } else {
          setAppState('idle');
        }
    }, [interactionMode, speak, activeLayers, onLocationAnalysis, userLocation, selectedImage]);
    
    useEffect(() => {
        if (clickedLocation) {
            const prompt = `Provide a very brief environmental summary for the location at latitude ${clickedLocation.lat.toFixed(4)}, longitude ${clickedLocation.lng.toFixed(4)}.`;
            processAndRespond(prompt, clickedLocation);
            onClearClickedLocation();
        }
    }, [clickedLocation, processAndRespond, onClearClickedLocation]);


    const handleOrbClick = async () => {
        if (appState === 'listening') {
          recognitionRef.current?.stop();
          return;
        }

        if (appState === 'speaking') {
          speechCancelledRef.current = true;
          speechSynthesis.cancel();
          setAppState('idle');
          setSpeakingMessageId(null);
          return;
        }

        if (appState === 'idle') {
          speechSynthesis.cancel();
          setSpeakingMessageId(null);
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            if (micPermission !== 'granted') setMicPermission('granted');
          } catch (err) {
            if (micPermission !== 'denied') setMicPermission('denied');
            setInteractionMode('text');
            setMessages(prev => {
              if (prev.some(m => m.id.startsWith('mic-denied-runtime'))) return prev;
              return [...prev, { id: `mic-denied-runtime-${Date.now()}`, role: 'model', text: "Microphone access denied. Please enable it in site settings to use voice mode. I've switched to text." }];
            });
            return;
          }

          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (!SpeechRecognition) return;

          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = false;
          recognitionRef.current.interimResults = false;
          recognitionRef.current.onstart = () => setAppState('listening');
          recognitionRef.current.onresult = (event: any) => processAndRespond(event.results[0][0].transcript);
          recognitionRef.current.onend = () => setAppState(current => (current === 'listening' ? 'idle' : current));
          recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'aborted') { setAppState('idle'); return; }
            let errorMessage = "Sorry, a speech recognition error occurred.";
            if (event.error === 'no-speech') errorMessage = "I didn't hear anything. Please try again.";
            if (event.error === 'not-allowed') {
              errorMessage = "Microphone access was denied. To use voice commands, please allow access in your browser's site settings. I've switched to text mode.";
              setInteractionMode('text');
              if (micPermission !== 'denied') setMicPermission('denied');
            }
            if (event.error === 'network') errorMessage = "A network error occurred with the speech service.";
            setMessages(prev => [...prev, { id: `mic-error-${Date.now()}`, role: 'model', text: errorMessage }]);
            setAppState('idle');
          };
          recognitionRef.current.start();
        }
    };
    
    const handleImageSelect = (file: File) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const url = reader.result as string;
                const base64 = url.split(',')[1];
                setSelectedImage({ url, base64, mimeType: file.type });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageRemove = () => {
        setSelectedImage(null);
    };
    
    const handleClearChat = () => {
        setMessages(initialMessages());
    };

    return (
        <>
        {/* Backdrop for mobile */}
        <div 
            onClick={onClose}
            className={`fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        />
        <aside className={`
            fixed lg:static inset-y-0 right-0 z-50 h-full w-[90%] max-w-md
            lg:h-full lg:w-1/3 lg:max-w-md lg:min-w-[400px]
            flex flex-col
            bg-white/70 dark:bg-[#161B22]/70 backdrop-blur-md rounded-l-lg lg:rounded-lg shadow-lg border-l border-gray-300 dark:border-[#30363D] lg:border
            transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0
        `}>
            <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-300 dark:border-[#30363D]">
                <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    AtmosVision AI Analyst
                </h2>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleClearChat}
                        className="p-2 bg-gray-200/60 dark:bg-[#30363D]/60 rounded-full text-gray-800 dark:text-gray-200 hover:bg-gray-300/80 dark:hover:bg-[#30363D]/80 transition-colors"
                        aria-label="Clear chat history"
                        title="Clear chat"
                    >
                        <BroomIcon className="w-5 h-5" />
                    </button>
                     <button onClick={onClose} className="lg:hidden p-1 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white" aria-label="Close sidebar">
                        <XIcon className="w-5 h-5"/>
                    </button>
                </div>
            </header>
            
            <div className="flex-grow w-full flex flex-col overflow-hidden p-4">
                <ChatPanel messages={messages} speakingMessageId={speakingMessageId} />
            </div>

            <div className="flex-shrink-0 w-full px-4 py-4 flex justify-center">
                {interactionMode === 'voice' && micPermission !== 'denied' ? (
                    <AuraOrb state={appState} onClick={handleOrbClick} />
                ) : (
                    <ChatInput 
                        onSendMessage={processAndRespond} 
                        disabled={appState === 'thinking'} 
                        selectedImage={selectedImage?.url}
                        onImageSelect={handleImageSelect}
                        onImageRemove={handleImageRemove}
                    />
                )}
            </div>

            {micPermission !== 'denied' && micPermission !== 'checking' && (
                <button
                    onClick={() => setInteractionMode(p => p === 'voice' ? 'text' : 'voice')}
                    className="absolute top-3 right-24 lg:right-14 z-10 p-2 bg-gray-200/60 dark:bg-[#30363D]/60 rounded-full text-gray-800 dark:text-gray-200 hover:bg-gray-300/80 dark:hover:bg-[#30363D]/80 transition-colors"
                    aria-label={`Switch to ${interactionMode === 'voice' ? 'text' : 'voice'} mode`}
                    title={`Switch to ${interactionMode === 'voice' ? 'text' : 'voice'} mode`}
                >
                    {interactionMode === 'voice' ? <KeyboardIcon className="w-5 h-5" /> : <MicIcon className="w-5 h-5" />}
                </button>
            )}
        </aside>
        </>
    );
};

export default RightSidebar;
