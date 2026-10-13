import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Navbar: React.FC = () => {
  const { user, openLoginModal, openSignupModal, logout } = useAuth();

  return (
    <header className="navbar">
      <Link to="/" className="nav-brand">
        Home Spoken Centre
      </Link>

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
