/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useCallback, useEffect, useState} from 'react';
import ApiKeyDialog from './components/ApiKeyDialog';
import LoadingIndicator from './components/LoadingIndicator';
import WeatherForm from './components/PromptForm'; // Renamed file content, keep import safe
import VideoResult from './components/VideoResult';
import {generateReporterVideo, generateWeatherSummary} from './services/geminiService';
import {getCoordinates, getWeatherForecast} from './services/weatherService';
import {
  AppState,
  GeoResult,
  WeatherData
} from './types';
import { CloudRain, Wind, Thermometer } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  const [location, setLocation] = useState<GeoResult | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Check for API key on initial load
  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        try {
          if (!(await window.aistudio.hasSelectedApiKey())) {
            setShowApiKeyDialog(true);
          }
        } catch (error) {
          console.warn('aistudio check failed', error);
          setShowApiKeyDialog(true);
        }
      }
    };
    checkApiKey();
  }, []);

  const handleSearch = useCallback(async (cityName: string) => {
    if (window.aistudio) {
      if (!(await window.aistudio.hasSelectedApiKey())) {
        setShowApiKeyDialog(true);
        return;
      }
    }

    setAppState(AppState.FETCHING_WEATHER);
    setErrorMessage(null);
    setVideoUrl(null);
    setSummary(null);
    setLocation(null);

    try {
      // Step 1: Geocoding
      const geoData = await getCoordinates(cityName);
      setLocation(geoData);

      // Step 2: Weather Data
      const weatherData = await getWeatherForecast(geoData.latitude, geoData.longitude);
      setWeather(weatherData);

      // Step 3: AI Summary
      setAppState(AppState.GENERATING_SUMMARY);
      const textSummary = await generateWeatherSummary({
        city: geoData.name,
        country: geoData.country,
        lat: geoData.latitude,
        lon: geoData.longitude,
        daily: weatherData.daily
      });
      setSummary(textSummary);

      // Step 4: Video Generation
      setAppState(AppState.GENERATING_VIDEO);
      const {objectUrl} = await generateReporterVideo(geoData.name, textSummary);
      setVideoUrl(objectUrl);

      setAppState(AppState.SUCCESS);
    } catch (error) {
      console.error('Flow failed:', error);
      const msg = error instanceof Error ? error.message : 'An unknown error occurred.';
      setErrorMessage(msg);
      setAppState(AppState.ERROR);
    }
  }, []);

  const handleApiKeyDialogContinue = async () => {
    setShowApiKeyDialog(false);
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setVideoUrl(null);
    setSummary(null);
    setLocation(null);
    setWeather(null);
    setErrorMessage(null);
  };

  const getStatusText = () => {
    switch (appState) {
      case AppState.FETCHING_WEATHER: return "Fetching Forecast...";
      case AppState.GENERATING_SUMMARY: return "Analyzing Data...";
      case AppState.GENERATING_VIDEO: return "Producing Video Report...";
      default: return "Loading...";
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {showApiKeyDialog && (
        <ApiKeyDialog onContinue={handleApiKeyDialogContinue} />
      )}

      {/* Header */}
      <header className="py-8 px-6 border-b border-gray-800 bg-[#0f0f0f]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <CloudRain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              WeatherForecastee
            </h1>
          </div>
          {appState !== AppState.IDLE && (
             <button onClick={handleReset} className="text-sm text-gray-400 hover:text-white transition-colors">
               Check another city
             </button>
          )}
        </div>
      </header>

      <main className="flex-grow w-full max-w-6xl mx-auto p-6 flex flex-col">
        {/* Search State */}
        {appState === AppState.IDLE && (
          <div className="flex-grow flex flex-col items-center justify-center -mt-20 animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent pb-2">
                Cinematic Weather Reports
              </h2>
              <p className="text-xl text-gray-400 max-w-xl mx-auto">
                Get a professional 7-day forecast video for any city in seconds.
              </p>
            </div>
            <WeatherForm onSearch={handleSearch} isLoading={false} />
          </div>
        )}

        {/* Processing State */}
        {(appState === AppState.FETCHING_WEATHER || appState === AppState.GENERATING_SUMMARY || appState === AppState.GENERATING_VIDEO) && (
           <div className="flex-grow flex flex-col items-center justify-center animate-in fade-in duration-700">
             <LoadingIndicator status={getStatusText()} />
             {/* Preview Summary while generating video */}
             {summary && (
               <div className="mt-8 max-w-2xl w-full bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 shadow-2xl opacity-80">
                  <div className="flex items-center gap-2 mb-4 text-indigo-400">
                    <Thermometer className="w-5 h-5" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Forecast Script Ready</span>
                  </div>
                  <div className="text-gray-300 text-sm leading-relaxed line-clamp-4 italic">
                    "{summary}"
                  </div>
               </div>
             )}
           </div>
        )}

        {/* Success State */}
        {appState === AppState.SUCCESS && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-10 duration-700">
             {/* Left Column: Video */}
             <div className="flex flex-col gap-6">
                <div className="bg-gray-800/30 rounded-3xl overflow-hidden border border-gray-700/50 shadow-2xl ring-1 ring-white/10">
                   {videoUrl ? (
                     <VideoResult
                       videoUrl={videoUrl}
                       onRetry={() => {}} // No retry needed in this flow usually
                       onNewVideo={handleReset}
                       onExtend={() => {}}
                       canExtend={false}
                     />
                   ) : (
                     <div className="aspect-video flex items-center justify-center text-gray-500">Video Unavailable</div>
                   )}
                </div>
             </div>

             {/* Right Column: Details */}
             <div className="flex flex-col gap-6">
                <div className="bg-[#161616] rounded-3xl p-8 border border-gray-800 shadow-xl">
                  <div className="flex items-baseline justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-1">{location?.name}</h2>
                      <p className="text-gray-400">{location?.country}</p>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-full">
                       <Wind className="w-4 h-4" />
                       <span className="text-sm font-medium">Veo Report</span>
                    </div>
                  </div>

                  <div className="prose prose-invert prose-indigo max-w-none">
                     <div className="space-y-4 text-gray-300 leading-relaxed whitespace-pre-line">
                       {summary}
                     </div>
                  </div>
                </div>
             </div>
          </div>
        )}

        {/* Error State */}
        {appState === AppState.ERROR && (
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center bg-red-900/20 border border-red-500/50 p-10 rounded-2xl max-w-md backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-red-400 mb-4">Forecast Failed</h2>
              <p className="text-red-200 mb-8">{errorMessage}</p>
              <button
                onClick={handleReset}
                className="px-8 py-3 bg-white text-red-900 font-bold rounded-lg hover:bg-gray-200 transition-colors shadow-lg">
                Try Again
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
