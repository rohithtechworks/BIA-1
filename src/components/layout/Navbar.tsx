import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface NavbarProps {
  onBack?: () => void;
  showBack?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onBack, showBack = true }) => {
  const { user, openLoginModal, openSignupModal, logout } = useAuth();
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className="navbar"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: '10px 16px',
        width: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* Left Column */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        {showBack && (
          <button
            type="button"
            className="back"
            style={{ margin: 0, flexShrink: 0 }}
            onClick={handleBack}
          >
            ← Back
          </button>
        )}
      </div>

      {/* Center Column (Strictly Centered) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', justifySelf: 'center' }}>
        <img
          src="/images/logo.webp"
          alt="Brilliant IAS Academy Logo"
          style={{ width: '34px', height: '34px', objectFit: 'contain', borderRadius: '50%', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', flexShrink: 0 }}
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <span
          style={{
            fontWeight: 800,
            fontSize: 'clamp(9px, 1.5vw, 13px)',
            color: '#103665',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
            textAlign: 'center'
          }}
        >
          BRILLIANT IAS ACADEMY
        </span>
      </div>

      {/* Right Column */}
      <div className="nav-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', flexShrink: 0 }}>
        {user ? (
          <>
            {user.role === 'admin' && (
              <Link to="/admin" className="nav-btn nav-btn-admin" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Admin Portal
              </Link>
            )}
            <button type="button" className="nav-btn nav-btn-logout" style={{ whiteSpace: 'nowrap' }} onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="nav-btn"
              style={{
                background: '#103665',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: 700,
                border: 0,
                cursor: 'pointer',
                fontSize: '13px',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              onClick={openLoginModal}
            >
              Login
            </button>
            <button
              type="button"
              className="nav-btn"
              style={{
                background: '#d6a64b',
                color: '#000',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: 700,
                border: 0,
                cursor: 'pointer',
                fontSize: '13px',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              onClick={openSignupModal}
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
};
