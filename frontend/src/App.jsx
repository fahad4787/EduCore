import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { APP_NAME } from './constants/brand';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import ProfessorLayout from './layouts/ProfessorLayout';
import StudentLayout from './layouts/StudentLayout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const TitleUpdater = () => {
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname;
    let title = APP_NAME;
    if (path.includes('/dashboard')) title = `Dashboard | ${APP_NAME}`;
    else if (path.includes('/attendance')) title = `Attendance | ${APP_NAME}`;
    else if (path.includes('/login')) title = `Sign In | ${APP_NAME}`;
    else if (path.includes('/profile')) title = `Profile | ${APP_NAME}`;
    else if (path.includes('/studymaterial')) title = `Study Material | ${APP_NAME}`;
    else if (path.includes('/leaves')) title = `Leaves | ${APP_NAME}`;
    else if (path.includes('/notices')) title = `Notices | ${APP_NAME}`;
    else if (path.includes('/courses')) title = `Courses | ${APP_NAME}`;
    else if (path.includes('/subjects')) title = `Subjects | ${APP_NAME}`;
    else if (path.includes('/students')) title = `Students | ${APP_NAME}`;
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
