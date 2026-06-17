import React from 'react';
import { Bell } from 'lucide-react';

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const audienceBadge = (audience) => {
  const map = {
    All: 'badge-all',
    Student: 'badge-student',
    Professor: 'badge-prof',
    Admin: 'badge-admin',
  };
  return map[audience] || 'badge-all';
};

const RecentNoticesPanel = ({ notices = [], showContent = false }) => (
  <div className="card-panel dashboard-panel">
    <div className="dashboard-panel__header">
      <Bell size={18} color="var(--accent-gold)" />
      <h3>Recent Notices</h3>
    </div>
    {notices.length > 0 ? (
      <ul className="dashboard-feed">
        {notices.map((notice, i) => (
          <li key={i} className="dashboard-feed__item">
            <div className="dashboard-feed__top">
              <span className="dashboard-feed__title">{notice.title}</span>
              <span className={`dashboard-badge ${audienceBadge(notice.audience)}`}>{notice.audience}</span>
            </div>
            {showContent && notice.content && (
              <p className="dashboard-feed__desc">{notice.content.slice(0, 100)}{notice.content.length > 100 ? '…' : ''}</p>
            )}
            <p className="dashboard-feed__meta">
              {notice.author && <span>{notice.author} · </span>}
              {formatDate(notice.createdAt)}
            </p>
          </li>
        ))}
      </ul>
    ) : (
      <p className="dashboard-panel__empty">No notices yet.</p>
    )}
  </div>
);

export default RecentNoticesPanel;
