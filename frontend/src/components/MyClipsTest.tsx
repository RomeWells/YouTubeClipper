
import React, { useState, useEffect } from 'react';
import { UploadCloud, Clock } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

interface Clip {
  id: number;
  timestamp: string;
  startTime: string;
  endTime: string;
  suggestedTitle: string;
  hook: string;
  reason: string;
  clipPath?: string; // Optional, for testing purposes
}

const mockAnalysisResults: Clip[] = [
  {
    id: 1,
    timestamp: "0:15",
    startTime: "0:10",
    endTime: "0:20",
    suggestedTitle: "Cat doing a backflip!",
    hook: "Watch this cat defy gravity!",
    reason: "Cats are popular, and backflips are unexpected.",
    clipPath: "/videos/extracted/mock_cat_clip.mp4", // Mock path
  },
  {
    id: 2,
    timestamp: "1:30",
    startTime: "1:25",
    endTime: "1:35",
    suggestedTitle: "Dog talking like a human!",
    hook: "You won't believe what this dog says!",
    reason: "Talking animals are always a hit.",
    clipPath: "/videos/extracted/mock_dog_clip.mp4", // Mock path
  },
  {
    id: 3,
    timestamp: "2:45",
    startTime: "2:40",
    endTime: "2:50",
    suggestedTitle: "Baby's hilarious reaction to lemon!",
    hook: "Sour face, sweet laughs!",
    reason: "Babies' reactions are universally funny.",
    clipPath: "/videos/extracted/mock_baby_clip.mp4", // Mock path
  },
];

const MyClipsTest: React.FC = () => {
  const [selectedClips, setSelectedClips] = useState<Clip[]>([]);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 2000); // Hide toast after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleAddClip = (clip: Clip) => {
    setSelectedClips((prevClips) => [...prevClips, clip]);
    setShowToast(true);
    // In a real scenario, play ASMR sound here
  };

  const handleRemoveClip = (indexToRemove: number) => {
    setSelectedClips((prevClips) => prevClips.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-5xl font-extrabold mb-10 text-center text-purple-400">My Clips Test Environment</h1>

      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-blue-300">Available Viral Moments (Mock)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockAnalysisResults.map((moment) => (
            <div key={moment.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-semibold mb-2 text-green-300">{moment.suggestedTitle}</h3>
                <p className="text-gray-400 text-sm flex items-center mt-1">
                  <Clock size={16} className="mr-2 text-blue-400" /> {moment.startTime} - {moment.endTime}
                </p>
                <p className="text-gray-300 my-3 ml-1"><strong>Hook:</strong> "{moment.hook}"</p>
                <p className="text-gray-400 ml-1"><strong>Reason:</strong> {moment.reason}</p>
              </div>
              <button
                onClick={() => handleAddClip(moment)}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-md"
              >
                Select Clip
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <header className="mb-8">
          <h2 className="text-4xl font-bold mb-2 text-purple-300">My Viral Clips (Selected)</h2>
          <p className="text-gray-400">Review and manage your selected clips before posting.</p>
        </header>

        {selectedClips.length === 0 ? (
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center text-gray-400 shadow-inner">
            <p className="text-lg">No clips selected yet. Select from the "Available Viral Moments" above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedClips.map((clip, index) => (
              <div key={index} className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-semibold text-yellow-300">{clip.suggestedTitle}</h4>
                    <p className="text-gray-400 text-sm flex items-center mt-1">
                      <Clock size={14} className="mr-2 text-blue-400" /> {clip.startTime} - {clip.endTime}
                    </p>
                    <p className="text-gray-300 my-3 ml-1"><strong>Hook:</strong> "{clip.hook}"</p>
                    <p className="text-gray-400 ml-1"><strong>Reason:</strong> {clip.reason}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveClip(index)}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-lg transition-all shadow-sm"
                  >
                    X
                  </button>
                </div>
                {clip.clipPath && (
                  <VideoPlayer src={`http://localhost:3001${clip.clipPath}`} />
                )}
              </div>
          ))}
        </div>
      )}

      <div className="mt-10 flex justify-end space-x-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center shadow-lg"
          disabled={selectedClips.length === 0}
        >
          <Clock size={18} className="mr-2" />
          Schedule Post
        </button>
        <button
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center shadow-lg"
          disabled={selectedClips.length === 0}
        >
          <UploadCloud size={18} className="mr-2" />
          Post Now
        </button>
      </div>
    </section>

      {showToast && (
        <div className="fixed bottom-5 right-5 bg-green-600 text-white p-4 rounded-lg shadow-lg animate-fade-in-out">
          Clip added to My Clips!
        </div>
      )}
    </div>
  );
};

export default MyClipsTest;
