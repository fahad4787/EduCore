import React from 'react';
import Loader from './Loader';

const TableLoading = ({ cols = 4 }) => (
  <tr>
    <td colSpan={cols} style={{ textAlign: 'center', padding: '2rem' }}>
      <Loader text="Loading..." size="sm" />
    </td>
  </tr>
);

export default TableLoading;
