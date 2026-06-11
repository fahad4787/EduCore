import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Bell, Trash2, PlusCircle } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';
const NoticeBoard = () => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', audience: 'All' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const getApiEndpoint = () => {
    if (user.role === 'Admin') return `${import.meta.env.VITE_API_URL}/api/admin/notices`;
    if (user.role === 'Professor') return `${import.meta.env.VITE_API_URL}/api/professor/notices`;
    return `${import.meta.env.VITE_API_URL}/api/student/notices`;
  };
  useEffect(() => {
    fetchNotices();
  }, [user.role]);
  const fetchNotices = async () => {
    try {
      const res = await axios.get(getApiEndpoint());
      setNotices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user.role !== 'Admin') return;
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/notices`, formData);
      setShowForm(false);
      setFormData({ title: '', content: '', audience: 'All' });
      fetchNotices();
    } catch {
      showToast('Error saving notice', 'error');
    }
  };
  const handleDelete = (id) => {
    if (user.role !== 'Admin') return;
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/notices/${deleteTarget}`);
      fetchNotices();
    } catch {
      showToast('Error deleting notice', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };
  return (
    <div>
      <div className="page-header">
        <h2>Notice Board</h2>
        {user.role === 'Admin' && (
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              <PlusCircle size={18} style={{ marginRight: '0.5rem' }} /> Add Notice
            </button>
          </div>
        )}
      </div>
      {showForm && user.role === 'Admin' && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3>Add New Notice</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input type="text" className="form-input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea className="form-input" rows="4" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">Audience</label>
              <select className="form-input" value={formData.audience} onChange={(e) => setFormData({ ...formData, audience: e.target.value })}>
                <option value="All">All Users</option>
                <option value="Admin">Admin Only</option>
                <option value="Professor">Professors</option>
                <option value="Student">Students</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginRight: '1rem' }}>Publish Notice</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        </div>
      )}
      {loading ? <p>Loading notices...</p> : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {notices.map(notice => (
            <div key={notice._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div className="flex justify-between items-start mb-2">
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bell size={18} color="var(--accent-primary)" />
                  {notice.title}
                </h3>
                {user.role === 'Admin' && (
                  <button onClick={() => handleDelete(notice._id)} style={{ background: 'transparent', color: 'var(--danger)' }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                <span style={{ marginRight: '1rem' }}>{formatDate(notice.createdAt)}</span>
                <span style={{ background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                  Audience: {notice.audience}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', flex: 1, whiteSpace: 'pre-wrap' }}>{notice.content}</p>
              {notice.createdBy && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Posted by: {notice.createdBy.name}
                </div>
              )}
            </div>
          ))}
          {notices.length === 0 && <p className="text-center" style={{ gridColumn: '1 / -1' }}>No notices available.</p>}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Notice"
        message="Are you sure you want to delete this notice? This action cannot be undone."
        confirmText="Delete Notice"
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
export default NoticeBoard;
