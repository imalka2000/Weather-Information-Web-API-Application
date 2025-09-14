import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export default function Profile() {
  const { user, isAuthenticated } = useAuth0();

  if (!isAuthenticated) {
    return (
      <div className="profile-box card">
        <p>Please log in to see profile info.</p>
      </div>
    );
  }

  return (
    <div className="profile-box card" style={{ marginBottom: 20, textAlign: 'center' }}>
      <img src={user.picture} alt="avatar" className="avatar" />
      <h2>{user.name ?? 'User'}</h2>
    </div>
  );
}
