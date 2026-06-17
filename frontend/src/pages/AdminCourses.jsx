import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import FormModal from '../components/FormModal';
import TableLoading from '../components/TableLoading';
import TableActions from '../components/TableActions';
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

  const resetForm = () => {
    setEditingCourseId(null);
    setCourseFormData({ name: '', description: '', duration: '' });
  };

  const openAddForm = () => {
    resetForm();
    setShowCourseForm(true);
  };

  const closeForm = () => {
    setShowCourseForm(false);
    resetForm();
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourseId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/courses/${editingCourseId}`, courseFormData);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/courses`, courseFormData);
      }
      closeForm();
      fetchData();
      showToast(editingCourseId ? 'Course updated' : 'Course created', 'success');
    } catch {
      showToast('Error saving course', 'error');
    }
  };

  const handleDeleteCourse = (id) => setDeleteTarget(id);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/courses/${deleteTarget}`);
      fetchData();
      showToast('Course deleted', 'success');
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
    <div className="page-enter">
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
          <button className="btn btn-primary" onClick={openAddForm}>
            <BookOpen size={18} /> Add Course
          </button>
        </div>
      </div>

      <FormModal
        isOpen={showCourseForm}
        title={editingCourseId ? 'Edit Course' : 'Add Course'}
        onClose={closeForm}
        onSubmit={handleCourseSubmit}
        submitText={editingCourseId ? 'Update' : 'Create'}
        size="lg"
      >
        <div className="form-modal-grid">
          <div className="form-group">
            <label className="form-label">Course Name</label>
            <input type="text" className="form-input" placeholder="Enter Course Name" value={courseFormData.name} onChange={(e) => setCourseFormData({ ...courseFormData, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Duration</label>
            <input type="text" className="form-input" placeholder="Enter Duration" value={courseFormData.duration} onChange={(e) => setCourseFormData({ ...courseFormData, duration: e.target.value })} required />
          </div>
          <div className="form-group span-2">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows="3" placeholder="Enter Description" value={courseFormData.description} onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })} />
          </div>
        </div>
      </FormModal>

      <div className="card-panel table-card">
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
            {loading ? <TableLoading cols={4} /> :
              filteredCourses.map(course => (
                <tr key={course._id}>
                  <td>{course.name}</td>
                  <td>{course.duration}</td>
                  <td style={{ whiteSpace: 'normal', maxWidth: '320px' }}>{course.description}</td>
                  <td>
                    <TableActions onEdit={() => handleEditCourse(course)} onDelete={() => handleDeleteCourse(course._id)} />
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
