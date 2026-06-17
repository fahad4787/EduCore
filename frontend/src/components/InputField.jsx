import React from 'react';

const InputField = ({ id, label, type = 'text', icon: Icon, value, onChange, placeholder, required }) => (
  <div className="form-group">
    <label className="form-label" htmlFor={id}>{label}</label>
    <div className="input-field">
      {Icon && <Icon size={18} className="input-field__icon" />}
      <input
        id={id}
        type={type}
        className="form-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </div>
  </div>
);

export default InputField;
