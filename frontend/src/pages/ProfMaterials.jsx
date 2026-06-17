import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Trash2, FileText } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import FormModal from '../components/FormModal';
import { useToast } from '../context/ToastContext';

const ProfMaterials = () => {
  const { showToast } = useToast();
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = async () => {
    try {
      const [matRes, crsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/professor/studymaterial`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/professor/courses`)
      ]);
      setMaterials(matRes.data);
      setCourses(crsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCourse('');
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast('Please attach a file', 'warning');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('course', course);
    formData.append('file', file);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/professor/studymaterial`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      resetForm();
      setShowUpload(false);
      fetchData();
      showToast('Material uploaded successfully', 'success');
    } catch {
      showToast('Error uploading file', 'error');
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/professor/studymaterial/${deleteTarget}`);
      fetchData();
      showToast('Material deleted', 'success');
    } catch {
      showToast('Error deleting material', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h2>Study Materials</h2>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowUpload(true); }}>
            <Upload size={18} /> Upload Material
          </button>
        </div>
      </div>

      <FormModal
        isOpen={showUpload}
        title="Upload New Material"
        onClose={() => { setShowUpload(false); resetForm(); }}
        onSubmit={handleSubmit}
        submitText="Upload"
        size="md"
        loading={uploading}
      >
        <div className="form-group">
          <label className="form-label">Material Title</label>
          <input type="text" className="form-input" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Course</label>
          <select className="form-input" value={course} onChange={e => setCourse(e.target.value)} required>
            <option value="">Select Course</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Description (Optional)</label>
          <textarea className="form-input" rows="2" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">File</label>
          <input type="file" className="form-input" onChange={e => setFile(e.target.files[0])} required />
        </div>
      </FormModal>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {materials.map(mat => (
          <div key={mat._id} className="card-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div className="flex justify-between items-start mb-2">
              <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="var(--accent-primary)" />
                {mat.title}
              </h4>
              <button onClick={() => setDeleteTarget(mat._id)} className="table-action table-action--delete" type="button">
                <Trash2 size={16} />
              </button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{mat.course?.name}</p>
            <p style={{ marginTop: '0.5rem', flex: 1 }}>{mat.description}</p>
            <a href={`${import.meta.env.VITE_API_URL}${mat.fileUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ marginTop: '1rem', textAlign: 'center', textDecoration: 'none' }}>
              View / Download File
            </a>
          </div>
        ))}
        {materials.length === 0 && <p style={{ gridColumn: '1/-1', color: 'var(--text-muted)' }}>No materials uploaded yet.</p>}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Material"
        message="Are you sure you want to delete this study material? This action cannot be undone."
        confirmText="Delete Material"
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ProfMaterials;
