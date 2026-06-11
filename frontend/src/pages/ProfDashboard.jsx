import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Bell, FileText } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#10b981', '#06b6d4', '#3b82f6',
];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={12} fontWeight="600" style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const ProfDashboard = () => {
  const [stats, setStats] = useState({
    studentsCount: 0,
    noticesCount: 0,
    leavesCount: 0,
    studentDistribution: [],
    leaveStatus: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/professor/dashboard`);
        setStats(res.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const statCards = [
    { title: 'My Students', value: stats.studentsCount, icon: <Users size={24} color="var(--accent-primary)" />, bg: 'rgba(59,130,246,0.1)' },
    { title: 'Notices', value: stats.noticesCount, icon: <Bell size={24} color="var(--warning)" />, bg: 'rgba(245,158,11,0.1)' },
    { title: 'Pending Leaves', value: stats.leavesCount, icon: <FileText size={24} color="var(--danger)" />, bg: 'rgba(239,68,68,0.1)' },
  ];

  const tooltipProps = {
    contentStyle: { background: 'var(--bg-card)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' },
    itemStyle: { color: 'var(--text-primary)', fontWeight: 500 },
  };

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Professor Overview</h2>

      {/* ── Stat Cards ── */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {statCards.map((card, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ background: card.bg, padding: '1rem', borderRadius: '50%' }}>{card.icon}</div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{card.title}</p>
              <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* ── Analytics ── */}
      <h2 style={{ marginBottom: '1.5rem' }}>Analytics Overview</h2>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

        {/* Chart 1 — Student Distribution */}
        <div className="glass-panel" style={{ padding: '2rem 1rem', height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            Student Distribution by Course
          </h3>
          {stats.studentDistribution && stats.studentDistribution.length > 0 ? (
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.studentDistribution}
                    cx="50%" cy="50%"
                    outerRadius={110} innerRadius={70}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    paddingAngle={3}
                  >
                    {stats.studentDistribution.map((_, index) => (
                      <Cell key={`sd-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [v, 'Students']} {...tooltipProps} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No student distribution data available.
            </div>
          )}
        </div>

        {/* Chart 2 — Leave Status */}
        <div className="glass-panel" style={{ padding: '2rem 1rem', height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            Leave Requests Status
          </h3>
          {stats.leaveStatus && stats.leaveStatus.length > 0 ? (
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.leaveStatus}
                    cx="50%" cy="50%"
                    outerRadius={110} innerRadius={70}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    paddingAngle={3}
                  >
                    {stats.leaveStatus.map((entry, index) => {
                      let color = '#eab308';
                      if (entry.name === 'Approved') color = '#10b981';
                      if (entry.name === 'Rejected') color = '#f43f5e';
                      return <Cell key={`ls-${index}`} fill={color} stroke="transparent" />;
                    })}
                  </Pie>
                  <Tooltip formatter={(v) => [v, 'Requests']} {...tooltipProps} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No leave request data available.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProfDashboard;
