// FIX: Made properties within web and maps optional to align with the @google/genai SDK type definition, resolving a type incompatibility.
export interface GroundingChunk {
  web?: { uri?: string; title?: string };
  maps?: {
    uri?: string;
    title?: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        // FIX: Corrected review snippet properties to match the @google/genai SDK. The properties were incorrectly named `source`, `snippet`, and `authorName`, causing a type mismatch. They have been updated to `uri`, `text`, and `author`.
        uri?: string;
        text?: string;
        author?: string;
      }[];
    };
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
  groundingChunks?: GroundingChunk[];
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  locationName: string;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  weatherCode: number;
}

export interface DailyForecast {
  date: string;
  weatherCode: number;
  maxTemp: number;
  minTemp: number;
}

export interface UserSettings {
  firstName: string;
  lastName: string;
  userName: string;
  voiceURI: string; // To store the selected voice identifier
  voiceRate: number; // Speed of speech, typically 0.1 to 10
}