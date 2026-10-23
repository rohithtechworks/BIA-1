import React from 'react';

export const AcademyHeader: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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

      {/* Navy Blue Banner: BRILLIANT IAS ACADEMY & CAREER INSTITUTION */}
      <div
        style={{
          background: '#103665',
          color: '#fff',
          padding: '20px 24px',
          borderRadius: '20px',
          marginBottom: '16px',
          boxShadow: '0 6px 18px rgba(16,54,101,0.25)',
          border: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        <h2
          style={{
            margin: '0 0 6px 0',
            fontSize: 'clamp(24px, 4.5vw, 40px)',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}
        >
          BRILLIANT IAS ACADEMY
        </h2>
        <div
          style={{
            fontSize: 'clamp(14px, 2.2vw, 18px)',
            fontWeight: 400,
            letterSpacing: '0.15em',
            opacity: 0.9,
            textTransform: 'uppercase'
          }}
        >
          CAREER INSTITUTION
        </div>
      </div>

      {/* Red Highlighted Banner: HOME SPOKEN CENTRE */}
      <div
        style={{
          background: '#ad1035',
          color: '#fff',
          padding: '18px 24px',
          borderRadius: '20px',
          boxShadow: '0 6px 18px rgba(173,16,53,0.3)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(26px, 5vw, 46px)',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textAlign: 'center'
          }}
        >
          HOME SPOKEN CENTRE
        </h1>
      </div>
    </div>
  );
};
