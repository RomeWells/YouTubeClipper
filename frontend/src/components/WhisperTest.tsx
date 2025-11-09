import React, { useState } from 'react';
import { Clock } from 'lucide-react'; // Assuming lucide-react is installed for icons

// Define the Clip interface (similar to MyClips.tsx)
interface Clip {
  timestamp?: string;
  startTime: string;
  endTime: string;
  suggestedTitle: string;
  hook: string;
  reason: string;
  viralScore: number;
  category: string;
  clipPath?: string;
  suggestedDescription?: string;
  tags?: string[];
}

const WhisperTest: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');
  const [viralClips, setViralClips] = useState<Clip[]>([]); // New state for viral clips
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);

  const handleTranscribe = async () => {
    setLoading(true);
    setError(null);
    setTranscript('');
    setViralClips([]); // Clear previous clips
    setSource(null);

    try {
      // Change endpoint to the new transcribe-and-analyze endpoint
      const response = await fetch('/api/gemini/transcribe-and-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to transcribe video.');
      }

      setTranscript(data.transcript);
      setSource(data.source);
      setViralClips(data.viralMoments || []); // Store viral moments
    } catch (err: any) {
      setError(err.message);
      console.error('Whisper transcription error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Whisper Transcription & Viral Clip Finder</h2>
      <div className="mb-4">
        <label htmlFor="videoUrl" className="block text-gray-700 text-sm font-bold mb-2">
          YouTube Video URL:
        </label>
        <input
          type="text"
          id="videoUrl"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          disabled={loading}
        />
      </div>
      <button
        onClick={handleTranscribe}
        disabled={loading || !videoUrl}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Transcribe & Find Viral Clips'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {transcript && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="font-bold">Transcription Source: {source}</p>
          <h3 className="text-lg font-bold mb-2">Transcript:</h3>
          <p className="whitespace-pre-wrap text-gray-800">{transcript}</p>
        </div>
      )}

      {viralClips.length > 0 && (
        <div className="mt-8">
          <h3 className="text-2xl font-bold mb-4 text-gray-800">Suggested Viral Clips:</h3>
          <div className="space-y-4">
            {viralClips.map((clip, index) => (
              <div key={index} className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                <h4 className="text-xl font-semibold text-gray-800">{clip.suggestedTitle}</h4>
                <p className="text-gray-600 text-sm flex items-center mt-1">
                  <Clock size={14} className="mr-2" /> {clip.startTime} - {clip.endTime}
                </p>
                <p className="text-gray-700 my-2"><strong>Hook:</strong> "{clip.hook}"</p>
                <p className="text-gray-700"><strong>Reason:</strong> {clip.reason}</p>
                <p className="text-gray-700"><strong>Category:</strong> {clip.category}</p>
                <p className="text-gray-700"><strong>Viral Score:</strong> {clip.viralScore}</p>
                {/* Add buttons for "Extract Clip" or "Add to My Clips" later */}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WhisperTest;
