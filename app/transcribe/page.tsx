'use client';

import React, { Suspense } from 'react';
import TranscriptionTool from '../components/TranscriptionTool';

// A loading component to show while the transcription tool is loading
const TranscriptionLoading = () => (
  <div className="w-full p-12 flex justify-center">
    <div className="animate-pulse flex flex-col items-center">
      <div className="h-8 w-8 bg-blue-600 rounded-full mb-4"></div>
      <div className="h-4 bg-gray-700 rounded w-48 mb-2"></div>
      <div className="h-3 bg-gray-700 rounded w-32"></div>
    </div>
  </div>
);

export default function TranscribePage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6 text-white">YouTube Transcription Tool</h1>
      <p className="text-gray-400 mb-6">
        Easily transcribe any YouTube video and use the transcript for your content research.
        Just paste a YouTube URL and click Transcribe to get started.
      </p>
      
      {/* Wrap the component that uses useSearchParams in a Suspense boundary */}
      <Suspense fallback={<TranscriptionLoading />}>
        <TranscriptionTool />
      </Suspense>
      
      <div className="mt-8 bg-gray-900 rounded-lg shadow-md border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">How It Works</h2>
        <div className="space-y-4 text-gray-300">
          <p>
            This tool uses AI to generate transcripts from YouTube videos. Here's how to use it:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Paste a YouTube video URL in the input field above</li>
            <li>Click the "Transcribe" button</li>
            <li>Wait for the transcription to complete (this may take a minute for longer videos)</li>
            <li>View, copy, or download the transcript</li>
          </ol>
          <p className="mt-4 text-sm text-gray-400">
            Note: This tool works best with videos that have clear audio quality.
            Transcription accuracy may vary depending on the video's audio clarity,
            background noise, and speaker accents.
          </p>
        </div>
      </div>
    </div>
  );
} 