import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Users, Bell, FileText, BookOpen, Layers, ClipboardCheck } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, CartesianGrid, XAxis, YAxis,
} from 'recharts';
import { AuthContext } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import ChartCard, { ChartEmpty } from '../components/ChartCard';
import DashboardHero from '../components/DashboardHero';
import RecentNoticesPanel from '../components/RecentNoticesPanel';
import PendingLeavesPanel from '../components/PendingLeavesPanel';
import { CHART_COLORS, chartTooltipStyle } from '../constants/chartStyles';

const LEAVE_COLORS = { Pending: '#D4A017', Approved: '#14805D', Rejected: '#DC3545' };

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const R = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  return (
    <text x={cx + r * Math.cos(-midAngle * R)} y={cy + r * Math.sin(-midAngle * R)}
      fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const tooltipProps = {
  contentStyle: chartTooltipStyle,
  itemStyle: { color: 'var(--text-primary)', fontWeight: 500 },
};

const ProfDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    studentsCount: 0, noticesCount: 0, leavesCount: 0,
    materialsCount: 0, subjectsCount: 0, coursesCount: 0,
    attendanceRate: 0, studentDistribution: [], leaveStatus: [],
    assignedCourses: [], attendanceTrend: [], recentNotices: [], pendingLeavesList: [],
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

  if (loading) return <Loader text="Loading dashboard..." full />;

  const statCards = [
    { title: 'My Students', value: stats.studentsCount, subtitle: `Across ${stats.coursesCount} courses`, icon: <Users size={24} color="var(--accent-primary)" />, iconBg: 'var(--accent-light)' },
    { title: 'Subjects', value: stats.subjectsCount, subtitle: 'Under your courses', icon: <Layers size={24} color="var(--success)" />, iconBg: 'var(--accent-gold-light)' },
    { title: 'Study Materials', value: stats.materialsCount, subtitle: 'Uploaded resources', icon: <BookOpen size={24} color="var(--accent-gold)" />, iconBg: 'var(--accent-gold-light)' },
    { title: 'Class Attendance', value: `${stats.attendanceRate}%`, subtitle: 'Average across students', icon: <ClipboardCheck size={24} color="var(--accent-primary)" />, iconBg: 'var(--accent-light)', trend: { positive: stats.attendanceRate >= 75, label: stats.attendanceRate >= 75 ? 'On track' : 'Below target' } },
    { title: 'Pending Leaves', value: stats.leavesCount, subtitle: 'Need your review', icon: <FileText size={24} color="var(--danger)" />, iconBg: 'rgba(220,53,69,0.08)' },
    { title: 'Notices', value: stats.noticesCount, subtitle: 'Campus announcements', icon: <Bell size={24} color="var(--accent-gold)" />, iconBg: 'var(--accent-gold-light)' },
  ];

  return (
    <div className="page-enter">
      <DashboardHero
        name={user?.name}
        role="Professor"
        subtitle="Track your classes, student attendance, and pending approvals."
      >
        <div className="dashboard-hero__stat-pill">
          <strong>{stats.studentsCount}</strong>
          <span>Students</span>
        </div>
        <div className="dashboard-hero__stat-pill">
          <strong>{stats.attendanceRate}%</strong>
          <span>Attendance</span>
        </div>
        <div className="dashboard-hero__stat-pill">
          <strong>{stats.leavesCount}</strong>
          <span>Pending</span>
        </div>
      </DashboardHero>

      <div className="stat-cards-grid">
        {statCards.map((card, i) => <StatCard key={i} {...card} />)}
      </div>

      {stats.assignedCourses?.length > 0 && (
        <>
          <h3 className="dashboard-section-title">My Courses</h3>
          <div className="course-chip-grid">
            {stats.assignedCourses.map((c, i) => (
              <div key={i} className="course-chip">
                <div className="course-chip__name">{c.name}</div>
                <div className="course-chip__meta">{c.students} students · {c.subjects} subjects</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="dashboard-two-col">
        <ChartCard title="Class Attendance Trend (14 Days)" height={360}>
          {stats.attendanceTrend?.some(d => d.rate !== null) ? (
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.attendanceTrend.filter(d => d.rate !== null)} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="profAttendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4A017" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D4A017" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip formatter={(v) => [`${v}%`, 'Attendance']} {...tooltipProps} />
                  <Area type="monotone" dataKey="rate" stroke="#D4A017" strokeWidth={2} fill="url(#profAttendGrad)" dot={{ r: 3, fill: '#D4A017' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : <ChartEmpty message="No attendance records yet." />}
        </ChartCard>

        <PendingLeavesPanel leaves={stats.pendingLeavesList} />
      </div>

      <h3 className="dashboard-section-title">Analytics</h3>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <ChartCard title="Student Distribution by Course">
          {stats.studentDistribution?.length > 0 ? (
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.studentDistribution} cx="50%" cy="50%" outerRadius={110} innerRadius={70}
                    dataKey="value" labelLine={false} label={renderLabel} paddingAngle={3}>
                    {stats.studentDistribution.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [v, 'Students']} {...tooltipProps} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <ChartEmpty message="No student distribution data." />}
        </ChartCard>

        <ChartCard title="Leave Requests Status">
          {stats.leaveStatus?.length > 0 ? (
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.leaveStatus} cx="50%" cy="50%" outerRadius={110} innerRadius={70}
                    dataKey="value" labelLine={false} label={renderLabel} paddingAngle={3}>
                    {stats.leaveStatus.map((entry, i) => (
                      <Cell key={i} fill={LEAVE_COLORS[entry.name] || CHART_COLORS[i]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [v, 'Requests']} {...tooltipProps} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <ChartEmpty message="No leave request data." />}
        </ChartCard>

        <RecentNoticesPanel notices={stats.recentNotices} />
      </div>
    </div>
  );
};

export default ProfDashboard;
