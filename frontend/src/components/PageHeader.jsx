import React from 'react';

const PageHeader = ({ title, children }) => (
  <div className="page-header">
    <h2 style={{ margin: 0 }}>{title}</h2>
    {children && <div className="page-header-actions">{children}</div>}
  </div>
);

export default PageHeader;
