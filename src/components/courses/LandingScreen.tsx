import React from 'react';

interface LandingScreenProps {
  onOpenCourse: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onOpenCourse }) => {
  return (
    <div className="landing-screen">
      <img
        className="landing-poster"
        alt="Brilliant IAS Academy Home Spoken Centre — Speak English in 10 Days"
        src="/images/Poster.png"
        onError={(e) => {
          // Fallback placeholder if image file is loading
          (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="720" height="960" viewBox="0 0 720 960"><rect width="100%" height="100%" fill="%23103665"/><text x="50%" y="45%" fill="%23D6A64B" font-size="42" font-weight="bold" text-anchor="middle">BRILLIANT IAS ACADEMY</text><text x="50%" y="52%" fill="%23FFFFFF" font-size="36" font-weight="bold" text-anchor="middle">HOME SPOKEN CENTRE</text><text x="50%" y="58%" fill="%23AD1035" font-size="28" font-weight="bold" text-anchor="middle">Speak English in 10 Days</text></svg>';
        }}
      />
      <button id="open-course" type="button" className="open-course" onClick={onOpenCourse}>
        OPEN COURSE
      </button>
    </div>
  );
};
