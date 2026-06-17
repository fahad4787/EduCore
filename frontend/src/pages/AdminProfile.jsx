import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { UserCheck, User, Mail, Shield } from 'lucide-react';
import UserAvatar from '../components/UserAvatar';
import { useToast } from '../context/ToastContext';

const AdminProfile = () => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { email };
      if (password) payload.password = password;
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/users/${user._id}`, payload);
      const updatedUser = { ...user, email: res.data.email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      showToast('Profile updated successfully!', 'success');
      setPassword('');
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating profile', 'error');
    } finally {
      setSaving(false);
    }
  };

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
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>Administrator</p>
            </div>
          </div>
          {[
            { icon: <User size={18} />, label: 'Full Name', value: user?.name },
            { icon: <Mail size={18} />, label: 'Email', value: user?.email },
            { icon: <Shield size={18} />, label: 'Role', value: user?.role },
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
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Admin Email</label>
              <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">New Password <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(leave blank to keep unchanged)</span></label>
              <input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
              <UserCheck size={18} />
              {saving ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
