import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import ProfDashboard from '../pages/ProfDashboard';
import ProfStudents from '../pages/ProfStudents';
import ProfAttendance from '../pages/ProfAttendance';
import ProfMaterials from '../pages/ProfMaterials';
import ManageLeaves from '../pages/ManageLeaves';
import NoticeBoard from '../pages/NoticeBoard';
import ProfProfile from '../pages/ProfProfile';

const ProfessorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const routes = [
    { path: '/professor/dashboard',     name: 'Dashboard' },
    { path: '/professor/students',      name: 'My Students' },
    { path: '/professor/attendance',    name: 'Attendance' },
    { path: '/professor/studymaterial', name: 'Study Material' },
    { path: '/professor/leaves',        name: 'Leave Approvals' },
    { path: '/professor/notices',       name: 'Notice Board' },
    { path: '/professor/profile',       name: 'Profile' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', maxHeight: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <Sidebar
        routes={routes}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="prof-layout-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ position: 'sticky', top: 0, zIndex: 50, flexShrink: 0 }}>
          <TopNav title="Professor Portal" onMenuToggle={() => setSidebarOpen(prev => !prev)} />
        </div>
        <div style={{ padding: '1.5rem 2rem', flex: 1, overflowY: 'auto', height: '100%' }}>
          <Routes>
            <Route path="/"              element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"     element={<ProfDashboard />} />
            <Route path="students"      element={<ProfStudents />} />
            <Route path="attendance"    element={<ProfAttendance />} />
            <Route path="studymaterial" element={<ProfMaterials />} />
            <Route path="leaves"        element={<ManageLeaves />} />
            <Route path="notices"       element={<NoticeBoard />} />
            <Route path="profile"       element={<ProfProfile />} />
            <Route path="*"             element={<ProfDashboard />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default ProfessorLayout;

