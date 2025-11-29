/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {
  GoogleGenAI,
  Video
} from '@google/genai';
import { VeoModel, WeatherSummaryRequest } from '../types';

export const generateWeatherSummary = async (data: WeatherSummaryRequest): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemPrompt = `You are a weather summarization assistant for the application "WeatherForecastee".
### Tech stack
- Typescript
- Genkit
- Vite
- ReactJS
- Shadcn
- Tailwind
Your task is to interpret a 7-day weather forecast from the Open-Meteo API and produce a concise, human-readable text summary that highlights temperature trends, precipitation, wind, and other key weather indicators. The summary should resemble short daily notes with natural language and local context.
### Input
- Location: ${data.city}, ${data.country}
- Forecast source: Open-Meteo API (7-day data)
- Units: °C, mm, km/h
The data will include:
- Temperature (max, min)
- Precipitation (mm)
- Snowfall (cm)
- Snow depth (cm)
- Wind speed and gusts (km/h)
- Relative humidity or dewpoint
- Apparent temperature
- Visibility (km)
- Weather code
- Cloud cover
- Precipitation probability
- Time zone localized values
### Output format
Generate natural language outputs following this structure:
Day 1: {weekday} {month} {day}
- {Short summary: e.g., Cool day with scattered showers, light morning frost.}
- {Key details: high X°C, low Y°C, precip Z mm (rain or snow type), gusts W km/h, visibility V km, conditions summary}.
Days 4-7 Summary (if requested):
- Summarize temperature range (e.g., highs 3–7°C)
- Mention precipitation trends (mm of rain/snow)
- Highlight important wind or visibility alerts
- End with an overall trend (e.g., colder midweek, improving by weekend)
### Style and tone
- Professional but friendly and readable.
- Write short, complete sentences.
- Emphasize weather impact (travel risk, frost, snow, visibility).
- Avoid unnecessary repetition or numeric overload.
- Always use local timezone wording (e.g., “evening frost,” “midday snow”).`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Using the provided Open-Meteo forecast data JSON, generate the 7-day forecast summary for ${data.city}, ${data.country}.\n\nForecast Data:\n${JSON.stringify(data.daily, null, 2)}`,
    config: {
      systemInstruction: systemPrompt,
    }
  });

  return response.text || "No summary available.";
};

export const generateReporterVideo = async (
  city: string,
  summary: string
): Promise<{objectUrl: string; blob: Blob; uri: string; video: Video}> => {
  const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

  // Construct the prompt based on the spec
  const prompt = `Professional TV reporter in modern studio delivers 7-day forecast for ${city}: ${summary.slice(0, 200)}..., cinematic, clear audio narration, 8-second clip`;

  console.log('Generating video with prompt:', prompt);

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-generate-preview', // Explicitly requested in spec
    prompt: prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9',
    },
  });

  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    console.log('...Generating...');
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  if (operation?.response) {
    const videos = operation.response.generatedVideos;

    if (!videos || videos.length === 0) {
      throw new Error('No videos were generated.');
    }

    const firstVideo = videos[0];
    if (!firstVideo?.video?.uri) {
      throw new Error('Generated video is missing a URI.');
    }
    const videoObject = firstVideo.video;
    const url = decodeURIComponent(videoObject.uri);

    // Append API key to fetch result
    const res = await fetch(`${url}&key=${process.env.API_KEY}`);

    if (!res.ok) {
      throw new Error(`Failed to fetch video: ${res.status} ${res.statusText}`);
    }

    const videoBlob = await res.blob();
    const objectUrl = URL.createObjectURL(videoBlob);

    return {objectUrl, blob: videoBlob, uri: url, video: videoObject};
  } else {
    throw new Error('No videos generated.');
  }
};
