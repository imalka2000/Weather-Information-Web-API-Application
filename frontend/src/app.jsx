import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Profile from './components/Profile';
import Weather from './components/Weather';

export default function App() {
  const { loginWithRedirect, logout, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <div>Loading authentication...</div>;

  return (
    <div className="container">
      <h1>Weather App (Auth0 SPA + JWT)</h1>

      <div className="controls">
        {!isAuthenticated ? (
          <button onClick={() => loginWithRedirect()}>Log in</button>
        ) : (
          <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
            Log out
          </button>
        )}
      </div>

      <Profile />
      <Weather />
    </div>
  );
}