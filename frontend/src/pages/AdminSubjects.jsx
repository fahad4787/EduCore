import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import FormModal from '../components/FormModal';
import TableLoading from '../components/TableLoading';
import TableActions from '../components/TableActions';
import { useToast } from '../context/ToastContext';

const AdminSubjects = () => {
  const { showToast } = useToast();
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

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', course: '', professor: '' });
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/subjects/${editingId}`, formData);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/subjects`, formData);
      }
      closeForm();
      fetchData();
      showToast(editingId ? 'Subject updated' : 'Subject created', 'success');
    } catch {
      showToast('Error saving subject', 'error');
    }
  };

  const handleDelete = (id) => setDeleteTarget(id);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/subjects/${deleteTarget}`);
      fetchData();
      showToast('Subject deleted', 'success');
    } catch {
      showToast('Error deleting subject', 'error');
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
    <div className="page-enter">
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
          <button className="btn btn-primary" onClick={openAddForm}>
            <FileText size={18} /> Add Subject
          </button>
        </div>
      </div>

      <FormModal
        isOpen={showForm}
        title={editingId ? 'Edit Subject' : 'Add Subject'}
        onClose={closeForm}
        onSubmit={handleSubmit}
        submitText={editingId ? 'Update' : 'Create'}
        size="lg"
      >
        <div className="form-modal-grid">
          <div className="form-group span-2">
            <label className="form-label">Subject Name</label>
            <input type="text" className="form-input" placeholder="Enter Subject Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
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
        </div>
      </FormModal>

      <div className="card-panel table-card">
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
            {loading ? <TableLoading cols={4} /> :
              filteredSubjects.map(sub => (
                <tr key={sub._id}>
                  <td>{sub.name}</td>
                  <td>{sub.course?.name || 'Unknown'}</td>
                  <td>{sub.professor?.name || 'Unassigned'}</td>
                  <td>
                    <TableActions onEdit={() => handleEdit(sub)} onDelete={() => handleDelete(sub._id)} />
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
