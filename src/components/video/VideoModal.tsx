import React, { useState, useEffect } from 'react';
import ProtectedLessonPlayer from './ProtectedLessonPlayer';

interface VideoModalProps {
  lessonId: string;
  lessonTitle: string;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ lessonId, lessonTitle, onClose }) => {
  const [screenBlurred, setScreenBlurred] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        setScreenBlurred(true);
        setTimeout(() => setScreenBlurred(false), 3000);
      }
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c' || e.key === 'J' || e.key === 'j')) ||
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5'))
      ) {
        e.preventDefault();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setScreenBlurred(true);
      } else {
        setScreenBlurred(false);
      }
    };

    const handleWindowBlur = () => setScreenBlurred(true);
    const handleWindowFocus = () => setScreenBlurred(false);

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
  }, []);

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

        <div
          style={{
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

          <ProtectedLessonPlayer lessonId={lessonId} />
        </div>
      </div>
    </div>
  );
};
