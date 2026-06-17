import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import FormModal from '../components/FormModal';
import TableLoading from '../components/TableLoading';
import TableActions from '../components/TableActions';
import { useToast } from '../context/ToastContext';
const AdminUsers = ({ userRole }) => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: userRole, enrolledCourse: '', assignedCourses: [],
    selectedSubjects: [],
    gender: '', dateOfBirth: '', mobileNumber: '', category: '',
    city: '', state: '', pincode: '', parentName: '', parentContact: '', isHandicapped: 'false'
  });
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  useEffect(() => {
    fetchUsers();
    if (userRole === 'Student' || userRole === 'Professor') {
      fetchCourses();
    }
    if (userRole === 'Professor') {
      fetchAllSubjects();
    }
  }, [userRole]);
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users?role=${userRole}`);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const fetchAllSubjects = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/subjects`);
      setAllSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/courses`);
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchSubjectsByCourse = async (courseId) => {
    if (!courseId) { setSubjects([]); return; }
    setLoadingSubjects(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/subjects/by-course/${courseId}`);
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubjects(false);
    }
  };
  const handleCourseChange = (courseId) => {
    setFormData(prev => ({ ...prev, assignedCourses: courseId ? [courseId] : [], selectedSubjects: [] }));
    fetchSubjectsByCourse(courseId);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (userRole === 'Student') {
        payload.address = { city: formData.city, state: formData.state, pincode: formData.pincode };
      }
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/users/${editingId}`, payload);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/users`, payload);
      }
      setShowForm(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving user', 'error');
    }
  };
  const resetForm = () => {
    setEditingId(null);
    setSubjects([]);
    setFormData({
      name: '', email: '', password: '', role: userRole, enrolledCourse: '', assignedCourses: [],
      selectedSubjects: [],
      gender: '', dateOfBirth: '', mobileNumber: '', category: '',
      city: '', state: '', pincode: '', parentName: '', parentContact: '', isHandicapped: 'false'
    });
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleDelete = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/users/${deleteTarget}`);
      fetchUsers();
    } catch {
      showToast('Error deleting user', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };
  const handleEdit = async (user) => {
    const courseId = user.assignedCourses?.[0]?._id || user.assignedCourses?.[0] || '';
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      enrolledCourse: user.enrolledCourse?._id || '',
      assignedCourses: courseId ? [courseId] : [],
      selectedSubjects: [],
      gender: user.gender || '',
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      mobileNumber: user.mobileNumber || '',
      category: user.category || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      pincode: user.address?.pincode || '',
      parentName: user.parentName || '',
      parentContact: user.parentContact || '',
      isHandicapped: user.isHandicapped ? 'true' : 'false'
    });
    setEditingId(user._id);
    setShowForm(true);
    // Fetch subjects for the professor's current course and pre-select owned ones
    if (courseId) {
      setLoadingSubjects(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/subjects/by-course/${courseId}`);
        setSubjects(res.data);
        const owned = res.data
          .filter(s => s.professor?._id?.toString() === user._id?.toString())
          .map(s => s._id);
        setFormData(prev => ({ ...prev, selectedSubjects: owned }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSubjects(false);
      }
    }
  };
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesCourse = true;
    if (filterCourse) {
      if (userRole === 'Student') {
        matchesCourse = user.enrolledCourse?._id === filterCourse || user.enrolledCourse === filterCourse;
      } else if (userRole === 'Professor') {
        matchesCourse = user.assignedCourses?.some(c => c._id === filterCourse || c === filterCourse);
      }
    }
    return matchesSearch && matchesCourse;
  });

  return (
    <div>
      <div className="page-header">
        <h2>Manage {userRole}s</h2>
        <div className="page-header-actions">
          <input
            type="text"
            placeholder={`Search ${userRole.toLowerCase()}s...`}
            className="form-input"
            style={{ minWidth: '180px', flex: 1, marginBottom: 0, padding: '0.5rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {(userRole === 'Student' || userRole === 'Professor') && (
            <select
              className="form-input"
              style={{ minWidth: '140px', flex: 1, marginBottom: 0, padding: '0.5rem' }}
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
            >
              <option value="">All Courses</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          )}
          <button className="btn btn-primary" onClick={openAddForm}>
            <UserPlus size={18} /> Add {userRole}
          </button>
        </div>
      </div>
      <FormModal
        isOpen={showForm}
        title={`${editingId ? 'Edit' : 'Add'} ${userRole}`}
        onClose={closeForm}
        onSubmit={handleSubmit}
        submitText={editingId ? 'Update' : 'Create'}
        size="lg"
      >
        <div className="form-modal-grid">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input type="text" className="form-input" placeholder="Enter Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" placeholder="Enter Email Address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password {editingId && '(Leave blank to keep unchanged)'}</label>
              <input type="password" className="form-input" placeholder="Enter Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!editingId} />
            </div>
            {userRole === 'Student' && (
              <>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <h4 style={{ margin: '0.5rem 0', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>Academic Details</h4>
                </div>
                <div className="form-group">
                  <label className="form-label">Enrolled Course</label>
                  <select className="form-input" value={formData.enrolledCourse} onChange={(e) => setFormData({ ...formData, enrolledCourse: e.target.value })} required>
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                    <option value="">Select Category</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <h4 style={{ margin: '0.5rem 0', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>Personal Details</h4>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" className="form-input" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-input" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input type="tel" className="form-input" pattern="[0-9]{10}" title="Must be exactly 10 digits" maxLength="10" placeholder="Enter Mobile Number" value={formData.mobileNumber} onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Physical Handicap</label>
                  <select className="form-input" value={formData.isHandicapped} onChange={(e) => setFormData({ ...formData, isHandicapped: e.target.value })}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <h4 style={{ margin: '0.5rem 0', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>Address Details</h4>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">City</label>
                  <input type="text" className="form-input" placeholder="Enter City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input type="text" className="form-input" placeholder="Enter State" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input type="text" className="form-input" placeholder="Enter Pincode" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <h4 style={{ margin: '0.5rem 0', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>Parent/Guardian Details</h4>
                </div>
                <div className="form-group">
                  <label className="form-label">Parent's Name</label>
                  <input type="text" className="form-input" placeholder="Enter Parent's Name" value={formData.parentName} onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Parent's Contact</label>
                  <input type="tel" className="form-input" pattern="[0-9]{10}" title="Must be exactly 10 digits" maxLength="10" placeholder="Enter Parent's Contact Number" value={formData.parentContact} onChange={(e) => setFormData({ ...formData, parentContact: e.target.value.replace(/\D/g, '').slice(0, 10) })} />
                </div>
              </>
            )}
            {userRole === 'Professor' && (
              <>
                {/* Step 1: Course */}
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Step 1 — Assign Course</label>
                  <select
                    className="form-input"
                    value={formData.assignedCourses[0] || ''}
                    onChange={e => handleCourseChange(e.target.value)}
                    required
                  >
                    <option value="">Select a Course</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Step 2: Subjects for selected course */}
                {formData.assignedCourses.length > 0 && (
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" style={{ marginBottom: '0.75rem' }}>
                      Select Subject

                    </label>
                    {loadingSubjects ? (
                      <p style={{ color: 'var(--text-muted)', padding: '0.5rem' }}>Loading subjects...</p>
                    ) : (
                      <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                        gap: '0.5rem', padding: '1rem',
                        background: 'rgba(0,0,0,0.03)', borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                      }}>
                        {subjects
                          .filter(s => !s.professor || s.professor._id?.toString() === editingId?.toString())
                          .map(sub => (
                            <label key={sub._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0 }}>
                              <input
                                type="checkbox"
                                checked={formData.selectedSubjects.includes(sub._id)}
                                onChange={e => {
                                  const checked = e.target.checked;
                                  setFormData(prev => ({
                                    ...prev,
                                    selectedSubjects: checked
                                      ? [...prev.selectedSubjects, sub._id]
                                      : prev.selectedSubjects.filter(id => id !== sub._id)
                                  }));
                                }}
                                style={{ margin: 0, width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                              />
                              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{sub.name}</span>
                            </label>
                          ))
                        }
                        {subjects.filter(s => !s.professor || s.professor._id?.toString() === editingId?.toString()).length === 0 && (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', gridColumn: '1/-1' }}>All subjects in this course are already assigned.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
        </div>
      </FormModal>
      <div className="card-panel table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              {userRole === 'Student' && <th>Enrollment ID</th>}
              <th>Email</th>
              {userRole === 'Student' && <th>Course</th>}
              {userRole === 'Professor' && <th>Assigned Course</th>}
              {userRole === 'Professor' && <th>Subject</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <TableLoading cols={4} /> :
              filteredUsers.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  {userRole === 'Student' && <td>{user.enrollmentNumber || 'Pending'}</td>}
                  <td>{user.email}</td>
                  {userRole === 'Student' && <td>{user.enrolledCourse?.name || 'Unassigned'}</td>}
                  {userRole === 'Professor' && <td>{user.assignedCourses?.map(c => c.name).join(', ') || 'None'}</td>}
                  {userRole === 'Professor' && (
                    <td>
                      {(() => {
                        const sub = allSubjects.find(s => s.professor?._id === user._id || s.professor?._id?.toString() === user._id?.toString());
                        return sub ? sub.name : <span style={{ color: 'var(--text-muted)' }}>—</span>;
                      })()}
                    </td>
                  )}
                  <td>
                    <TableActions onEdit={() => handleEdit(user)} onDelete={() => handleDelete(user._id)} />
                  </td>
                </tr>
              ))}
            {filteredUsers.length === 0 && !loading && <tr><td colSpan="5" className="text-center">No {userRole}s found matching filters.</td></tr>}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title={`Delete ${userRole}`}
        message={`Are you sure you want to delete this ${userRole.toLowerCase()}? This action cannot be undone.`}
        confirmText="Delete"
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
export default AdminUsers;
