import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Users, UserCheck, BookOpen, FileText, ClipboardCheck, FolderOpen } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area,
} from 'recharts';
import { AuthContext } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import ChartCard, { ChartEmpty } from '../components/ChartCard';
import DashboardHero from '../components/DashboardHero';
import RecentNoticesPanel from '../components/RecentNoticesPanel';
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

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalStudents: 0, totalProfessors: 0, totalCourses: 0,
    totalSubjects: 0, totalNotices: 0, pendingLeaves: 0,
    totalMaterials: 0, attendanceRate: 0,
    studentDistribution: [], subjectsPerCourse: [], leaveStatus: [],
    enrollmentByYear: [], attendanceTrend: [], recentNotices: [],
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

  if (loading) return <Loader text="Loading dashboard..." full />;

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, subtitle: 'Enrolled across all courses', icon: <Users size={24} color="var(--accent-primary)" />, iconBg: 'var(--accent-light)' },
    { title: 'Professors', value: stats.totalProfessors, subtitle: 'Active faculty members', icon: <UserCheck size={24} color="var(--success)" />, iconBg: 'var(--accent-gold-light)' },
    { title: 'Courses', value: stats.totalCourses, subtitle: `${stats.totalSubjects} subjects offered`, icon: <BookOpen size={24} color="var(--accent-gold)" />, iconBg: 'var(--accent-gold-light)' },
    { title: 'Attendance Rate', value: `${stats.attendanceRate}%`, subtitle: 'Campus-wide average', icon: <ClipboardCheck size={24} color="var(--accent-primary)" />, iconBg: 'var(--accent-light)', trend: { positive: stats.attendanceRate >= 75, label: stats.attendanceRate >= 75 ? 'Healthy' : 'Needs attention' } },
    { title: 'Pending Leaves', value: stats.pendingLeaves, subtitle: 'Awaiting approval', icon: <FileText size={24} color="var(--danger)" />, iconBg: 'rgba(220,53,69,0.08)' },
    { title: 'Study Materials', value: stats.totalMaterials, subtitle: `${stats.totalNotices} active notices`, icon: <FolderOpen size={24} color="var(--success)" />, iconBg: 'var(--accent-light)' },
  ];

  return (
    <div className="page-enter">
      <DashboardHero
        name={user?.name}
        role="Admin"
        subtitle="Monitor enrollment, attendance, and campus operations at a glance."
      >
        <div className="dashboard-hero__stat-pill">
          <strong>{stats.totalStudents}</strong>
          <span>Students</span>
        </div>
        <div className="dashboard-hero__stat-pill">
          <strong>{stats.attendanceRate}%</strong>
          <span>Attendance</span>
        </div>
        <div className="dashboard-hero__stat-pill">
          <strong>{stats.pendingLeaves}</strong>
          <span>Pending Leaves</span>
        </div>
      </DashboardHero>

      <div className="stat-cards-grid">
        {statCards.map((card, index) => <StatCard key={index} {...card} />)}
      </div>

      <div className="dashboard-two-col">
        <ChartCard title="Campus Attendance Trend (14 Days)" height={360}>
          {stats.attendanceTrend?.some(d => d.rate !== null) ? (
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.attendanceTrend.filter(d => d.rate !== null)} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="attendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D6E4F" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0D6E4F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip formatter={(v) => [`${v}%`, 'Attendance']} {...tooltipProps} />
                  <Area type="monotone" dataKey="rate" stroke="#0D6E4F" strokeWidth={2} fill="url(#attendGrad)" dot={{ r: 3, fill: '#0D6E4F' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : <ChartEmpty message="No attendance data yet." />}
        </ChartCard>

        <RecentNoticesPanel notices={stats.recentNotices} />
      </div>

      <h3 className="dashboard-section-title">Analytics Overview</h3>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <ChartCard title="Student Distribution by Course">
          {stats.studentDistribution?.length > 0 ? (
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.studentDistribution} cx="50%" cy="50%" labelLine={false} label={renderLabel}
                    outerRadius={110} innerRadius={70} dataKey="value" paddingAngle={3}>
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

        <ChartCard title="Enrollment by Year">
          {stats.enrollmentByYear?.length > 0 ? (
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.enrollmentByYear} margin={{ top: 20, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(13,110,79,0.05)' }} formatter={(v) => [v, 'Students']} {...tooltipProps} />
                  <Bar dataKey="count" fill="#0D6E4F" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <ChartEmpty message="No enrollment data." />}
        </ChartCard>

        <ChartCard title="Leave Requests Status">
          {stats.leaveStatus?.length > 0 ? (
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.leaveStatus} cx="50%" cy="50%" outerRadius={110} innerRadius={70}
                    labelLine={false} label={renderLabel} dataKey="value" paddingAngle={3}>
                    {stats.leaveStatus.map((entry, i) => (
                      <Cell key={i} fill={LEAVE_COLORS[entry.name] || CHART_COLORS[i]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [v, 'Requests']} {...tooltipProps} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <ChartEmpty message="No leave requests yet." />}
        </ChartCard>
      </div>

      <h3 className="dashboard-section-title">Subjects per Course</h3>
      <ChartCard title="" height={320}>
        {stats.subjectsPerCourse?.length > 0 ? (
          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.subjectsPerCourse} margin={{ top: 20, right: 10, left: -20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} interval={0} angle={-30} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(13,110,79,0.05)' }} formatter={(v) => [v, 'Subjects']} {...tooltipProps} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {stats.subjectsPerCourse.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : <ChartEmpty message="No subjects data." />}
      </ChartCard>
    </div>
  );
};

export default AdminDashboard;
