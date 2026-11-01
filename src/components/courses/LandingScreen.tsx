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
        src="/images/poster.png"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/images/Poster1.jpeg';
        }}
      />
      <button id="open-course" type="button" className="open-course" onClick={onOpenCourse}>
        OPEN COURSE
      </button>
    </div>
  );
};
