import React from 'react';

const Loader = ({ text = 'Loading...', size = 'md', full = false }) => (
  <div className={`loader-wrap${full ? ' full' : ''}`}>
    <div className={`loader-spinner${size === 'sm' ? ' sm' : ''}`} />
    {text && <span className="loader-text">{text}</span>}
  </div>
);

export default Loader;
