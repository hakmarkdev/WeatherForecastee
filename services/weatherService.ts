/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GeoResult, WeatherData } from "../types";

const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_API = 'https://api.open-meteo.com/v1/forecast';

export const getCoordinates = async (cityName: string): Promise<GeoResult> => {
  const url = `${GEOCODING_API}?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch location data');
  }
  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`Location "${cityName}" not found.`);
  }
  return data.results[0];
};

export const getWeatherForecast = async (lat: number, lon: number): Promise<WeatherData> => {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
      'snowfall_sum'
    ].join(','),
    timezone: 'auto'
  });

  const response = await fetch(`${FORECAST_API}?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch weather forecast');
  }
  return await response.json();
};
