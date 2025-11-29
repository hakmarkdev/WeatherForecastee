/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { ArrowRightIcon } from './icons';

interface WeatherFormProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
}

const WeatherForm: React.FC<WeatherFormProps> = ({ onSearch, isLoading }) => {
  const [city, setCity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name (e.g. Berlin, Tokyo, New York)"
          disabled={isLoading}
          className="w-full bg-[#1f1f1f] border border-gray-600 rounded-full py-4 pl-6 pr-14 text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 transition-all shadow-xl"
        />
        <button
          type="submit"
          disabled={!city.trim() || isLoading}
          className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 rounded-full flex items-center justify-center transition-colors"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <ArrowRightIcon className="w-6 h-6 text-white" />
          )}
        </button>
      </form>
      <p className="text-center text-gray-500 text-sm mt-4">
        Powered by Open-Meteo, Gemini 2.0 Flash & Veo 3.1
      </p>
    </div>
  );
};

export default WeatherForm;
