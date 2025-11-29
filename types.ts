/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {Video} from '@google/genai';

export enum AppState {
  IDLE,
  FETCHING_WEATHER,
  GENERATING_SUMMARY,
  GENERATING_VIDEO,
  SUCCESS,
  ERROR,
}

export enum VeoModel {
  VEO_FAST = 'veo-3.1-fast-generate-preview',
  VEO = 'veo-3.1-generate-preview',
}

export enum Resolution {
  P720 = '720p',
  P1080 = '1080p',
}

// Weather Types
export interface GeoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
}

export interface DailyForecast {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  wind_gusts_10m_max: number[];
  snowfall_sum: number[];
}

export interface WeatherData {
  latitude: number;
  longitude: number;
  daily: DailyForecast;
  daily_units: any;
}

export interface WeatherSummaryRequest {
  city: string;
  country: string;
  lat: number;
  lon: number;
  daily: DailyForecast;
}
