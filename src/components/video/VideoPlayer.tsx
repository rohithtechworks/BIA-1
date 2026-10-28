import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { VideoAuthResponse } from '../../types';

interface VideoPlayerProps {
  lessonId: string;
  lessonTitle: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ lessonId }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [videoAuth, setVideoAuth] = useState<VideoAuthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVideoAuth();
  }, [lessonId]);

  const fetchVideoAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.authorizeVideo(lessonId);
      setVideoAuth(data);
    } catch (err: unknown) {
      setError((err as Error).message || 'Video unavailable or authorization denied.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="video-status-box" style={{ background: '#eff6ff', borderColor: '#3b82f6', color: '#1e40af' }}>
        Loading secure video player authorization...
      </div>
    );
  }

  if (error || !videoAuth) {
    return (
      <div className="video-status-box">
        <strong>Video Unavailable</strong>
        <p style={{ margin: '6px 0 0', fontSize: '14px' }}>
          {error || 'No video file has been mapped to this lesson yet.'}
        </p>
      </div>
    );
  }

  const videoSrc = videoAuth.signedUrl || `/api/video/stream?lessonId=${lessonId}&token=${videoAuth.streamToken}`;

  return (
    <div className="video-player-container" onContextMenu={(e) => e.preventDefault()}>
      <video
        className="video-element"
        controls
        controlsList="nodownload"
        playsInline
        src={videoSrc}
      >
        Your browser does not support HTML5 video playback.
      </video>

      {/* Subtleuser watermark overlay */}
      <div className="watermark-overlay">
        Home Spoken Centre | {videoAuth.watermarkText}
      </div>
    </div>
  );
};
