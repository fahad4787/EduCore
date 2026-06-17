import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import InputField from '../components/InputField';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const userData = await login(email, password);
      if (userData.role === 'Admin') navigate('/admin');
      if (userData.role === 'Professor') navigate('/professor');
      if (userData.role === 'Student') navigate('/student');
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="login-hero__pattern" />
        <div className="login-hero__orb login-hero__orb--1" />
        <div className="login-hero__orb login-hero__orb--2" />
        <div className="login-hero__content">
          <BrandLogo size="lg" variant="light" />
          <h1 className="login-hero__headline">
            Manage Your Campus <span>Smarter</span>
          </h1>
          <p className="login-hero__desc">
            A unified platform for students, faculty, and administrators to manage courses, attendance, results, and more.
          </p>
          <div className="login-hero__features">
            <div className="login-hero__feature">
              <span className="login-hero__feature-dot" />
              Role-based dashboards for every user
            </div>
            <div className="login-hero__feature">
              <span className="login-hero__feature-dot" />
              Real-time attendance and academic tracking
            </div>
            <div className="login-hero__feature">
              <span className="login-hero__feature-dot" />
              Secure access with JWT authentication
            </div>
          </div>
        </div>
      </div>

      <div className="login-form-side">
        <div className="card-panel login-card">
          <div className="login-card__header">
            <BrandLogo />
            <h2 className="login-card__title">Welcome back</h2>
            <p className="login-card__subtitle">Sign in to your account to continue</p>
            <div className="login-card__roles">
              <span className="login-card__role">Admin</span>
              <span className="login-card__role">Professor</span>
              <span className="login-card__role">Student</span>
            </div>
          </div>

          {error && (
            <div className="alert-error" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <InputField
              id="email"
              label="Email Address"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              required
            />
            <InputField
              id="password"
              label="Password"
              type="password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <button type="submit" className="btn btn-primary login-submit" disabled={submitting}>
              {submitting ? (
                <span className="loader-spinner sm" />
              ) : (
                <><LogIn size={18} /> Sign In</>
              )}
            </button>
          </form>

          <div className="login-demo-creds">
            <p className="login-demo-creds__title">Demo accounts (after seeding)</p>
            <div className="login-demo-creds__grid">
              <button type="button" className="login-demo-creds__item" onClick={() => { setEmail('admin@university.com'); setPassword('admin123'); }}>
                <strong>Admin</strong>
                <span>admin@university.com</span>
              </button>
              <button type="button" className="login-demo-creds__item" onClick={() => { setEmail('prof.qandeer@university.com'); setPassword('prof123'); }}>
                <strong>Professor</strong>
                <span>prof.qandeer@university.com</span>
              </button>
              <button type="button" className="login-demo-creds__item" onClick={() => { setEmail('qandeer@gmail.com'); setPassword('qanderr123'); }}>
                <strong>Student</strong>
                <span>qandeer@gmail.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
