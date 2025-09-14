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
            <path d="M6 12a6 6 0 1112 0" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 6v6l3 3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
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
            {/* <center>
                Built with React + Auth0 + OpenWeatherMap API
            </center> */}
        </p>
      </footer>
    </div>
  );
}