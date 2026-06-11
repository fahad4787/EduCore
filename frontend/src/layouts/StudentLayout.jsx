import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';
import StudentDashboard from '../pages/StudentDashboard';
import StudentProfile from '../pages/StudentProfile';
import StudentAttendance from '../pages/StudentAttendance';
import StudentMaterials from '../pages/StudentMaterials';
import StudentLeaves from '../pages/StudentLeaves';
import NoticeBoard from '../pages/NoticeBoard';

const StudentLayout = () => {
  const routes = [
    { path: '/student/dashboard', name: 'Dashboard' },
    { path: '/student/profile', name: 'Profile' },
    { path: '/student/attendance', name: 'Attendance' },
    { path: '/student/studymaterial', name: 'Study Material' },
    { path: '/student/leaves', name: 'Leaves' },
    { path: '/student/notices', name: 'Notice Board' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <StudentNavbar routes={routes} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem' }}>
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="studymaterial" element={<StudentMaterials />} />
          <Route path="leaves" element={<StudentLeaves />} />
          <Route path="notices" element={<NoticeBoard />} />
          <Route path="*" element={<StudentDashboard />} />
        </Routes>
      </div>
    </div>
  );
};

export default StudentLayout;

