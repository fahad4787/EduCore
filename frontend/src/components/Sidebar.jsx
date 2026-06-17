import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { getNavIcon } from '../constants/navIcons';

const Sidebar = ({ routes, isOpen, onClose }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <>
      <div className={`sidebar-overlay${isOpen ? ' active' : ''}`} onClick={onClose} />
      <div className={`sidebar-wrapper${isOpen ? ' open' : ''}`} style={{ width: 'var(--sidebar-width)' }}>
        <div className="sidebar-inner">
          <div className="sidebar-brand">
            <BrandLogo variant="light" showTagline={false} />
            <p className="sidebar-role">{user?.role} Portal</p>
          </div>
          <nav className="sidebar-nav">
            {routes.map((route) => (
              <NavLink
                key={route.path}
                to={route.path}
                onClick={onClose}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                {getNavIcon(route.name)}
                {route.name}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-footer">
            <button className="sidebar-logout" onClick={logout}>
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
