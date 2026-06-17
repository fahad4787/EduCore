import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download } from 'lucide-react';
import Loader from '../components/Loader';
const StudentMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/student/studymaterial`);
        setMaterials(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);
  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>My Study Materials</h2>
      {loading ? <Loader text="Loading materials..." /> : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {materials.map(mat => (
            <div key={mat._id} className="card-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ margin: 0, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="var(--accent-primary)" />
                {mat.title}
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Course: {mat.course?.name}</p>
              <p style={{ marginTop: '0.5rem', flex: 1 }}>{mat.description}</p>
              <a href={`${import.meta.env.VITE_API_URL}${mat.fileUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary flex justify-center mt-4">
                <Download size={18} style={{ marginRight: '0.5rem' }} /> Download File
              </a>
            </div>
          ))}
          {materials.length === 0 && <p style={{ gridColumn: '1/-1' }}>No materials uploaded yet for your course.</p>}
        </div>
      )}
    </div>
  );
};
export default StudentMaterials;
