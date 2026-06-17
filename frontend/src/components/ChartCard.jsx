import React from 'react';

const ChartCard = ({ title, children, height = 400 }) => (
  <div className="card-panel" style={{ padding: '1.5rem 1rem', height, display: 'flex', flexDirection: 'column' }}>
    <h3 style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
      {title}
    </h3>
    {children}
  </div>
);

export const ChartEmpty = ({ message }) => (
  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
    {message}
  </div>
);

export default ChartCard;
