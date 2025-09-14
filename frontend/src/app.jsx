import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Profile from './components/Profile';
import Weather from './components/Weather';

export default function App() {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-title">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M17 18a4 4 0 100-8 4.001 4.001 0 00-3.874 3.012A5.002 5.002 0 006 17h11z" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2M4.93 19.07l1.41-1.41M12 20v2M19.07 19.07l-1.41-1.41M22 12h-2M19.07 4.93l-1.41 1.41" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ marginLeft: 8 }}>Weather App</span>
        </div>


        <div className="auth-buttons">
          {!isAuthenticated ? (
            <button onClick={() => loginWithRedirect()}>Log in</button>
          ) : (
            <button onClick={() => logout({ returnTo: window.location.origin })}>Log out</button>
          )}
        </div>
      </header>

      <main className="container app-main">
        <section style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 1100 }}>
            <Profile />
            {isAuthenticated && <Weather />}
          </div>
        </section>
      </main>

    <footer className="app-footer">
        <p>
            <center>Fidenz Technologies</center>
         </p>
      </footer>
    </div>
  );
}