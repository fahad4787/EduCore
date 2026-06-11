import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { UserCheck, User, Mail, BookOpen } from 'lucide-react';

const ProfProfile = () => {
  const { user } = useContext(AuthContext);
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const payload = { email };
      if (password) payload.password = password;

      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/professor/profile`, payload);

      // Update localStorage
      const updatedUser = { ...user, email: res.data.email };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setMessage({ text: 'Profile updated successfully! Refreshing...', type: 'success' });
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Error updating profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>

        {/* Info Card */}
        <div className="glass-panel" style={{ padding: '2rem', height: '100%', boxSizing: 'border-box' }}>
          <h3 style={{ marginBottom: '1.9rem', color: 'var(--text-secondary)', fontSize: '1rem' }}>Profile Info</h3>

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.75rem', fontWeight: 'bold', color: 'white',
              flexShrink: 0,
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontWeight: '600', fontSize: '1.2rem' }}>{user?.name}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Professor</p>
            </div>
          </div>

          {/* Details */}
          {[
            { icon: <User size={18} />, label: 'Full Name', value: user?.name },
            { icon: <Mail size={18} />, label: 'Email', value: user?.email },
            {
              icon: <BookOpen size={18} />, label: 'Role',
              value: (() => {
                const courses = user?.assignedCourses;
                if (!courses || courses.length === 0) return 'Professor';
                const names = courses.map(c => typeof c === 'object' ? c.name : c).join(', ');
                return `Professor (${names})`;
              })(),
            },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '1.9rem',
              padding: '0.875rem 0',
              borderBottom: i < 2 ? '1px solid var(--border-color)' : 'none',
            }}>
              <span style={{ color: 'var(--accent-primary)', flexShrink: 0 }}>{item.icon}</span>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>{item.label}</p>
                <p style={{ fontWeight: '500' }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Update Form */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.7rem', color: 'var(--text-secondary)', fontSize: '1rem' }}>Update Profile</h3>

          {message.text && (
            <div style={{
              padding: '0.875rem 1rem',
              marginBottom: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: message.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
              fontSize: '0.875rem',
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.00rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(leave blank to keep unchanged)</span></label>
              <input
                type="password"
                className="form-input"
                value={password}
                placeholder="Enter new password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                placeholder="Re-enter new password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <UserCheck size={18} />
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ProfProfile;
