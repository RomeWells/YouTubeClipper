import React from 'react';

interface VideoPlayerProps {
  src: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
  return (
    <div className="bg-black rounded-lg overflow-hidden" style={{ maxWidth: '300px', maxHeight: '533px' }}>
      <video controls style={{ width: '100%', height: 'auto', maxHeight: '533px' }}>
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
