import React from 'react';

export const AcademyHeader: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', marginBottom: '28px', overflowX: 'hidden' }}>
      {/* Top Container: BRILLIANT IAS ACADEMY */}
      <div
        style={{
          background: '#103665',
          color: '#fff',
          padding: '16px 20px',
          borderRadius: '16px',
          boxShadow: '0 4px 14px rgba(16,54,101,0.3)',
          border: '1px solid rgba(255,255,255,0.2)',
          maxWidth: '800px',
          margin: '0 auto 14px auto'
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 'clamp(20px, 3.8vw, 36px)',
            fontWeight: 900,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textAlign: 'center',
            color: '#fff',
            lineHeight: 1.15,
            textShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}
        >
          BRILLIANT IAS ACADEMY
        </h2>
      </div>

      {/* Middle Container: Career Institution (Red Background) */}
      <div
        style={{
          background: '#ad1035',
          color: '#fff',
          padding: '14px 20px',
          borderRadius: '16px',
          boxShadow: '0 4px 14px rgba(173,16,53,0.3)',
          border: '1px solid rgba(255,255,255,0.25)',
          maxWidth: '800px',
          margin: '0 auto 14px auto'
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 'clamp(16px, 3vw, 26px)',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            textAlign: 'center',
            color: '#fff',
            lineHeight: 1.15,
            textShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}
        >
          --- Career Institution ---
        </h3>
      </div>

      {/* Bottom Container: Existing Home Spoken Centre */}
      <div
        style={{
          background: '#ad1035',
          color: '#fff',
          padding: '20px 20px',
          borderRadius: '20px',
          boxShadow: '0 6px 18px rgba(173,16,53,0.3)',
          border: '1px solid rgba(255,255,255,0.25)',
          maxWidth: '800px',
          margin: '0 auto'
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(24px, 4.2vw, 44px)',
            fontWeight: 900,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            textAlign: 'center',
            color: '#fff',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            lineHeight: 1.15,
            textShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}
        >
          Home Spoken Centre
        </h1>
      </div>
    </div>
  );
};
