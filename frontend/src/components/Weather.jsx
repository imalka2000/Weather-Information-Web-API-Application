import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import WeatherList from './WeatherList';
import CityDetail from './CityDetail';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default function Weather() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { count, successes, failures }
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('C');
  const [lastFetched, setLastFetched] = useState(null);
  const [selected, setSelected] = useState(null);

  async function fetchAllWeather() {
    setError('');
    setResult(null);
    setLoading(true);
    setSelected(null);

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE }
      });

      const resp = await axios.get(`${BACKEND}/api/weather`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 20000
      });

      setResult(resp.data);
      setLastFetched(new Date().toISOString());
    } catch (err) {
      console.error(err);
      if (err.response) setError(`Error ${err.response.status}: ${JSON.stringify(err.response.data)}`);
      else if (err.request) setError('No response from backend. Check server/CORS.');
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCities() {
    setError('');
    setResult(null);
    setLoading(true);
    setSelected(null);

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE }
      });

      const resp = await axios.get(`${BACKEND}/api/weather/cities`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });

      const cityCodes = resp.data.cityCodes || [];
      const successes = cityCodes.map((id) => ({
        id,
        cached: false,
        data: { id: Number(id), name: id, weatherDescription: null, temp: null }
      }));
      setResult({ count: cityCodes.length, successes, failures: [] });
      setLastFetched(new Date().toISOString());
    } catch (err) {
      console.error(err);
      if (err.response) setError(`Error ${err.response.status}: ${JSON.stringify(err.response.data)}`);
      else if (err.request) setError('No response from backend. Check server/CORS.');
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function prettyTime(iso) {
    if (!iso) return 'Never';
    return new Date(iso).toLocaleString();
  }

  // Remove a city locally (for UX)
  function removeCity(id) {
    if (!result) return;
    const newSuccesses = result.successes.filter(s => s.id !== id);
    setResult({ ...result, successes: newSuccesses, count: newSuccesses.length });
  }

  return (
    <div className="card-outer card" style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h3 style={{ margin: 0 }}>Weather</h3>
        <div style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.85)' }}>
          Last fetched: <strong>{prettyTime(lastFetched)}</strong>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 12 }}>
        <button onClick={fetchCities} disabled={!isAuthenticated || loading}>Fetch Cities</button>
        <button onClick={fetchAllWeather} disabled={!isAuthenticated || loading}>Fetch All Weather</button>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ marginRight: 6, opacity: 0.8 }}>Unit</label>
          <button onClick={() => setUnit('C')} disabled={unit === 'C'} style={{ padding: '6px 10px' }}>°C</button>
          <button onClick={() => setUnit('F')} disabled={unit === 'F'} style={{ padding: '6px 10px' }}>°F</button>
        </div>
      </div>

      {loading && (
        <div className="loading-row" style={{ marginTop: 12 }}>
          <div className="spinner" /> Loading…
        </div>
      )}

      {error && <pre className="json error" style={{ marginTop: 12 }}>{error}</pre>}

      {result && (
        <div style={{ marginTop: 18 }}>
          <WeatherList
            result={result}
            unit={unit}
            onSelect={(item) => setSelected(item)}
            onRemove={(id) => removeCity(id)}
          />
        </div>
      )}

      {!loading && !result && !error && (
        <div className="hint" style={{ marginTop: 18 }}>
          Click <strong>Fetch All Weather</strong> to load current weather for all cities.
        </div>
      )}

      {selected && (
        <CityDetail city={selected} unit={unit} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
