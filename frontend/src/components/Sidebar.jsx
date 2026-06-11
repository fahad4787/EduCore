import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard, Users, UserCheck, Bell, BookOpen,
  Calendar, LogOut, FileText, ClipboardList,
} from 'lucide-react';

const Sidebar = ({ routes, isOpen, onClose }) => {
  const { user, logout } = useContext(AuthContext);

  const iconMap = {
    'Dashboard': <LayoutDashboard size={20} />,
    'Students': <Users size={20} />,
    'My Students': <Users size={20} />,
    'Professors': <UserCheck size={20} />,
    'Notice': <Bell size={20} />,
    'Notice Board': <Bell size={20} />,
    'Courses': <BookOpen size={20} />,
    'Subjects': <FileText size={20} />,
    'Leave': <Calendar size={20} />,
    'Leave Requests': <Calendar size={20} />,
    'Leave Approvals': <Calendar size={20} />,
    'Attendance': <ClipboardList size={20} />,
    'Study Material': <BookOpen size={20} />,
    'Profile': <UserCheck size={20} />,
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Overlay for mobile/tablet */}
      <div
        className={`sidebar-overlay${isOpen ? ' active' : ''}`}
        onClick={onClose}
      />

      {/* Sidebar drawer */}
      <div
        className={`sidebar-wrapper${isOpen ? ' open' : ''}`}
        style={{ width: '250px' }}
      >
        <div
          className="glass-panel"
          style={{
            width: '250px',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '0',
            borderRight: '1px solid var(--glass-border)',
          }}
        >
          {/* Branding */}
          <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
            <h2 style={{
              fontSize: '0.95rem', margin: 0,
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              lineHeight: '1.3',
            }}>
              Nexus University of Technology
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.4rem' }}>
              {user?.role} Portal
            </p>
          </div>

          {/* Nav Links */}
          <div style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
            {routes.map((route) => (
              <NavLink
                key={route.path}
                to={route.path}
                onClick={handleNavClick}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                  padding: '0.7rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent-gradient)' : 'transparent',
                  fontWeight: isActive ? '600' : '400',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                })}
              >
                {iconMap[route.name] || <FileText size={20} />}
                {route.name}
              </NavLink>
            ))}
          </div>

          {/* Logout */}
          <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              onClick={logout}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: '0.875rem', padding: '0.7rem 1rem',
                background: 'transparent', color: 'var(--danger)',
                borderRadius: 'var(--radius-md)', fontSize: '0.9rem',
                transition: 'background 0.2s',
              }}
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

