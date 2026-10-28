import React from 'react';

export const AcademyHeader: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', marginBottom: '24px', overflowX: 'hidden' }}>
      <img
        src="/images/home.png"
        alt="Home Spoken Centre"
        style={{
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
          margin: '0 auto',
          borderRadius: '16px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
        }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/images/Poster1.jpeg';
        }}
      />
    </div>
  );
};
