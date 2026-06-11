import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';
const ProfAttendance = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const fetchInitialData = async () => {
    try {
      const [crRes, stRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/professor/courses`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/professor/students`)
      ]);
      setCourses(crRes.data);
      setStudents(stRes.data);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchInitialData();
  }, []);
  useEffect(() => {
    if (selectedCourse) {
      const filtered = students.filter(s => s.enrolledCourse?._id === selectedCourse);
      const initialAttendance = {};
      filtered.forEach(s => {
        initialAttendance[s._id] = 'Present';
      });
      setAttendance(initialAttendance);
    }
  }, [selectedCourse, students]);
  const handleToggle = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
    }));
  };
  const handleSubmit = async () => {
    if (!selectedCourse) return alert('Select a course first');
    const records = Object.keys(attendance).map(studentId => ({
      student: studentId,
      course: selectedCourse,
      date: date,
      status: attendance[studentId]
    }));
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/professor/attendance`, { records });
      alert('Attendance saved successfully');
    } catch {
      alert('Error saving attendance');
    }
  };
  const currStudents = students.filter(s => s.enrolledCourse?._id === selectedCourse);
  return (
    <div>
      <div className="page-header">
        <h2>Mark Attendance</h2>
      </div>
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group mb-0">
            <label className="form-label">Course</label>
            <select className="form-input" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
              <option value="">Select Course...</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group mb-0">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
          </div>
        </div>
      </div>
      {selectedCourse && (
        <div className="glass-panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>Enrollment No.</th>
                <th>Student Name</th>
                <th>Mobile</th>
                <th>Status</th>
                <th>Toggle</th>
              </tr>
            </thead>
            <tbody>
              {currStudents.map(student => (
                <tr key={student._id}>
                  <td>{student.enrollmentNumber || '—'}</td>
                  <td>{student.name}</td>
                  <td>{student.mobileNumber || '—'}</td>
                  <td>
                    <span style={{
                      color: attendance[student._id] === 'Present' ? 'var(--success)' : 'var(--danger)',
                      fontWeight: '500'
                    }}>
                      {attendance[student._id]}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggle(student._id)}
                      className={`btn ${attendance[student._id] === 'Present' ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ padding: '0.50rem 0.50rem', fontSize: '0.75rem' }}
                    >
                      {attendance[student._id] === 'Present' ? 'Absent' : 'Present'}
                    </button>
                  </td>
                </tr>
              ))}
              {currStudents.length === 0 && <tr><td colSpan="5" className="text-center">No students in this course.</td></tr>}
            </tbody>
          </table>
          {currStudents.length > 0 && (
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={handleSubmit}>
                <Save size={18} style={{ marginRight: '0.5rem' }} /> Save Attendance
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default ProfAttendance;
