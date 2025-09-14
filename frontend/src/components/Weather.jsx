import React, { useState, useRef } from 'react';
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

  // Add city UI
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);

  async function fetchAllWeather() {
    setError('');
    setResult(null);
    setLoading(true);
    setSelected(null);

    try {
      const token = await getAccessTokenSilently({ authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE }});
      const resp = await axios.get(`${BACKEND}/api/weather`, { headers: { Authorization: `Bearer ${token}` }});
      setResult(resp.data);
      setLastFetched(new Date().toISOString());
    } catch (err) {
      console.error(err);
      if (err.response) setError(`Error ${err.response.status}: ${JSON.stringify(err.response.data)}`);
      else if (err.request) setError('No response from backend. Check server/CORS.');
      else setError(err.message);
    } finally { setLoading(false); }
  }

  async function searchCity(q) {
    if (!q || q.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    try {
      const token = await getAccessTokenSilently({ authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE }});
      const resp = await axios.get(`${BACKEND}/api/weather/search?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuggestions(resp.data.results || []);
    } catch (err) {
      console.error('search error', err);
      setSuggestions([]);
    } finally { setSearching(false); }
  }

  // call when user confirms add (either picks suggestion or query)
  async function addCityFromSuggestion(suggestion) {
    // suggestion: { name, country, state, lat, lon }
    setError('');
    setSearching(false);
    setSuggestions([]);
    setQuery('');
    try {
      setLoading(true);
      const token = await getAccessTokenSilently({ authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE }});

      if (suggestion && suggestion.lat !== undefined && suggestion.lon !== undefined) {
        // add by lat/lon
        const resp = await axios.post(`${BACKEND}/api/weather/add`, {
          lat: suggestion.lat,
          lon: suggestion.lon
        }, { headers: { Authorization: `Bearer ${token}` }});
        if (resp.data && resp.data.added) {
          // refresh
          await fetchAllWeather();
          return;
        }
      }

        // if no suggestion or add by lat/lon failed, fallback to search+add by name
      const sr = await axios.get(`${BACKEND}/api/weather/search?q=${encodeURIComponent(suggestion ? suggestion.name : query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const items = sr.data.results || [];
      if (items.length === 0) {
        setError('No matching city found.');
        return;
      }
        // pick first and add by lat/lon
      const first = items[0];
      const resp2 = await axios.post(`${BACKEND}/api/weather/add`, { lat: first.lat, lon: first.lon }, { headers: { Authorization: `Bearer ${token}` }});
      if (resp2.data && resp2.data.added) {
        await fetchAllWeather();
      } else {
        setError('Failed to add city: ' + JSON.stringify(resp2.data));
      }
    } catch (err) {
      console.error('addCity error', err);
      if (err.response) setError(`Error ${err.response.status}: ${JSON.stringify(err.response.data)}`);
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  }

    // always fresh search before add
    async function handleAddClick(e) {
    e.preventDefault();
     if (!isAuthenticated) {
        setError('Please log in to add a city');
        return;
        }
    if (!query || query.trim().length < 2) {
        setError('Enter at least 2 characters');
        return;
        }
    try {
        setLoading(true);
        const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE }
        });
        // always search fresh
        const sr = await axios.get(`${BACKEND}/api/weather/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
        });
        const items = sr.data.results || [];
        if (items.length === 0) {
        setError('No matching city found.');
        return;
        }
        const first = items[0];
        // call /add with lat/lon
        const resp2 = await axios.post(`${BACKEND}/api/weather/add`, {
        lat: first.lat,
        lon: first.lon
        }, { headers: { Authorization: `Bearer ${token}` }});
        if (resp2.data && resp2.data.added) {
        await fetchAllWeather();
        setQuery('');
        setSuggestions([]);
        } else {
        setError('Failed to add city: ' + JSON.stringify(resp2.data));
        }
    } catch (err) {
        console.error('addCity error', err);
        if (err.response) setError(`Error ${err.response.status}: ${JSON.stringify(err.response.data)}`);
        else setError(err.message);
    } finally {
        setLoading(false);
    }
    }



  // Remove locally (same as earlier)
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
          Last fetched: <strong>{lastFetched ? new Date(lastFetched).toLocaleString() : 'Never'}</strong>
        </div>
      </div>

      {/* Add city UI */}
      <form onSubmit={(e) => { e.preventDefault(); handleAddClick(e); }} style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center' }}>
        <input
          ref={inputRef}
          value={query}
          onChange={(ev) => { setQuery(ev.target.value); searchCity(ev.target.value); }}
          placeholder="Enter a city"
          style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)', color: '#fff' }}
        />
        <button type="submit" disabled={!isAuthenticated || loading}>Add City</button>
      </form>

      {/* suggestions */}
      {searching && <div style={{ marginTop: 8, color: 'rgba(255,255,255,0.75)' }}>Searching…</div>}
      {suggestions.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>Suggestions (click to add)</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {suggestions.map((s, i) => (
              <button
                key={`${s.name}-${i}`}
                style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 10px', borderRadius: 8 }}
                onClick={async (ev) => { ev.preventDefault(); await addCityFromSuggestion(s); }}
              >
                {s.name}{s.state ? `, ${s.state}` : ''} {s.country ? `(${s.country})` : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 12 }}>
        <button onClick={() => fetchAllWeather()} disabled={!isAuthenticated || loading}>Fetch All Weather</button>

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

      {selected && <CityDetail city={selected} unit={unit} onClose={() => setSelected(null)} />}
    </div>
  );
}