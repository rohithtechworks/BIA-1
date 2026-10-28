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
    <header className="ref-navbar">
      <div className="ref-nav-actions">
        {showBack ? (
          <button
            type="button"
            className="ref-nav-button"
            onClick={handleBack}
          >
            ← Back
          </button>
        ) : (
          <button
            type="button"
            className="ref-nav-button"
            onClick={openLoginModal}
          >
            Login
          </button>
        )}

        {user ? (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="ref-nav-button"
              >
                Admin
              </Link>
            )}
            <button
              type="button"
              className="ref-nav-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="ref-nav-button"
            onClick={openSignupModal}
          >
            Sign Up
          </button>
        )}
      </div>

      <div className="ref-profile">
        <img
          src="/images/logo.png"
          alt="Brilliant IAS Academy Profile"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/logo.jpeg';
          }}
        />
      </div>

      <div className="ref-academy">BRILLIANT IAS ACADEMY</div>
      <div className="ref-career">
        <span>Career Institution</span>
      </div>
    </header>
  );
};
