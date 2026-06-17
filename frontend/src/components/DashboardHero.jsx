import React from 'react';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const DashboardHero = ({ name, role, subtitle, children }) => (
  <div className="dashboard-hero">
    <div className="dashboard-hero__content">
      <p className="dashboard-hero__greeting">{getGreeting()}, {name?.split(' ')[0] || 'there'}</p>
      <h2 className="dashboard-hero__title">{role} Dashboard</h2>
      {subtitle && <p className="dashboard-hero__subtitle">{subtitle}</p>}
    </div>
    {children && <div className="dashboard-hero__actions">{children}</div>}
  </div>
);

export default DashboardHero;
