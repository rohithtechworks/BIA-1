import React, { useState, useEffect } from 'react';
import ProtectedLessonPlayer from './ProtectedLessonPlayer';

interface VideoModalProps {
  lessonId: string;
  lessonTitle: string;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ lessonId, lessonTitle, onClose }) => {
  const [screenBlurred, setScreenBlurred] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        triggerSecurityAlert('Screenshot attempt detected! This activity is monitored and logged.');
      }
      // DevTools & recording shortcuts
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c' || e.key === 'J' || e.key === 'j')) ||
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) ||
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.key === 'p')
      ) {
        e.preventDefault();
        triggerSecurityAlert('Restricted action blocked.');
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setScreenBlurred(true);
        setWarningMessage('Playback paused: Window hidden or screen recorder active.');
      } else {
        setScreenBlurred(false);
        setWarningMessage(null);
      }
    };

    const handleWindowBlur = () => {
      setScreenBlurred(true);
      setWarningMessage('Playback paused: Window focus lost.');
    };

    const handleWindowFocus = () => {
      setScreenBlurred(false);
      setWarningMessage(null);
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
  }, []);

  const triggerSecurityAlert = (msg: string) => {
    setScreenBlurred(true);
    setWarningMessage(msg);
    setTimeout(() => {
      setScreenBlurred(false);
      setWarningMessage(null);
    }, 4000);
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ background: 'rgba(0,0,0,0.95)', zIndex: 2000 }}
      onContextMenu={e => e.preventDefault()}
    >
      <div
        className="modal-card"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '920px',
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
            filter: screenBlurred ? 'blur(30px)' : 'none',
            transition: 'filter 0.15s ease'
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
                background: '#000',
                color: '#f87171',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 40,
                fontWeight: 'bold',
                fontSize: '18px',
                textAlign: 'center',
                padding: '24px',
                border: '2px dashed #f87171'
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️ SECURITY PROTECTION</div>
              {warningMessage || 'Screen capture and recording are strictly prohibited.'}
            </div>
          )}

          <ProtectedLessonPlayer lessonId={lessonId} />
        </div>
      </div>
    </div>
  );
};
