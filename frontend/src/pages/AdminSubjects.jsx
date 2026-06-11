import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Edit2, Trash2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
const AdminSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', course: '', professor: '' });
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      const [subRes, crsRes, profRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/subjects`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/courses`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users?role=Professor`)
      ]);
      setSubjects(subRes.data);
      setCourses(crsRes.data);
      setProfessors(profRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/subjects/${editingId}`, formData);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/subjects`, formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', course: '', professor: '' });
      fetchData();
    } catch {
      alert('Error saving subject');
    }
  };
  const handleDelete = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/subjects/${deleteTarget}`);
      fetchData();
    } catch {
      alert('Error deleting subject');
    } finally {
      setDeleteTarget(null);
    }
  };
  const handleEdit = (sub) => {
    setFormData({ name: sub.name, course: sub.course?._id || '', professor: sub.professor?._id || '' });
    setEditingId(sub._id);
    setShowForm(true);
  };
  const filteredSubjects = subjects.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse ? (sub.course?._id === filterCourse || sub.course === filterCourse) : true;
    return matchesSearch && matchesCourse;
  });

  return (
    <div>
      <div className="page-header">
        <h2>Manage Subjects</h2>
        <div className="page-header-actions">
          <input
            type="text"
            placeholder="Search subjects..."
            className="form-input"
            style={{ minWidth: '180px', flex: 1, marginBottom: 0, padding: '0.5rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-input"
            style={{ minWidth: '140px', flex: 1, marginBottom: 0, padding: '0.5rem' }}
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
          >
            <option value="">All Courses</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '', course: '', professor: '' }); }}>
            <FileText size={18} style={{ marginRight: '0.5rem' }} /> Add Subject
          </button>
        </div>
      </div>
      {showForm && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3>{editingId ? 'Edit' : 'Add'} Subject</h3>
          <form onSubmit={handleSubmit} className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Subject Name</label>
              <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Associated Course</label>
              <select className="form-input" value={formData.course} onChange={(e) => setFormData({ ...formData, course: e.target.value })} required>
                <option value="">Select Course</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Assigned Professor</label>
              <select className="form-input" value={formData.professor} onChange={(e) => setFormData({ ...formData, professor: e.target.value })}>
                <option value="">None (Unassigned)</option>
                {professors.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <button type="submit" className="btn btn-primary" style={{ marginRight: '1rem' }}>Save changes</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="glass-panel" style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Subject Name</th>
              <th>Course</th>
              <th>Professor</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="4" className="text-center">Loading...</td></tr> :
              filteredSubjects.map(sub => (
                <tr key={sub._id}>
                  <td>{sub.name}</td>
                  <td>{sub.course?.name || 'Unknown'}</td>
                  <td>{sub.professor?.name || 'Unassigned'}</td>
                  <td>
                    <button onClick={() => handleEdit(sub)} style={{ background: 'transparent', color: 'var(--accent-primary)', marginRight: '1rem' }}><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(sub._id)} style={{ background: 'transparent', color: 'var(--danger)' }}><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            {filteredSubjects.length === 0 && !loading && <tr><td colSpan="4" className="text-center">No Subjects found matching filters.</td></tr>}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Subject"
        message="Are you sure you want to delete this subject? This action cannot be undone."
        confirmText="Delete Subject"
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
export default AdminSubjects;
