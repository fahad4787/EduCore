import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, UserCheck, UserX } from 'lucide-react';
import Loader from '../components/Loader';
import StatCard from '../components/StatCard';
const StudentAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/student/attendance`);
        setAttendance(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };
  const totalDays = attendance.length;
  const presentDays = attendance.filter(a => a.status === 'Present').length;
  const absentDays = attendance.filter(a => a.status === 'Absent').length;
  const statCards = [
    { title: 'Total Days', value: totalDays, icon: <Calendar size={24} color="var(--accent-primary)" />, iconBg: 'var(--accent-light)' },
    { title: 'Present', value: presentDays, icon: <UserCheck size={24} color="var(--success)" />, iconBg: 'var(--accent-light)' },
    { title: 'Absent', value: absentDays, icon: <UserX size={24} color="var(--danger)" />, iconBg: 'rgba(220,53,69,0.08)' },
  ];
  if (loading) return <Loader text="Loading attendance..." full />;
  return (
    <div className="page-enter">
      <h2 style={{ marginBottom: '2rem' }}>Attendance Overview</h2>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>
      <h2 style={{ marginBottom: '2rem' }}>My Attendance</h2>
      <div className="card-panel table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Professor</th>
              <th>Course</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map(record => (
              <tr key={record._id}>
                <td>{formatDate(record.date)}</td>
                <td>{record.markedBy?.name || 'Unknown'}</td>
                <td>{record.course?.name || 'Unknown'}</td>
                <td>
                  <span style={{
                    color: record.status === 'Present' ? 'var(--success)' : 'var(--danger)',
                    fontWeight: '500'
                  }}>
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
            {attendance.length === 0 && <tr><td colSpan="4" className="text-center">No attendance records found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default StudentAttendance;
