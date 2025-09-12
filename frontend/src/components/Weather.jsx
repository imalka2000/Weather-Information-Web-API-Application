import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

const BACKEND = import.meta.env.VITE_BACKEND_URL;

export default function Weather() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  async function fetchWithToken(path) {
    setErr('');
    setData(null);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE }
      });

      const resp = await axios.get(`${BACKEND}${path}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setData(resp.data);
    } catch (error) {
      console.error(error);
      if (error.response) setErr(JSON.stringify(error.response.data));
      else setErr(error.message);
    }
  }

  return (
    <div className="card">
      <h3>Weather (protected API)</h3>

      {!isAuthenticated && <div className="warning">Please login first to call API.</div>}

      <div className="btnRow">
        <button onClick={() => fetchWithToken('/api/weather/cities')} disabled={!isAuthenticated}>
          Fetch Cities
        </button>
        <button onClick={() => fetchWithToken('/api/weather')} disabled={!isAuthenticated}>
          Fetch All Weather
        </button>
      </div>

      {err && <pre className="json error">{err}</pre>}
      {data && <pre className="json">{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
