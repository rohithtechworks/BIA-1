import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { VideoAuthResponse } from '../../types';

interface VideoModalProps {
  lessonId: string;
  lessonTitle: string;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ lessonId, lessonTitle, onClose }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [videoAuth, setVideoAuth] = useState<VideoAuthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
      setError((err as Error).message || 'Video unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Auto-play policy handling
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ background: 'rgba(0,0,0,0.9)', zIndex: 2000 }}>
      <div
        className="modal-card"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '900px',
          width: '95%',
          padding: '16px',
          background: '#000',
          border: '2px solid var(--gold)',
          borderRadius: '16px',
          position: 'relative'
        }}
      >
        {/* Header bar with title and close button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
            {lessonTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#ad1035',
              color: '#fff',
              border: 0,
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#3b82f6', fontSize: '18px' }}>
            Loading secure video...
          </div>
        ) : error || !videoAuth ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#f87171', fontSize: '16px' }}>
            <strong>Video Unavailable</strong>
            <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#ccc' }}>
              {error || 'Video file not found in storage.'}
            </p>
          </div>
        ) : (
          <div className="video-player-container" style={{ margin: 0 }}>
            <video
              ref={videoRef}
              className="video-element"
              controls
              autoPlay
              playsInline
              preload="metadata"
              controlsList="nodownload"
              src={(videoAuth as unknown as { url?: string }).url || videoAuth.signedUrl || `/api/video/stream?lessonId=${lessonId}&token=${videoAuth.streamToken}`}
              onLoadedData={handleVideoLoaded}
              onContextMenu={e => e.preventDefault()}
            >
              Your browser does not support HTML5 video playback.
            </video>

            {/* Student watermark overlay */}
            <div className="watermark-overlay">
              Home Spoken Centre | {videoAuth.watermarkText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
