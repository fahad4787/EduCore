import React, { useContext, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Menu, X } from 'lucide-react';
import BrandLogo from './BrandLogo';
import UserAvatar from './UserAvatar';
import { getNavIcon } from '../constants/navIcons';

const StudentNavbar = ({ routes }) => {
  const { user, logout } = useContext(AuthContext);
  const [noticesCount, setNoticesCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchNoticesCount = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/student/dashboard`);
        setNoticesCount(res.data.noticesCount || 0);
      } catch (e) {
        console.error('Failed to fetch notices count', e);
      }
    };
    fetchNoticesCount();
  }, []);

  const renderIcon = (name) => {
    if (name === 'Notice Board') {
      return (
        <span style={{ position: 'relative', display: 'flex' }}>
          {getNavIcon(name, 18)}
          {noticesCount > 0 && (
            <span className="badge" style={{ position: 'absolute', top: -6, right: -8 }}>
              {noticesCount}
            </span>
          )}
        </span>
      );
    }
    return getNavIcon(name, 18);
  };

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      <header className="student-topnav">
        <div className="student-topnav-brand student-branding-text">
          <BrandLogo showTagline={false} />
        </div>

        <nav className="student-nav-links">
          {routes.map((route) => (
            <NavLink key={route.path} to={route.path} className={({ isActive }) => `student-nav-link${isActive ? ' active' : ''}`}>
              {renderIcon(route.name)}
              {route.name}
            </NavLink>
          ))}
        </nav>

        <div className="student-topnav-actions">
          <div className="student-topnav-user">
            <span className="topnav-name">{user?.name}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user?.role}</span>
          </div>
          <UserAvatar name={user?.name} size={34} />
          <button onClick={logout} className="student-logout-btn" title="Logout">
            <LogOut size={18} />
          </button>
          <button
            className="hamburger-btn student-nav-hamburger"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation"
            style={{ display: 'none' }}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <div className={`student-mobile-menu${menuOpen ? ' open' : ''}`}>
        {routes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            className={({ isActive }) => `student-nav-link mobile${isActive ? ' active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {renderIcon(route.name)}
            {route.name}
          </NavLink>
        ))}
      </div>

      <style>{`
        .student-topnav {
          padding: 0.65rem 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-light);
        }
        .student-topnav-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }
        .student-topnav-user {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .student-nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.875rem;
          text-decoration: none !important;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .student-nav-link:hover {
          background: var(--accent-light);
          color: var(--accent-primary);
          text-decoration: none !important;
        }
        .student-nav-link.active {
          background: var(--accent-primary);
          color: white;
          font-weight: 600;
          text-decoration: none !important;
        }
        .student-nav-link.mobile {
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
        }
        .student-logout-btn {
          display: flex;
          align-items: center;
          background: transparent;
          color: var(--danger);
          padding: 0.4rem;
          border-radius: var(--radius-sm);
          transition: background 0.15s ease;
        }
        .student-logout-btn:hover {
          background: rgba(220,53,69,0.08);
        }
      `}</style>
    </div>
  );
};

export default StudentNavbar;
