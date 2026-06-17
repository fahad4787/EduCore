import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const TableActions = ({ onEdit, onDelete }) => (
  <div className="table-actions">
    {onEdit && (
      <button type="button" className="table-action table-action--edit" onClick={onEdit} aria-label="Edit">
        <Edit2 size={16} />
      </button>
    )}
    {onDelete && (
      <button type="button" className="table-action table-action--delete" onClick={onDelete} aria-label="Delete">
        <Trash2 size={16} />
      </button>
    )}
  </div>
);

export default TableActions;
