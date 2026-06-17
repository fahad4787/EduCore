import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Calendar, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import TableLoading from '../components/TableLoading';
import { useToast } from '../context/ToastContext';
const ManageLeaves = () => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const getApiEndpoint = () => {
    return user.role === 'Admin'
      ? `${import.meta.env.VITE_API_URL}/api/admin/leaves`
      : `${import.meta.env.VITE_API_URL}/api/professor/leaves`;
  };
  useEffect(() => {
    fetchLeaves();
  }, [user.role]);
  const fetchLeaves = async () => {
    try {
      const res = await axios.get(getApiEndpoint());
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleStatusChange = async (id, status) => {
    try {
      const endpoint = user.role === 'Admin'
        ? `${import.meta.env.VITE_API_URL}/api/admin/leaves/${id}`
        : `${import.meta.env.VITE_API_URL}/api/professor/leaves/${id}`;
      await axios.put(endpoint, { status });
      fetchLeaves();
    } catch {
      showToast('Error updating leave status', 'error');
    }
  };
  const handleDeleteLeave = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/admin/leaves/${deleteTarget}`);
      fetchLeaves();
    } catch {
      showToast('Error deleting leave request', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return <span style={{ color: 'var(--success)' }}>Approved</span>;
      case 'Rejected': return <span style={{ color: 'var(--danger)' }}>Rejected</span>;
      default: return <span style={{ color: 'var(--warning)' }}>Pending</span>;
    }
  };
  return (
    <div>
      <div className="page-header">
        <h2>Leave Requests</h2>
      </div>
      <div className="card-panel table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Date</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <TableLoading cols={5} /> :
              leaves.map(leave => (
                <tr key={leave._id}>
                  <td>{leave.student?.name || 'Unknown'}</td>
                  <td>{formatDate(leave.date)}</td>
                  <td>{leave.reason}</td>
                  <td>{getStatusBadge(leave.status)}</td>
                  <td>
                    {leave.status === 'Pending' ? (
                      <div className="flex items-center gap-4">
                        <button onClick={() => handleStatusChange(leave._id, 'Approved')} style={{ background: 'var(--success)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', color: 'white' }}>Approve</button>
                        <button onClick={() => handleStatusChange(leave._id, 'Rejected')} style={{ background: 'var(--danger)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', color: 'white' }}>Reject</button>
                        {user.role === 'Admin' && (
                          <button onClick={() => handleDeleteLeave(leave._id)} style={{ background: 'transparent', color: 'var(--danger)', padding: '0.25rem', border: 'none', cursor: 'pointer', marginLeft: 'auto' }} title="Delete Record">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Decided</span>
                        {user.role === 'Admin' && (
                          <button onClick={() => handleDeleteLeave(leave._id)} style={{ background: 'transparent', color: 'var(--danger)', padding: '0.25rem', border: 'none', cursor: 'pointer', marginLeft: 'auto' }} title="Delete Record">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            {leaves.length === 0 && !loading && <tr><td colSpan="5" className="text-center">No leave requests found.</td></tr>}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Leave Request"
        message="Are you sure you want to delete this leave request? This action cannot be undone."
        confirmText="Delete"
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
export default ManageLeaves;
