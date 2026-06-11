import React, { useContext, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import DDULogo from '../assets/DDU-logo.jpg';
import {
  LayoutDashboard, UserCheck, Bell, BookOpen,
  Calendar, LogOut, FileText, ClipboardList, Menu, X,
} from 'lucide-react';

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

  const iconMap = {
    'Dashboard': <LayoutDashboard size={18} />,
    'Profile': <UserCheck size={18} />,
    'Notice Board': (
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Bell size={18} />
        {noticesCount > 0 && (
          <span style={{
            position: 'absolute', top: '-6px', right: '-6px',
            background: 'var(--danger)', color: 'white',
            borderRadius: '10px', padding: '2px 5px',
            fontSize: '0.65rem', fontWeight: 'bold', lineHeight: 1,
          }}>
            {noticesCount}
          </span>
        )}
      </div>
    ),
    'Study Material': <BookOpen size={18} />,
    'Leaves': <Calendar size={18} />,
    'Attendance': <ClipboardList size={18} />,
  };

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)',
    color: isActive ? 'white' : 'var(--text-secondary)',
    background: isActive ? 'var(--accent-primary)' : 'transparent',
    fontWeight: isActive ? '600' : '500',
    transition: 'all 0.2s', fontSize: '0.875rem',
    textDecoration: 'none',
  });

  const mobileNavLinkStyle = ({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
    color: isActive ? 'white' : 'var(--text-secondary)',
    background: isActive ? 'var(--accent-primary)' : 'transparent',
    fontWeight: isActive ? '600' : '500',
    fontSize: '0.9rem', textDecoration: 'none',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      {/* Main bar */}
      <div
        className="glass-panel"
        style={{
          padding: '0.65rem 1.25rem', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
          borderRadius: '0', borderBottom: '1px solid var(--glass-border)',
        }}
      >
        {/* Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <img src={DDULogo} alt="Nexus" style={{ height: '36px', flexShrink: 0 }} />
          <h2 className="student-branding-text" style={{
            fontSize: '1.1rem', margin: 0,
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            lineHeight: '1.2', whiteSpace: 'nowrap',
          }}>
            Nexus University of Technology
          </h2>
        </div>

        {/* Desktop Nav Links */}
        <div className="student-nav-links">
          {routes.map((route) => (
            <NavLink key={route.path} to={route.path} style={navLinkStyle}>
              {iconMap[route.name] || <FileText size={18} />}
              {route.name}
            </NavLink>
          ))}
        </div>

        {/* Right: user info + logout + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{user?.name}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user?.role}</span>
          </div>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'var(--accent-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', color: 'white', fontSize: '0.85rem', flexShrink: 0,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={logout}
            style={{ display: 'flex', alignItems: 'center', background: 'transparent', color: 'var(--danger)', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
            title="Logout"
          >
            <LogOut size={18} />
          </button>
          {/* Hamburger — only shows on ≤900px via CSS */}
          <button
            className="hamburger-btn student-nav-hamburger"
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Toggle navigation"
            style={{ display: 'none' }}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div className={`student-mobile-menu${menuOpen ? ' open' : ''}`}>
        {routes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            style={mobileNavLinkStyle}
            onClick={() => setMenuOpen(false)}
          >
            {iconMap[route.name] || <FileText size={18} />}
            {route.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default StudentNavbar;

