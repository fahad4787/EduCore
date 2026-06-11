import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Bell, Calendar, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ATTENDANCE_COLORS = ['#10b981', '#f43f5e'];   // Present=green, Absent=red
const LEAVE_COLORS = { Pending: '#eab308', Approved: '#10b981', Rejected: '#f43f5e' };

const tooltipStyle = {
  contentStyle: {
    background: 'var(--bg-card)', backdropFilter: 'blur(10px)',
    border: 'none', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
  },
  itemStyle: { color: 'var(--text-primary)', fontWeight: 500 },
};

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null;
  const R = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  return (
    <text x={cx + r * Math.cos(-midAngle * R)} y={cy + r * Math.sin(-midAngle * R)}
      fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={12} fontWeight="600" style={{ textShadow: '0 1px 2px rgba(0,0,0,.5)' }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const StudentDashboard = () => {
  const [stats, setStats] = useState({
    attendancePercentage: 0, noticesCount: 0, studyMaterialsCount: 0,
    attendanceData: [], leaveData: [], subjectList: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/student/dashboard`);
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
    { title: 'My Attendance', value: `${stats.attendancePercentage}%`, icon: <Calendar size={24} color="var(--accent-primary)" />, bg: 'rgba(59,130,246,0.1)' },
    { title: 'Notices', value: stats.noticesCount, icon: <Bell size={24} color="var(--warning)" />, bg: 'rgba(245,158,11,0.1)' },
    { title: 'Study Materials', value: stats.studyMaterialsCount, icon: <BookOpen size={24} color="var(--success)" />, bg: 'rgba(16,185,129,0.1)' },
    {
      title: 'Total Leaves', value: stats.leaveData.reduce((a, b) => a + b.value, 0),
      icon: <FileText size={24} color="var(--danger)" />, bg: 'rgba(239,68,68,0.1)'
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Student Overview</h2>

      {/* ── Stat Cards ── */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
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

      {/* ── Charts Row ── */}
      <h2 style={{ marginBottom: '1.5rem' }}>Analytics</h2>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>

        {/* Attendance Chart */}
        <div className="glass-panel" style={{ padding: '2rem 1rem', height: '380px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            Attendance Breakdown
          </h3>
          {stats.attendanceData.length > 0 ? (
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.attendanceData} cx="50%" cy="50%"
                    outerRadius={100} innerRadius={60}
                    dataKey="value" labelLine={false} label={renderLabel} paddingAngle={3}>
                    {stats.attendanceData.map((_, i) => (
                      <Cell key={i} fill={ATTENDANCE_COLORS[i % 2]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} {...tooltipStyle} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No attendance records yet.
            </div>
          )}
        </div>

        {/* Leave Chart */}
        <div className="glass-panel" style={{ padding: '2rem 1rem', height: '380px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            Leave Requests Status
          </h3>
          {stats.leaveData.length > 0 ? (
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.leaveData} cx="50%" cy="50%"
                    outerRadius={100} innerRadius={60}
                    dataKey="value" labelLine={false} label={renderLabel} paddingAngle={3}>
                    {stats.leaveData.map((entry, i) => (
                      <Cell key={i} fill={LEAVE_COLORS[entry.name] || '#6366f1'} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} {...tooltipStyle} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No leave requests yet.
            </div>
          )}
        </div>
      </div>

      {/* ── Subjects List ── */}
      <h2 style={{ marginBottom: '1.5rem' }}>My Course Subjects</h2>
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        {stats.subjectList.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Subject Name</th>
                <th>Faculty</th>
              </tr>
            </thead>
            <tbody>
              {stats.subjectList.map((sub, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-muted)', width: '50px' }}>{i + 1}</td>
                  <td style={{ fontWeight: '500' }}>{sub.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>Prof. {sub.professor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No subjects found for your course.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
