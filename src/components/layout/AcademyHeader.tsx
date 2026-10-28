import React from 'react';

export const AcademyHeader: React.FC = () => {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto 28px auto',
        textAlign: 'center',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        borderRadius: '16px',
        boxShadow: '0 6px 18px rgba(0,0,0,0.15)'
      }}
    >
      {/* Top Container: BRILLIANT IAS ACADEMY */}
      <div
        style={{
          background: '#103665',
          color: '#fff',
          padding: '16px 20px',
          width: '100%',
          textAlign: 'center'
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
          width: '100%',
          textAlign: 'center'
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

      {/* Bottom Container: Home Spoken Centre */}
      <div
        style={{
          background: '#ad1035',
          color: '#fff',
          padding: '20px 20px',
          width: '100%',
          textAlign: 'center'
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
