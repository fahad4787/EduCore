import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Loader';
import {
  User, Mail, Phone, BookOpen, MapPin, Calendar,
  Shield, UserCheck, Hash, Heart, Lock, Save
} from 'lucide-react';

const Field = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
    <span style={{ color: 'var(--accent-primary)', marginTop: '0.1rem', flexShrink: 0 }}>{icon}</span>
    <div style={{ minWidth: 0 }}>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>{label}</p>
      <p style={{ fontWeight: '500', wordBreak: 'break-word' }}>{value || '—'}</p>
    </div>
  </div>
);

const StudentProfile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/profile`);
        setProfile(res.data);
        setEmail(res.data.email || '');
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPwd) {
      setMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const payload = { email };
      if (password) payload.password = password;
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/student/profile`, payload);
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, email: res.data.email }));
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setPassword(''); setConfirmPwd('');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading profile..." full />;
  if (!profile) return <div>Could not load profile.</div>;

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
  const initials = profile.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="profile-page page-enter">
      <div className="page-header">
        <h2 style={{ margin: 0 }}>My Profile</h2>
      </div>
      <div className="profile-grid" style={{ gridTemplateColumns: '1fr 1.2fr' }}>

        {/* ── LEFT: Avatar + quick info ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Avatar card */}
          <div className="card-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{
              width: '90px', height: '90px', borderRadius: '50%',
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: '700', color: 'white',
              margin: '0 auto 1.25rem',
              boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
            }}>{initials}</div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '0.25rem' }}>{profile.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginBottom: '1rem' }}>{profile.email}</p>

            {/* Course badge */}
            <div style={{
              display: 'inline-block', padding: '0.35rem 1rem',
              borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600',
              background: 'rgba(99,102,241,0.15)', color: 'var(--accent-primary)',
            }}>
              {profile.enrolledCourse?.name || 'No Course'}
            </div>
          </div>

          {/* Enrollment + IDs */}
          <div className="card-panel" style={{ padding: '1.5rem' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Student ID</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Hash size={18} color="var(--accent-primary)" />
              <span style={{ fontWeight: '600', fontSize: '1.05rem', letterSpacing: '0.05em' }}>
                {profile.enrollmentNumber || 'Not assigned'}
              </span>
            </div>
          </div>

          {/* Status badges */}
          <div className="card-panel" style={{ padding: '1.5rem' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Status</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                { label: 'Category', value: profile.category || 'N/A' },
                { label: 'Gender', value: profile.gender || 'N/A' },
                { label: 'Handicapped', value: profile.isHandicapped ? 'Yes' : 'No' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                  <span style={{ fontWeight: '500' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Details + Edit ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Personal Information */}
          <div className="card-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0 2rem' }}>
              <Field icon={<User size={15} />} label="Full Name" value={profile.name} />
              <Field icon={<Mail size={15} />} label="Email" value={profile.email} />
              <Field icon={<Phone size={15} />} label="Mobile" value={profile.mobileNumber} />
              <Field icon={<Calendar size={15} />} label="Date of Birth" value={formatDate(profile.dateOfBirth)} />
              <Field icon={<BookOpen size={15} />} label="Enrolled Course" value={profile.enrolledCourse?.name} />
              <Field icon={<Shield size={15} />} label="Category" value={profile.category} />
              <Field icon={<MapPin size={15} />} label="City" value={profile.address?.city} />
              <Field icon={<MapPin size={15} />} label="State / Pincode" value={profile.address ? `${profile.address.state} – ${profile.address.pincode}` : '—'} />
            </div>
          </div>

          {/* Parent Info */}
          <div className="card-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>Parent / Guardian</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0 2rem' }}>
              <Field icon={<Heart size={15} />} label="Parent Name" value={profile.parentName} />
              <Field icon={<Phone size={15} />} label="Parent Contact" value={profile.parentContact} />
            </div>
          </div>

          {/* Account Settings */}
          <div className="card-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>Account Settings</h3>

            {message.text && (
              <div style={{
                padding: '0.75rem 1rem', marginBottom: '1.25rem', borderRadius: 'var(--radius-md)',
                background: message.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
                fontSize: '0.875rem',
              }}>{message.text}</div>
            )}

            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label"><Mail size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />Email Address</label>
                <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label"><Lock size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />New Password</label>
                <input type="password" className="form-input" value={password} placeholder="Leave blank to keep" onChange={e => setPassword(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label"><Lock size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />Confirm Password</label>
                <input type="password" className="form-input" value={confirmPwd} placeholder="Re-enter new password" onChange={e => setConfirmPwd(e.target.value)} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserCheck size={17} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
