import React from 'react';
import { FileText, Calendar } from 'lucide-react';

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const PendingLeavesPanel = ({ leaves = [] }) => (
  <div className="card-panel dashboard-panel">
    <div className="dashboard-panel__header">
      <FileText size={18} color="var(--danger)" />
      <h3>Pending Leave Requests</h3>
    </div>
    {leaves.length > 0 ? (
      <ul className="dashboard-feed">
        {leaves.map((leave) => (
          <li key={leave.id} className="dashboard-feed__item">
            <div className="dashboard-feed__top">
              <span className="dashboard-feed__title">{leave.student}</span>
              <span className="dashboard-badge badge-pending">Pending</span>
            </div>
            <p className="dashboard-feed__desc">{leave.reason}</p>
            <p className="dashboard-feed__meta">
              <Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
              {leave.course} · {formatDate(leave.date)}
            </p>
          </li>
        ))}
      </ul>
    ) : (
      <p className="dashboard-panel__empty">No pending leave requests.</p>
    )}
  </div>
);

export default PendingLeavesPanel;
