import React, { useState } from 'react';
import { Youtube, Film, BarChart2, Settings, UploadCloud, Bot, ThumbsUp, Sparkles, Clock, Search } from 'lucide-react';

// Mock data for viral moments - replace with API data
const mockViralMoments = [
  { timestamp: "1:45", viralScore: 96, hook: "This is the single most important moment...", reason: "Strong emotional peak, very shareable.", category: "Emotional Peak", suggestedTitle: "The Most Important Moment in History!", suggestedDescription: "#AI #Future #Tech" },
  { timestamp: "3:12", viralScore: 91, hook: "A secret trick nobody knows...", reason: "High curiosity gap, valuable info.", category: "Value Bomb", suggestedTitle: "The Secret Trick You Need to Know", suggestedDescription: "#Secret #LifeHack #Viral" },
  { timestamp: "5:50", viralScore: 88, hook: "An impossible clutch moment...", reason: "Visually exciting, high replay value.", category: "Plot Twist", suggestedTitle: "You Won't Believe This Clutch!", suggestedDescription: "#Gaming #Impossible #Wow" },
];

const App = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('analyze');

  const handleAnalyze = async () => {
    if (!videoUrl) {
      setError('Please enter a YouTube URL.');
      return;
    }
    setIsLoading(true);
    setError('');
    setAnalysisResult(null);

    try {
      const response = await fetch('http://localhost:3001/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to analyze video.');
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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
          <nav className="space-y-4">
            <a href="#" onClick={() => setActiveTab('analyze')} className={`flex items-center p-3 rounded-lg transition-all ${activeTab === 'analyze' ? 'bg-purple-600' : 'hover:bg-gray-800'}`}>
              <Search size={20} />
              <span className="ml-4">Analyze</span>
            </a>
            <a href="#" onClick={() => setActiveTab('clips')} className={`flex items-center p-3 rounded-lg transition-all ${activeTab === 'clips' ? 'bg-purple-600' : 'hover:bg-gray-800'}`}>
              <Film size={20} />
              <span className="ml-4">My Clips</span>
            </a>
            <a href="#" onClick={() => setActiveTab('tracking')} className={`flex items-center p-3 rounded-lg transition-all ${activeTab === 'tracking' ? 'bg-purple-600' : 'hover:bg-gray-800'}`}>
              <BarChart2 size={20} />
              <span className="ml-4">Tracking</span>
            </a>
            <a href="#" onClick={() => setActiveTab('settings')} className={`flex items-center p-3 rounded-lg transition-all ${activeTab === 'settings' ? 'bg-purple-600' : 'hover:bg-gray-800'}`}>
              <Settings size={20} />
              <span className="ml-4">Settings</span>
            </a>
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
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center"
                >
                  {isLoading ? (
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
                    {(analysisResult.viralMoments || mockViralMoments).map((moment, index) => (
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
                                  <Clock size={14} className="mr-2" /> Timestamp: {moment.timestamp}
                                  <span className="mx-2">|</span>
                                  <ThumbsUp size={14} className="mr-2" /> Category: {moment.category}
                                </p>
                              </div>
                            </div>
                            <p className="text-gray-300 my-3 ml-1"><strong>Hook:</strong> "{moment.hook}"</p>
                            <p className="text-gray-400 ml-1"><strong>Reason:</strong> {moment.reason}</p>
                          </div>
                          <button className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-all">
                            Select Clip
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Other tabs can be implemented here */}
        </main>
      </div>
    </div>
  );
};

export default App;
