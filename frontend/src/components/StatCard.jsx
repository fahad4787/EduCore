import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, icon, iconBg = 'var(--accent-light)', subtitle, trend }) => (
  <div className="card-panel stat-card">
    <div className="stat-card__icon" style={{ background: iconBg }}>
      {icon}
    </div>
    <div className="stat-card__body">
      <p className="stat-card__label">{title}</p>
      <p className="stat-card__value">{value}</p>
      {subtitle && <p className="stat-card__subtitle">{subtitle}</p>}
      {trend && (
        <p className={`stat-card__trend ${trend.positive ? 'stat-card__trend--up' : 'stat-card__trend--down'}`}>
          {trend.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {trend.label}
        </p>
      )}
    </div>
  </div>
);

export default StatCard;
