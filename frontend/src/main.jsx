import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import { Auth0Provider } from '@auth0/auth0-react';
import './style.css';

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;
const redirectUri = window.location.origin;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: audience,
        scope: 'openid profile email'
      }}
      useRefreshTokens={false}
      cacheLocation="memory"
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);