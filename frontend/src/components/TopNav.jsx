import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Menu } from 'lucide-react';

const TopNav = ({ title, onMenuToggle }) => {
  const { user } = useContext(AuthContext);
  return (
    <div
      className="glass-panel"
      style={{
        padding: '0.875rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: '0',
        borderBottom: '1px solid var(--glass-border)',
        minHeight: '60px',
      }}
    >
      {/* Left: Hamburger + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          className="hamburger-btn"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          <Menu size={22} />
        </button>
        <h2 className="topnav-title" style={{ margin: 0, fontSize: '1.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </h2>
      </div>

      {/* Right: User info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user?.name}</span>
          <span className="topnav-email" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {user?.email}
          </span>
        </div>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'var(--accent-gradient)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 'bold', color: 'white', fontSize: '0.9rem', flexShrink: 0,
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default TopNav;

