import React from 'react';

export const AcademyHeader: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', marginBottom: '28px', overflowX: 'hidden' }}>
      {/* Logo */}
      <div style={{ marginBottom: '16px' }}>
        <img
          src="/images/logo.webp"
          alt="Brilliant IAS Academy Logo"
          style={{ width: '84px', height: '84px', objectFit: 'contain', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>

      {/* Unified Institutional Header Group (Split by color, zero space between) */}
      <div
        style={{
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
          border: '1px solid rgba(0,0,0,0.25)',
          maxWidth: '800px',
          margin: '0 auto'
        }}
      >
        {/* Top Section: Navy Blue (Brilliant IAS Academy) */}
        <div
          style={{
            background: '#103665',
            color: '#fff',
            padding: '20px 16px',
            textAlign: 'center'
          }}
        >
          <h2
            style={{
              margin: '0 0 4px 0',
              fontSize: 'clamp(19px, 3.4vw, 35px)',
              fontWeight: 900,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              textShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}
          >
            BRILLIANT IAS ACADEMY
          </h2>
          <div
            style={{
              fontSize: 'clamp(14px, 2.2vw, 18px)',
              fontWeight: 500,
              letterSpacing: '0.15em',
              opacity: 0.95,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap'
            }}
          >
            CAREER INSTITUTION
          </div>
        </div>

        {/* Bottom Section: Red (Home Spoken Centre) */}
        <div
          style={{
            background: '#ad1035',
            color: '#fff',
            padding: '18px 16px',
            textAlign: 'center'
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(21px, 3.8vw, 40px)',
              fontWeight: 900,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              textAlign: 'center',
              color: '#fff',
              whiteSpace: 'nowrap',
              textShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }}
          >
            HOME SPOKEN CENTRE
          </h1>
        </div>
      </div>
    </div>
  );
};
