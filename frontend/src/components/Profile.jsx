import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

export default function Profile() {
  const { user, isAuthenticated } = useAuth0();

  if (!isAuthenticated) return <div className="card">Please log in to see profile info.</div>;

  return (
    <div className="card">
      <h3>Profile</h3>
      <div className="profileRow">
        <img src={user.picture} alt="avatar" className="avatar" />
        <div>
          <div><strong>{user.name}</strong></div>
          <div>{user.email}</div>
        </div>
      </div>
      <pre className="json">{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}