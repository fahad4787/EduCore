import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, UserCheck, UserX } from 'lucide-react';
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
    { title: 'Total Days', value: totalDays, icon: <Calendar size={24} color="var(--accent-primary)" />, bg: 'rgba(59, 130, 246, 0.1)' },
    { title: 'Present', value: presentDays, icon: <UserCheck size={24} color="var(--success)" />, bg: 'rgba(16, 185, 129, 0.1)' },
    { title: 'Absent', value: absentDays, icon: <UserX size={24} color="var(--danger)" />, bg: 'rgba(239, 68, 68, 0.1)' },
  ];
  if (loading) {
    return <div>Loading attendance...</div>;
  }
  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Attendance Overview</h2>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
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
      <h2 style={{ marginBottom: '2rem' }}>My Attendance</h2>
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
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
