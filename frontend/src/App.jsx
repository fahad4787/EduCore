import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import ProfessorLayout from './layouts/ProfessorLayout';
import StudentLayout from './layouts/StudentLayout';
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};
const TitleUpdater = () => {
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname;
    let title = 'Nexus University of Technology';
    if (path.includes('/dashboard')) title = 'Dashboard - Nexus';
    else if (path.includes('/attendance')) title = 'Attendance - Nexus';
    else if (path.includes('/login')) title = 'Login - Nexus';
    else if (path.includes('/profile')) title = 'Profile - Nexus';
    else if (path.includes('/studymaterial')) title = 'Study Material - Nexus';
    else if (path.includes('/leaves')) title = 'Leaves - Nexus';
    else if (path.includes('/notices')) title = 'Notice Board - Nexus';
    else if (path.includes('/courses')) title = 'Courses - Nexus';
    else if (path.includes('/subjects')) title = 'Subjects - Nexus';
    else if (path.includes('/users')) title = 'Users - Nexus';
    else if (path.includes('/students')) title = 'Students - Nexus';
    document.title = title;
  }, [location]);
  return null;
};
const App = () => {
  const { user } = useContext(AuthContext);
  const getDashboardHome = () => {
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === 'Admin') return <Navigate to="/admin" replace />;
    if (user.role === 'Professor') return <Navigate to="/professor" replace />;
    if (user.role === 'Student') return <Navigate to="/student" replace />;
    return <Navigate to="/login" replace />;
  };
  return (
    <Router>
      <TitleUpdater />
      <Routes>
        <Route path="/" element={getDashboardHome()} />
        <Route path="/login" element={!user ? <Login /> : getDashboardHome()} />
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminLayout />
          </ProtectedRoute>
        } />
        <Route path="/professor/*" element={
          <ProtectedRoute allowedRoles={['Professor']}>
            <ProfessorLayout />
          </ProtectedRoute>
        } />
        <Route path="/student/*" element={
          <ProtectedRoute allowedRoles={['Student']}>
            <StudentLayout />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};
export default App;
