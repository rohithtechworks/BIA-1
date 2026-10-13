import React from 'react';

interface MemberButtonProps {
  title: string;
  onClick: () => void;
  color?: string;
  completed?: boolean;
}

const PersonIcon: React.FC = () => (
  <svg className="person" viewBox="0 0 80 80" fill="none" aria-hidden="true" style={{ width: '38px', height: '38px', flex: '0 0 auto' }}>
    <circle cx="40" cy="23" r="17" stroke="white" strokeWidth="6" />
    <path d="M8 69c3-17 16-27 32-27s29 10 32 27c.5 3-2 5-5 5H13c-3 0-5.5-2-5-5Z" stroke="white" strokeWidth="6" strokeLinejoin="round" />
  </svg>
);

export const MemberButton: React.FC<MemberButtonProps> = ({ title, onClick, color = '#103665', completed }) => {
  return (
    <button
      type="button"
      className="family-button"
      style={{ background: color, position: 'relative' }}
      onClick={onClick}
    >
      <PersonIcon />
      <span style={{ flex: 1 }}>{title}</span>
      {completed && (
        <span style={{ fontSize: '18px', color: '#4ade80', fontWeight: 'bold' }}>
          ✓
        </span>
      )}
    </button>
  );
};
