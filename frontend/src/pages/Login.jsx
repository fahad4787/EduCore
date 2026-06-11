import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import DDULogo from "../assets/DDU-logo.jpg";
import CollegeBg from "../assets/DDU-College.jpg";
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const userData = await login(email, password);
      if (userData.role === 'Admin') navigate('/admin');
      if (userData.role === 'Professor') navigate('/professor');
      if (userData.role === 'Student') navigate('/student');
    } catch (err) {
      setError(err);
    }
  };
  return (
    <div className="app-container" style={{
      justifyContent: 'center',
      alignItems: 'center',
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${CollegeBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', background: 'rgba(255, 255, 255, 0.6)' }}>
        <div className="text-center mb-4">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ padding: '0.2rem', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '90px', height: '90px', overflow: 'hidden', border: '3px solid var(--accent-primary)', boxShadow: 'var(--shadow-md)' }}>
              <img src={DDULogo} alt="Nexus Logo" style={{ width: '100%', height: 'auto' }} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Nexus University</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: '500', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.85rem' }}>LOGIN</p>
        </div>
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--danger)', padding: '1rem', marginBottom: '1.5rem', borderRadius: '0 var(--radius-md) var(--radius-md) 0', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AlertCircle size={20} color="var(--danger)" />
            <span style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="password"
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••••••"
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.875rem' }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};
export default Login;
