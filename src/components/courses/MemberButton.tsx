import React from 'react';

interface MemberButtonProps {
  title: string;
  onClick: () => void;
  color?: string;
  completed?: boolean;
}

const PersonIcon: React.FC = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.18)',
    border: '2px solid rgba(255, 255, 255, 0.4)',
    flex: '0 0 auto',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
  }}>
    <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" style={{ width: '32px', height: '32px' }}>
      <circle cx="40" cy="23" r="17" stroke="white" strokeWidth="6" />
      <path d="M8 69c3-17 16-27 32-27s29 10 32 27c.5 3-2 5-5 5H13c-3 0-5.5-2-5-5Z" stroke="white" strokeWidth="6" strokeLinejoin="round" />
    </svg>
  </div>
);

export const MemberButton: React.FC<MemberButtonProps> = ({ title, onClick, color = '#103665', completed }) => {
  return (
    <button
      type="button"
      className="family-button"
      style={{
        background: `linear-gradient(135deg, ${color} 0%, #082449 100%)`,
        position: 'relative',
        borderRadius: '24px',
        minHeight: '88px',
        fontSize: 'clamp(20px, 3.8vw, 28px)',
        fontWeight: 700,
        padding: '16px 24px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        border: '1px solid rgba(255,255,255,0.2)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        width: '100%',
        color: '#fff',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease',
        textAlign: 'left'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
      }}
      onClick={onClick}
    >
      <PersonIcon />
      <span style={{ flex: 1, letterSpacing: '0.03em', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{title}</span>
      {completed && (
        <span style={{ fontSize: '24px', color: '#4ade80', fontWeight: 'bold', textShadow: '0 0 10px rgba(74,222,128,0.5)' }}>
          ✓
        </span>
      )}
    </button>
  );
};
