import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Menu } from 'lucide-react';
import UserAvatar from './UserAvatar';

const TopNav = ({ title, onMenuToggle }) => {
  const { user } = useContext(AuthContext);
  return (
    <header className="topnav">
      <div className="topnav-left">
        <button className="hamburger-btn" onClick={onMenuToggle} aria-label="Toggle sidebar">
          <Menu size={22} />
        </button>
        <h2 className="topnav-title">{title}</h2>
      </div>
      <div className="topnav-right">
        <div className="topnav-user">
          <span className="topnav-name">{user?.name}</span>
          <span className="topnav-email">{user?.email}</span>
        </div>
        <UserAvatar name={user?.name} />
      </div>

      <style>{`
        .topnav {
          padding: 0.875rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-light);
          min-height: var(--topnav-height);
        }
        .topnav-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
        }
        .topnav-title {
          margin: 0;
          font-size: 1.2rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .topnav-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }
        .topnav-user {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .topnav-name {
          font-weight: 600;
          font-size: 0.9rem;
        }
        .topnav-email {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
      `}</style>
    </header>
  );
};

export default TopNav;
