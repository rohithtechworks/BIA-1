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

  const isLandingNavbar = !showBack;

  return (
    <header
      className="navbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isLandingNavbar ? '12px 16px' : '10px 14px',
        width: '100%',
        flexWrap: 'nowrap',
        gap: '8px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        background: isLandingNavbar ? '#ad1035' : 'transparent',
        borderTopLeftRadius: isLandingNavbar ? '12px' : '0',
        borderTopRightRadius: isLandingNavbar ? '12px' : '0',
        marginBottom: isLandingNavbar ? '16px' : '24px',
        borderBottom: isLandingNavbar ? 'none' : '2px solid #eee'
      }}
    >
      {/* Left Section */}
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {isLandingNavbar ? (
          <button
            type="button"
            style={{
              background: '#fff',
              color: '#000',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 700,
              border: 0,
              cursor: 'pointer',
              fontSize: '14px',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
            onClick={openLoginModal}
          >
            Login
          </button>
        ) : (
          showBack && (
            <button
              type="button"
              className="back"
              style={{ margin: 0, flexShrink: 0 }}
              onClick={handleBack}
            >
              ← Back
            </button>
          )
        )}
      </div>

      {/* Center Section: Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: '1 1 auto',
          minWidth: 0,
          overflow: 'hidden',
          padding: '0 4px'
        }}
      >
        {(isLandingNavbar || showBack) && (
          <img
            src="/images/logo.png"
            alt="Brilliant IAS Academy Logo"
            style={{
              width: '75px',
              height: '75px',
              objectFit: 'contain',
              borderRadius: '10%',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              flexShrink: 0
            }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        )}
      </div>

      {/* Right Section */}
      <div
        className="nav-right"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0
        }}
      >
        {isLandingNavbar ? (
          <button
            type="button"
            style={{
              background: '#fff',
              color: '#103665',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 700,
              border: 0,
              cursor: 'pointer',
              fontSize: '14px',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
            onClick={openSignupModal}
          >
            Sign Up
          </button>
        ) : user ? (
          <>
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="nav-btn nav-btn-admin"
                style={{
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 700,
                  borderRadius: '8px',
                  lineHeight: 1.2
                }}
              >
                Admin Portal
              </Link>
            )}
            <button
              type="button"
              className="nav-btn nav-btn-logout"
              style={{
                whiteSpace: 'nowrap',
                flexShrink: 0,
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 700,
                borderRadius: '8px',
                lineHeight: 1.2
              }}
              onClick={logout}
            >
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
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                border: 0,
                cursor: 'pointer',
                fontSize: '14px',
                lineHeight: 1.2,
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
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                border: 0,
                cursor: 'pointer',
                fontSize: '14px',
                lineHeight: 1.2,
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
