import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { UserCheck, User, Mail, BookOpen } from 'lucide-react';
import UserAvatar from '../components/UserAvatar';

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

  const courseLabel = (() => {
    const courses = user?.assignedCourses;
    if (!courses || courses.length === 0) return 'Professor';
    const names = courses.map(c => typeof c === 'object' ? c.name : c).join(', ');
    return `Professor (${names})`;
  })();

  return (
    <div className="profile-page page-enter">
      <div className="page-header">
        <h2 style={{ margin: 0 }}>Update Profile</h2>
      </div>
      <div className="profile-grid">
        <div className="card-panel profile-card">
          <h3>Profile Info</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
            <UserAvatar name={user?.name} size={72} />
            <div>
              <p style={{ fontWeight: '600', fontSize: '1.2rem', margin: 0 }}>{user?.name}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>Professor</p>
            </div>
          </div>
          {[
            { icon: <User size={18} />, label: 'Full Name', value: user?.name },
            { icon: <Mail size={18} />, label: 'Email', value: user?.email },
            { icon: <BookOpen size={18} />, label: 'Role', value: courseLabel },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 0', borderBottom: i < 2 ? '1px solid var(--border-light)' : 'none' }}>
              <span style={{ color: 'var(--accent-primary)', flexShrink: 0 }}>{item.icon}</span>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>{item.label}</p>
                <p style={{ fontWeight: '500', margin: 0 }}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card-panel profile-card">
          <h3>Update Credentials</h3>
          {message.text && (
            <div className={`alert-error${message.type === 'success' ? '' : ''}`} style={{
              marginBottom: '1.25rem',
              background: message.type === 'success' ? 'var(--accent-light)' : undefined,
              borderLeftColor: message.type === 'success' ? 'var(--success)' : undefined,
              color: message.type === 'success' ? 'var(--success)' : undefined,
            }}>
              {message.text}
            </div>
          )}
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">New Password <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(leave blank to keep unchanged)</span></label>
              <input type="password" className="form-input" value={password} placeholder="Enter new password" onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" value={confirmPassword} placeholder="Re-enter new password" onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start' }}>
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
