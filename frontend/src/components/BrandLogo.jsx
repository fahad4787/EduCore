import React from 'react';
import { APP_NAME, APP_TAGLINE } from '../constants/brand';

const BrandLogo = ({ size = 'md', variant = 'default', showTagline = true }) => (
  <div className="brand-logo">
    <div className={`brand-logo__icon${size === 'lg' ? ' lg' : ''}`}>E</div>
    <div className="brand-logo__text">
      <h2 className={`brand-logo__name${variant === 'light' ? ' light' : ''}`}>{APP_NAME}</h2>
      {showTagline && (
        <p className={`brand-logo__tagline${variant === 'light' ? ' light' : ''}`}>{APP_TAGLINE}</p>
      )}
    </div>
  </div>
);

export default BrandLogo;
