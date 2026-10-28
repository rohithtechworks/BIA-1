import React from 'react';

export const AcademyHeader: React.FC = () => {
  return (
    <div
      style={{
        textAlign: 'center',
        marginTop: 0,
        marginBottom: 0,
        overflowX: 'hidden',
        borderLeft: '10px solid #F00505',
        borderRight: '10px solid #F00505',
        boxSizing: 'border-box'
      }}
    >
      <img
        src="/images/home.png"
        alt="Home Spoken Centre"
        style={{
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
          margin: '0 auto',
          borderRadius: 0
        }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/images/Poster1.jpeg';
        }}
      />
    </div>
  );
};
