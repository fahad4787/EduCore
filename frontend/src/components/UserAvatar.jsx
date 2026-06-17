import React from 'react';

const UserAvatar = ({ name, size = 36 }) => (
  <div className="user-avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>
    {name?.charAt(0).toUpperCase()}
  </div>
);

export default UserAvatar;
