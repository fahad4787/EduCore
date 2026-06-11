import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Edit2, Trash2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';
const AdminCourses = () => {
  const { showToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDuration, setFilterDuration] = useState('');
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseFormData, setCourseFormData] = useState({ name: '', description: '', duration: '' });
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      const coursesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/courses`);
      setCourses(coursesRes.data);
    } catch {
      console.error('Error fetching courses');
    } finally {
      setLoading(false);
    }
  };
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourseId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/courses/${editingCourseId}`, courseFormData);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/courses`, courseFormData);
      }
      setShowCourseForm(false);
      setEditingCourseId(null);
      setCourseFormData({ name: '', description: '', duration: '' });
      fetchData();
    } catch {
      showToast('Error saving course', 'error');
    }
  };
  const handleDeleteCourse = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/courses/${deleteTarget}`);
      fetchData();
    } catch {
      showToast('Error deleting course', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };
  const handleEditCourse = (course) => {
    setCourseFormData({ name: course.name, description: course.description, duration: course.duration });
    setEditingCourseId(course._id);
    setShowCourseForm(true);
  };
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDuration = filterDuration ? course.duration.toString() === filterDuration : true;
    return matchesSearch && matchesDuration;
  });

  return (
    <div>
      <div className="page-header">
        <h2>Manage Courses</h2>
        <div className="page-header-actions">
          <input
            type="text"
            placeholder="Search courses..."
            className="form-input"
            style={{ minWidth: '180px', flex: 1, marginBottom: 0, padding: '0.5rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-input"
            style={{ minWidth: '140px', flex: 1, marginBottom: 0, padding: '0.5rem' }}
            value={filterDuration}
            onChange={(e) => setFilterDuration(e.target.value)}
          >
            <option value="">All Durations</option>
            <option value="2">2 Years</option>
            <option value="3">3 Years</option>
            <option value="4">4 Years</option>
          </select>
          <button className="btn btn-primary" onClick={() => { setShowCourseForm(!showCourseForm); setEditingCourseId(null); setCourseFormData({ name: '', description: '', duration: '' }); }}>
            <BookOpen size={18} style={{ marginRight: '0.5rem' }} /> Add Course
          </button>
        </div>
      </div>
      {showCourseForm && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3>{editingCourseId ? 'Edit' : 'Add'} Course</h3>
          <form onSubmit={handleCourseSubmit} className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Course Name</label>
              <input type="text" className="form-input" placeholder="Enter Course Name" value={courseFormData.name} onChange={(e) => setCourseFormData({ ...courseFormData, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Duration</label>
              <input type="text" className="form-input" placeholder="Enter Duration" value={courseFormData.duration} onChange={(e) => setCourseFormData({ ...courseFormData, duration: e.target.value })} required />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Description</label>
              <textarea className="form-input" rows="3" placeholder="Enter Description" value={courseFormData.description} onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}></textarea>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <button type="submit" className="btn btn-primary" style={{ marginRight: '1rem' }}>Save changes</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCourseForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      <div className="glass-panel" style={{ overflowX: 'auto', marginBottom: '3rem' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Course Name</th>
              <th>Duration</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="4" className="text-center">Loading...</td></tr> :
              filteredCourses.map(course => (
                <tr key={course._id}>
                  <td>{course.name}</td>
                  <td>{course.duration}</td>
                  <td>{course.description}</td>
                  <td>
                    <button onClick={() => handleEditCourse(course)} style={{ background: 'transparent', color: 'var(--accent-primary)', marginRight: '1rem' }}><Edit2 size={18} /></button>
                    <button onClick={() => handleDeleteCourse(course._id)} style={{ background: 'transparent', color: 'var(--danger)' }}><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            {filteredCourses.length === 0 && !loading && <tr><td colSpan="4" className="text-center">No Courses found matching filters.</td></tr>}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Course"
        message="Warning: This may affect related subjects and students. Proceed?"
        confirmText="Delete Course"
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
export default AdminCourses;
