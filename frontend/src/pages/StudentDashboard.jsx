import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { BookOpen, Bell, Calendar, FileText, Flame, GraduationCap } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { AuthContext } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import ChartCard, { ChartEmpty } from '../components/ChartCard';
import DashboardHero from '../components/DashboardHero';
import RecentNoticesPanel from '../components/RecentNoticesPanel';
import { chartTooltipStyle } from '../constants/chartStyles';

const ATTENDANCE_COLORS = ['#14805D', '#DC3545', '#DDE5E1'];
const LEAVE_COLORS = { Pending: '#D4A017', Approved: '#14805D', Rejected: '#DC3545' };

const tooltipProps = {
  contentStyle: chartTooltipStyle,
  itemStyle: { color: 'var(--text-primary)', fontWeight: 500 },
};

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null;
  const R = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  return (
    <text x={cx + r * Math.cos(-midAngle * R)} y={cy + r * Math.sin(-midAngle * R)}
      fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    attendancePercentage: 0, noticesCount: 0, studyMaterialsCount: 0,
    subjectCount: 0, courseName: '', presentStreak: 0,
    attendanceData: [], leaveData: [], subjectList: [],
    attendanceTrend: [], recentAttendance: [], recentNotices: [], upcomingLeaves: [],
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

  if (loading) return <Loader text="Loading dashboard..." full />;

  const attendanceNum = parseFloat(stats.attendancePercentage) || 0;
  const statCards = [
    { title: 'My Attendance', value: `${stats.attendancePercentage}%`, subtitle: 'Overall this semester', icon: <Calendar size={24} color="var(--accent-primary)" />, iconBg: 'var(--accent-light)', trend: { positive: attendanceNum >= 75, label: attendanceNum >= 75 ? 'Above 75% threshold' : 'Below 75% threshold' } },
    { title: 'Subjects', value: stats.subjectCount, subtitle: stats.courseName, icon: <GraduationCap size={24} color="var(--success)" />, iconBg: 'var(--accent-gold-light)' },
    { title: 'Study Materials', value: stats.studyMaterialsCount, subtitle: 'Available to download', icon: <BookOpen size={24} color="var(--accent-gold)" />, iconBg: 'var(--accent-light)' },
    { title: 'Notices', value: stats.noticesCount, subtitle: 'Campus announcements', icon: <Bell size={24} color="var(--accent-gold)" />, iconBg: 'var(--accent-gold-light)' },
    { title: 'Leave Requests', value: stats.leaveData.reduce((a, b) => a + b.value, 0), subtitle: 'Total submitted', icon: <FileText size={24} color="var(--danger)" />, iconBg: 'rgba(220,53,69,0.08)' },
  ];

  const trendChartData = stats.attendanceTrend.map(d => ({
    date: d.date,
    value: d.status === 'Present' ? 1 : d.status === 'Absent' ? 0 : null,
    label: d.status || 'No class',
  }));

  return (
    <div className="page-enter">
      <DashboardHero
        name={user?.name}
        role="Student"
        subtitle={`${stats.courseName} · Track your academic progress and stay updated.`}
      >
        {stats.presentStreak > 0 && (
          <div className="attendance-streak">
            <Flame size={16} />
            {stats.presentStreak}-day present streak
          </div>
        )}
        <div className="dashboard-hero__stat-pill">
          <strong>{stats.attendancePercentage}%</strong>
          <span>Attendance</span>
        </div>
        <div className="dashboard-hero__stat-pill">
          <strong>{stats.subjectCount}</strong>
          <span>Subjects</span>
        </div>
      </DashboardHero>

      <div className="stat-cards-grid">
        {statCards.map((card, i) => <StatCard key={i} {...card} />)}
      </div>

      <div className="dashboard-two-col">
        <ChartCard title="My Attendance (Last 14 Days)" height={360}>
          {trendChartData.some(d => d.value !== null) ? (
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 1]} ticks={[0, 1]} tickFormatter={(v) => v === 1 ? 'P' : 'A'} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(_, __, props) => [props.payload.label, 'Status']} {...tooltipProps} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={28}>
                    {trendChartData.map((d, i) => (
                      <Cell key={i} fill={d.value === 1 ? '#14805D' : d.value === 0 ? '#DC3545' : '#DDE5E1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <ChartEmpty message="No attendance records yet." />}
        </ChartCard>

        <RecentNoticesPanel notices={stats.recentNotices} showContent />
      </div>

      <h3 className="dashboard-section-title">Overview</h3>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <ChartCard title="Attendance Breakdown" height={380}>
          {stats.attendanceData.length > 0 ? (
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.attendanceData} cx="50%" cy="50%" outerRadius={100} innerRadius={60}
                    dataKey="value" labelLine={false} label={renderLabel} paddingAngle={3}>
                    {stats.attendanceData.map((_, i) => (
                      <Cell key={i} fill={ATTENDANCE_COLORS[i % 2]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} {...tooltipProps} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <ChartEmpty message="No attendance records yet." />}
        </ChartCard>

        <ChartCard title="Leave Requests Status" height={380}>
          {stats.leaveData.length > 0 ? (
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.leaveData} cx="50%" cy="50%" outerRadius={100} innerRadius={60}
                    dataKey="value" labelLine={false} label={renderLabel} paddingAngle={3}>
                    {stats.leaveData.map((entry, i) => (
                      <Cell key={i} fill={LEAVE_COLORS[entry.name] || '#0D6E4F'} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} {...tooltipProps} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <ChartEmpty message="No leave requests yet." />}
        </ChartCard>

        {stats.upcomingLeaves?.length > 0 && (
          <div className="card-panel dashboard-panel">
            <div className="dashboard-panel__header">
              <FileText size={18} color="var(--accent-gold)" />
              <h3>Upcoming Leaves</h3>
            </div>
            <ul className="dashboard-feed">
              {stats.upcomingLeaves.map((leave, i) => (
                <li key={i} className="dashboard-feed__item">
                  <div className="dashboard-feed__top">
                    <span className="dashboard-feed__title">{formatDate(leave.date)}</span>
                    <span className={`dashboard-badge badge-${leave.status.toLowerCase()}`}>{leave.status}</span>
                  </div>
                  <p className="dashboard-feed__desc">{leave.reason}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <h3 className="dashboard-section-title">My Course Subjects</h3>
      <div className="card-panel table-card">
        {stats.subjectList.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Subject Name</th><th>Faculty</th></tr>
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
