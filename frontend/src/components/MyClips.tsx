import React, { useState } from 'react';
import { UploadCloud, Clock } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import ScheduleModal from './ScheduleModal';

interface Clip {
  timestamp: string;
  startTime: string;
  endTime: string;
  suggestedTitle: string;
  hook: string;
  reason: string;
  viralScore: number;
  category: string;
  clipPath?: string;
  suggestedDescription?: string; // Add suggestedDescription
  tags?: string[]; // Add tags
}

interface MyClipsProps {
  selectedClips: Clip[];
  onRemoveClip: (index: number) => void;
}

const MyClips: React.FC<MyClipsProps> = ({ selectedClips, onRemoveClip }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [clipToSchedule, setClipToSchedule] = useState<Clip | null>(null);

  const handlePostNow = async (clip: Clip) => {
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    if (!clip.clipPath) {
      setUploadError('Clip path is missing. Cannot upload.');
      setUploading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/youtube/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clipPath: clip.clipPath,
          title: clip.suggestedTitle,
          description: clip.suggestedDescription || '',
          tags: clip.tags || [],
          privacyStatus: 'public',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload video.');
      }

      const data = await response.json();
      setUploadSuccess(`Video uploaded! YouTube ID: ${data.videoId}`);
      // Optionally remove the clip from selectedClips after successful upload
      // onRemoveClip(selectedClips.indexOf(clip));
    } catch (error: any) {
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSchedulePost = (clip: Clip) => {
    setClipToSchedule(clip);
    setIsScheduleModalOpen(true);
  };

  const handleScheduleConfirm = async (publishAt: Date) => {
    if (!clipToSchedule || !clipToSchedule.clipPath) {
      setUploadError('Clip data missing for scheduling.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    setIsScheduleModalOpen(false);

    try {
      // First, upload as private
      const uploadResponse = await fetch('http://localhost:3001/api/youtube/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clipPath: clipToSchedule.clipPath,
          title: clipToSchedule.suggestedTitle,
          description: clipToSchedule.suggestedDescription || '',
          tags: clipToSchedule.tags || [],
          privacyStatus: 'private',
        }),
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload video for scheduling.');
      }

      const uploadData = await uploadResponse.json();
      const videoId = uploadData.videoId;

      // Then, schedule the publish time
      const scheduleResponse = await fetch('http://localhost:3001/api/youtube/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId,
          publishAt: publishAt.toISOString(),
        }),
      });

      if (!scheduleResponse.ok) {
        const errorData = await scheduleResponse.json();
        throw new Error(errorData.error || 'Failed to schedule video.');
      }

      setUploadSuccess(`Video uploaded privately and scheduled for ${publishAt.toLocaleString()}. YouTube ID: ${videoId}`);
      // Optionally remove the clip from selectedClips after successful scheduling
      // onRemoveClip(selectedClips.indexOf(clipToSchedule));
    } catch (error: any) {
      setUploadError(error.message);
    } finally {
      setUploading(false);
      setClipToSchedule(null);
    }
  };

  return (
    <div>
      <header className="mb-8">
        <h2 className="text-4xl font-bold mb-2">My Viral Clips</h2>
        <p className="text-gray-400">Review and manage your selected clips before posting.</p>
      </header>

      {uploading && <div className="bg-blue-600 p-3 rounded-lg text-white text-center mb-4">Processing video...</div>}
      {uploadError && <div className="bg-red-600 p-3 rounded-lg text-white text-center mb-4">Error: {uploadError}</div>}
      {uploadSuccess && <div className="bg-green-600 p-3 rounded-lg text-white text-center mb-4">Success: {uploadSuccess}</div>}

      {selectedClips.length === 0 ? (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center text-gray-400">
          <p className="text-lg">No clips selected yet. Go to the "Analyze" tab to find viral moments!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {selectedClips.map((clip, index) => (
            <div key={index} className="bg-gray-800 p-5 rounded-xl border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-semibold">{clip.suggestedTitle}</h4>
                  <p className="text-gray-400 text-sm flex items-center mt-1">
                    <Clock size={14} className="mr-2" /> {clip.startTime} - {clip.endTime}
                  </p>
                  <p className="text-gray-300 my-3 ml-1"><strong>Hook:</strong> "{clip.hook}"</p>
                  <p className="text-gray-400 ml-1"><strong>Reason:</strong> {clip.reason}</p>
                </div>
                <button
                  onClick={() => onRemoveClip(index)}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-lg transition-all"
                >
                  X
                </button>
              </div>
              {clip.clipPath && <VideoPlayer src={`http://localhost:3001${clip.clipPath}`} />}
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => handleSchedulePost(clip)}
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center"
                >
                  <Clock size={18} className="mr-2" />
                  Schedule Post
                </button>
                <button
                  onClick={() => handlePostNow(clip)}
                  disabled={uploading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center"
                >
                  <UploadCloud size={18} className="mr-2" />
                  {uploading ? 'Uploading...' : 'Post Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSchedule={handleScheduleConfirm}
        loading={uploading}
        error={uploadError}
      />
    </div>
  );
};

export default MyClips;