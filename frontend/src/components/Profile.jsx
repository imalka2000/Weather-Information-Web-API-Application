// import React, { useState } from 'react';
// import { useAuth0 } from '@auth0/auth0-react';

// export default function Profile() {
//   const { user, isAuthenticated } = useAuth0();
//   const [showRaw, setShowRaw] = useState(false);

//   if (!isAuthenticated) {
//     return (
//       <div className="profile-box card">
//         <p>Please log in to see profile info.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="profile-box card" style={{ marginBottom: 20 }}>
//       <img src={user.picture} alt="avatar" />
//       <h2>{user.name ?? user.email}</h2>
//       <p>{user.email}</p>

//       <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
//         <button onClick={() => setShowRaw(s => !s)} style={{ padding: '8px 12px' }}>
//           {showRaw ? 'Hide details' : 'Show details'}
//         </button>
//         <div style={{ alignSelf: 'center', color: 'rgba(255,255,255,0.75)' }}>
//           Email verified: {String(user.email_verified)}
//         </div>
//       </div>

//       {showRaw && (
//         <pre className="profile-json">
//           {JSON.stringify(user, null, 2)}
//         </pre>
//       )}
//     </div>
//   );
// }
//lets remove usestate for good,its not needed and it gives tooo mush detials for this

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
