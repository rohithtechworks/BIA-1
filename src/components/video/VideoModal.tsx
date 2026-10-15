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
  const [screenBlurred, setScreenBlurred] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    fetchVideoAuth();

    // Prevent screen capture shortcuts & devtools
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        triggerBlurNotice();
      }
      // F12 or DevTools shortcuts
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c' || e.key === 'J' || e.key === 'j')) ||
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5'))
      ) {
        e.preventDefault();
      }
    };

    // Pause & blur video on window blur / tab switch / screen recorder overlay activation
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (videoRef.current) videoRef.current.pause();
        setScreenBlurred(true);
      } else {
        setScreenBlurred(false);
      }
    };

    const handleWindowBlur = () => {
      if (videoRef.current) videoRef.current.pause();
      setScreenBlurred(true);
    };

    const handleWindowFocus = () => {
      setScreenBlurred(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [lessonId]);

  const triggerBlurNotice = () => {
    setScreenBlurred(true);
    if (videoRef.current) videoRef.current.pause();
    setTimeout(() => setScreenBlurred(false), 3000);
  };

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
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ background: 'rgba(0,0,0,0.92)', zIndex: 2000 }}>
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
          position: 'relative',
          userSelect: 'none'
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
          <div
            className="video-player-container"
            style={{
              margin: 0,
              position: 'relative',
              filter: screenBlurred ? 'blur(20px)' : 'none',
              transition: 'filter 0.2s ease'
            }}
          >
            {screenBlurred && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.85)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 30,
                  fontWeight: 'bold',
                  fontSize: '16px',
                  textAlign: 'center',
                  padding: '20px'
                }}
              >
                Playback Paused (Protected Content)
              </div>
            )}

            <video
              ref={videoRef}
              className="video-element"
              controls
              autoPlay
              playsInline
              preload="metadata"
              controlsList="nodownload noplaybackrate"
              disablePictureInPicture
              src={(videoAuth as unknown as { url?: string }).url || videoAuth.signedUrl || `/api/video/stream?lessonId=${lessonId}&token=${videoAuth.streamToken}`}
              onLoadedData={handleVideoLoaded}
              onContextMenu={e => e.preventDefault()}
            >
              Your browser does not support HTML5 video playback.
            </video>

            {/* Student watermark overlay */}
            <div className="watermark-overlay" style={{ background: 'rgba(0,0,0,0.65)', color: '#fca5a5', fontWeight: 'bold' }}>
              PROTECTED | {videoAuth.watermarkText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
