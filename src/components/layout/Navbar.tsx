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
    <header className="navbar">
      {showBack ? (
        <button
          type="button"
          className="back"
          style={{ margin: 0, padding: '8px 14px', fontSize: '15px' }}
          onClick={handleBack}
        >
          ← Back
        </button>
      ) : (
        <div />
      )}

      <div className="nav-right">
        {user ? (
          <>
            <span className="user-badge">
              {user.fullName} {user.role === 'admin' && '(Admin)'}
            </span>
            {user.role === 'admin' && (
              <Link to="/admin" className="nav-btn nav-btn-admin" style={{ textDecoration: 'none' }}>
                Admin Portal
              </Link>
            )}
            <button type="button" className="nav-btn nav-btn-logout" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button type="button" className="nav-btn" style={{ background: '#103665', color: '#fff' }} onClick={openLoginModal}>
              Login
            </button>
            <button type="button" className="nav-btn nav-btn-admin" onClick={openSignupModal}>
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
};
