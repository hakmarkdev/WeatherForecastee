/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Consulting the clouds...",
  "Gathering atmospheric pressure data...",
  "Interviewing the wind...",
  "Rendering the digital reporter...",
  "Calculating rain probabilities...",
  "Polishing the camera lens...",
  "Checking wind gusts...",
  "Synthesizing the forecast...",
  "Generating cinematic weather report...",
  "Adjusting studio lighting...",
  "Preparing the 7-day outlook...",
  "Applying meteorology magic...",
];

const LoadingIndicator: React.FC<{status: string}> = ({ status }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-indigo-500/20 rounded-full blur-xl"></div>
        </div>
      </div>
      <h2 className="text-xl font-semibold mt-6 text-indigo-300 uppercase tracking-wider">{status}</h2>
      <p className="mt-2 text-gray-400 text-center max-w-xs animate-pulse">
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
};

export default LoadingIndicator;
