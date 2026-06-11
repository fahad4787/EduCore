import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserCheck, BookOpen } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f97316', // Orange
  '#eab308', // Yellow
  '#84cc16', // Lime
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Don't show label if slice is too small
  if (percent < 0.05) return null;

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="600" style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.5)' }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0, totalProfessors: 0, totalCourses: 0,
    studentDistribution: [], subjectsPerCourse: [], leaveStatus: []
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/dashboard`);
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);
  if (loading) return <div>Loading dashboard...</div>;
  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: <Users size={24} color="var(--accent-primary)" />, bg: 'rgba(59, 130, 246, 0.1)' },
    { title: 'Total Professors', value: stats.totalProfessors, icon: <UserCheck size={24} color="var(--success)" />, bg: 'rgba(16, 185, 129, 0.1)' },
    { title: 'Total Courses', value: stats.totalCourses, icon: <BookOpen size={24} color="var(--warning)" />, bg: 'rgba(245, 158, 11, 0.1)' },
  ];
  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>System Overview</h2>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {statCards.map((card, index) => (
          <div key={index} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ background: card.bg, padding: '1rem', borderRadius: '50%' }}>
              {card.icon}
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{card.title}</p>
              <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>Analytics Overview</h2>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

        {/* Student Distribution */}
        <div className="glass-panel" style={{ padding: '2rem 1rem', height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Student Distribution by Course</h3>
          {stats.studentDistribution && stats.studentDistribution.length > 0 ? (
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.studentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={110}
                    innerRadius={70}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {stats.studentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, 'Students']}
                    contentStyle={{ background: 'var(--bg-card)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}
                    itemStyle={{ color: 'var(--text-primary)', fontWeight: 500 }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No student distribution data available.
            </div>
          )}
        </div>

        {/* Subjects per Course */}
        <div className="glass-panel" style={{ padding: '2rem 1rem', height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Subjects Workload per Course</h3>
          {stats.subjectsPerCourse && stats.subjectsPerCourse.length > 0 ? (
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.subjectsPerCourse} margin={{ top: 20, right: 10, left: -20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                    formatter={(value) => [value, 'Subjects']}
                    contentStyle={{ background: 'var(--bg-card)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}
                    itemStyle={{ color: 'var(--text-primary)', fontWeight: 500 }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {stats.subjectsPerCourse.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No subjects data available.
            </div>
          )}
        </div>

        {/* Leave Requests Status */}
        <div className="glass-panel" style={{ padding: '2rem 1rem', height: '400px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Leave Requests Status</h3>
          {stats.leaveStatus && stats.leaveStatus.length > 0 ? (
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.leaveStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={70}
                    labelLine={false}
                    label={renderCustomizedLabel}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {stats.leaveStatus.map((entry, index) => {
                      let color = '#eab308'; // Pending yellow
                      if (entry.name === 'Approved') color = '#10b981'; // Success green
                      if (entry.name === 'Rejected') color = '#f43f5e'; // Danger red
                      return <Cell key={`cell-${index}`} fill={color} stroke="transparent" />;
                    })}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, 'Requests']}
                    contentStyle={{ background: 'var(--bg-card)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}
                    itemStyle={{ color: 'var(--text-primary)', fontWeight: 500 }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No leave requests data available.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default AdminDashboard;
