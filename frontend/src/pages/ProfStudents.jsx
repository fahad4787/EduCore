import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter } from 'lucide-react';
import TableLoading from '../components/TableLoading';

const ProfStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/professor/students`);
        setStudents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Unique courses from student list for filter dropdown
  const uniqueCourses = [
    ...new Map(
      students
        .filter(s => s.enrolledCourse)
        .map(s => [s.enrolledCourse._id, s.enrolledCourse])
    ).values(),
  ];

  // Client-side filtering
  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchSearch =
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.enrollmentNumber?.toLowerCase().includes(q) ||
      s.mobileNumber?.includes(q);
    const matchCourse = courseFilter
      ? s.enrolledCourse?._id === courseFilter
      : true;
    return matchSearch && matchCourse;
  });

  return (
    <div>
      <div className="page-header">
        <h2>My Students</h2>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {filtered.length} of {students.length} student{students.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Search + Filter Bar */}
      <div
        className="card-panel"
        style={{
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Search Input */}
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, email, enrollment no. or mobile..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>

        {/* Course Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '200px' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <select
            className="form-input"
            value={courseFilter}
            onChange={e => setCourseFilter(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="">All Courses</option>
            {uniqueCourses.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Clear Button */}
        {(search || courseFilter) && (
          <button
            className="btn btn-secondary"
            style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
            onClick={() => { setSearch(''); setCourseFilter(''); }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card-panel table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Enrollment No.</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Enrolled Course</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableLoading cols={5} />
            ) : filtered.length > 0 ? (
              filtered.map(student => (
                <tr key={student._id}>
                  <td>{student.enrollmentNumber || '—'}</td>
                  <td style={{ fontWeight: '500' }}>{student.name}</td>
                  <td>{student.email}</td>
                  <td>{student.mobileNumber || '—'}</td>
                  <td>{student.enrolledCourse?.name || 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center" style={{ color: 'var(--text-muted)' }}>
                  {students.length === 0 ? 'No students found in your assigned courses.' : 'No results match your search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProfStudents;
