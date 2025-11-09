import { useState, useEffect } from 'react';
import { Youtube, Film, BarChart2, Settings, Bot, ThumbsUp, Sparkles, Clock, Mic } from 'lucide-react';
import MyClips from './components/MyClips';
import SalesPage from './components/SalesPage';
import MyClipsTest from './components/MyClipsTest';
import WhisperTest from './components/WhisperTest'; // Import WhisperTest

interface Clip {
  timestamp: string;
  startTime: string;
  endTime: string;
  suggestedTitle: string;
  hook: string;
  reason: string;
  viralScore: number;
  category: string;
  clipPath?: string; // Optional, will be added after extraction
}

interface AnalysisResult {
  viralMoments: Clip[];
}



const App = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('analyze');
  const [selectedClips, setSelectedClips] = useState<Clip[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [extractingClip, setExtractingClip] = useState(false);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 2000); // Hide toast after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleAddClip = async (clip: Clip) => {
    if (!videoUrl) {
      setError('Video URL is missing.');
      return;
    }

    setExtractingClip(true);
    setError('');

    try {
      // Extract video ID from URL - supports multiple YouTube URL formats
      let videoId = '';

      // Try different URL patterns
      if (videoUrl.includes('youtube.com/watch?v=')) {
        videoId = videoUrl.split('v=')[1]?.split('&')[0] || '';
      } else if (videoUrl.includes('youtu.be/')) {
        videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0] || '';
      } else if (videoUrl.includes('youtube.com/live/')) {
        videoId = videoUrl.split('/live/')[1]?.split('?')[0] || '';
      }

      if (!videoId) {
        throw new Error(`Invalid YouTube URL format. URL: ${videoUrl}`);
      }

      // Call the extract-clip endpoint
      const response = await fetch('http://localhost:3001/api/youtube/extract-clip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl,
          videoId,
          startTime: clip.startTime,
          endTime: clip.endTime,
          clipName: `${videoId}_${clip.startTime.replace(/:/g, '-')}_to_${clip.endTime.replace(/:/g, '-')}.mp4`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract clip.');
      }

      const data = await response.json();

      // Add the clip with the clipPath to selectedClips
      const clipWithPath = { ...clip, clipPath: data.clipUrl };
      setSelectedClips((prevClips) => [...prevClips, clipWithPath]);
      setShowToast(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to extract clip.');
      console.error(err);
    } finally {
      setExtractingClip(false);
    }
  };

  const handleAnalyze = async () => {
    if (!videoUrl) {
      setError('Please enter a YouTube URL.');
      return;
    }
    setLoading(true);
    setError('');
    setAnalysisResult(null);

    try {
      const response = await fetch('http://localhost:3001/api/gemini/transcribe-and-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze video.');
      }

      const data = await response.json();
      setAnalysisResult(data); // data will now contain transcript, source, and viralMoments
      // Optionally, you might want to display the source (YouTube/Whisper) in the UI
      // For now, we'll just update analysisResult
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveClip = (indexToRemove: number) => {
    setSelectedClips((prevClips) => prevClips.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-950 p-6 border-r border-gray-800">
          <div className="flex items-center mb-10">
            <Bot size={32} className="text-purple-400" />
            <h1 className="text-2xl font-bold ml-3">Viral Clipper</h1>
          </div>
                      <nav className="mt-10">
              <ul>
                <li>
                  <button
                    className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-all ${
                      activeTab === 'analyze' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'
                    }`}
                    onClick={() => setActiveTab('analyze')}
                  >
                    <BarChart2 size={20} className="mr-3" />
                    Analyze
                  </button>
                </li>
                <li className="mt-2">
                  <button
                    className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-all ${
                      activeTab === 'clips' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'
                    } ${showToast ? 'animate-pulse bg-green-600' : ''}`}
                    onClick={() => setActiveTab('clips')}
                  >
                    <Film size={20} className="mr-3" />
                    My Clips
                  </button>
                </li>
                <li className="mt-2">
                  <button
                    className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-all ${
                      activeTab === 'testClips' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'
                    }`}
                    onClick={() => setActiveTab('testClips')}
                  >
                    <Bot size={20} className="mr-3" />
                    Test Clips
                  </button>
                </li>
                <li className="mt-2">
                  <button
                    className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-all ${
                      activeTab === 'whisperTest' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'
                    }`}
                    onClick={() => setActiveTab('whisperTest')}
                  >
                    <Mic size={20} className="mr-3" />
                    Whisper Test
                  </button>
                </li>
                <li className="mt-2">
                  <button
                    className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-all ${
                      activeTab === 'salesPage' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'
                    }`}
                    onClick={() => setActiveTab('salesPage')}
                  >
                    <ThumbsUp size={20} className="mr-3" />
                    Sales Page
                  </button>
                </li>
                <li className="mt-2">
                  <a
                    href="http://localhost:3001/api/youtube/auth"
                    className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-all text-gray-400 hover:bg-gray-800`}
                  >
                    <Youtube size={20} className="mr-3" />
                    Connect YouTube
                  </a>
                </li>
                <li className="mt-2">
                  <button
                    className={`w-full text-left py-3 px-4 rounded-lg flex items-center transition-all ${
                      activeTab === 'settings' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'
                    }`}
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings size={20} className="mr-3" />
                    Settings
                  </button>
                </li>
              </ul>
            </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-10">
          {activeTab === 'analyze' && (
            <div>
              <header className="mb-8">
                <h2 className="text-4xl font-bold mb-2">Analyze a YouTube Video</h2>
                <p className="text-gray-400">Paste a URL to let AI find the most viral moments for your Shorts.</p>
              </header>

              <div className="flex items-center bg-gray-800 border border-gray-700 rounded-xl p-2 mb-6">
                <Youtube size={24} className="text-gray-500 mx-3" />
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-transparent focus:outline-none text-lg"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Sparkles size={18} className="mr-2" />
                      Analyze Video
                    </>
                  )}
                </button>
              </div>

              {error && <div className="bg-red-900 border border-red-700 text-red-300 p-4 rounded-lg mb-6">{error}</div>}

              {analysisResult && (
                <div className="mt-10">
                  <h3 className="text-2xl font-bold mb-6">Top 5 Viral Moments</h3>
                  <div className="space-y-4">
                    {analysisResult.viralMoments.map((moment: Clip, index: number) => (
                      <div key={index} className="bg-gray-800 p-5 rounded-xl border border-gray-700">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center mb-3">
                              <div className={`font-bold text-2xl p-3 rounded-lg ${moment.viralScore > 90 ? 'bg-green-500/20 text-green-400' : moment.viralScore > 80 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                {moment.viralScore}
                              </div>
                              <div className="ml-4">
                                <h4 className="text-xl font-semibold">{moment.suggestedTitle}</h4>
                                <p className="text-gray-400 text-sm flex items-center mt-1">
                                  <Clock size={14} className="mr-2" /> {moment.startTime} - {moment.endTime}
                                  <span className="mx-2">|</span>
                                  <ThumbsUp size={14} className="mr-2" /> Category: {moment.category}
                                </p>
                              </div>
                            </div>
                            <p className="text-gray-300 my-3 ml-1"><strong>Hook:</strong> "{moment.hook}"</p>
                            <p className="text-gray-400 ml-1"><strong>Reason:</strong> {moment.reason}</p>
                          </div>
                          <button
                          onClick={() => handleAddClip(moment)}
                          disabled={extractingClip}
                          className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-all"
                        >
                          {extractingClip ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Extracting...
                            </div>
                          ) : (
                            'Extract Viral Clip'
                          )}
                        </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'clips' && (
            <MyClips selectedClips={selectedClips} onRemoveClip={handleRemoveClip} />
          )}
          {activeTab === 'testClips' && (
            <MyClipsTest />
          )}
          {activeTab === 'whisperTest' && (
            <WhisperTest />
          )}
          {activeTab === 'salesPage' && (
            <SalesPage />
          )}
        </main>
      </div>

      {showToast && (
        <div className="fixed bottom-5 right-5 bg-green-600 text-white p-4 rounded-lg shadow-lg animate-fade-in-out">
          Clip added to My Clips!
        </div>
      )}
    </div>
  );
};

export default App;
