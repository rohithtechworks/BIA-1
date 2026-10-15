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
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        triggerSecurityAlert('Screenshot attempt detected!');
      }
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
        setWarningMessage('Playback paused: Window hidden.');
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
    }, 3000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#000',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none'
      }}
      onContextMenu={e => e.preventDefault()}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          background: 'rgba(0,0,0,0.85)',
          borderBottom: '1px solid #222',
          zIndex: 10
        }}
      >
        <h2 style={{ color: '#fff', margin: 0, fontSize: '22px', fontWeight: 'bold', letterSpacing: '0.05em' }}>
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
            width: '42px',
            height: '42px',
            fontSize: '20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}
          title="Close Video"
        >
          ✕
        </button>
      </div>

      {/* Fullscreen Video Area */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          width: '100%',
          height: '100%',
          background: '#000',
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
              fontSize: '20px',
              textAlign: 'center',
              padding: '24px'
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️ PLAYBACK PAUSED</div>
            {warningMessage || 'Protected content'}
          </div>
        )}

        <ProtectedLessonPlayer lessonId={lessonId} />
      </div>
    </div>
  );
};
