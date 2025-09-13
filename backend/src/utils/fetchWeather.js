const fs = require('fs');
const path = require('path');
const NodeCache = require('node-cache');
const axios = require('axios');

const OWM_API_KEY = process.env.OWM_API_KEY;
const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS || 300);

if (!OWM_API_KEY) {
  console.error('ERROR: Please set OWM_API_KEY in .env');
  process.exit(1);
}

const CITIES_PATH = path.join(__dirname, '..', '..', 'cities.json');
let cities = [];
try {
  const raw = fs.readFileSync(CITIES_PATH, 'utf8');
  const parsed = JSON.parse(raw);
  const cityArray = Array.isArray(parsed) ? parsed : (parsed.List || []);
  cities = cityArray.map(c => {
    if (c.CityCode !== undefined) return String(c.CityCode);
    if (c.id !== undefined) return String(c.id);
    return null;
  }).filter(Boolean);
  console.log(`Loaded ${cities.length} city codes from cities.json`);
} catch (err) {
  console.error('Failed to load/parse cities.json:', err.message);
  process.exit(1);
}

// in-memory cache
const cache = new NodeCache({ stdTTL: CACHE_TTL_SECONDS, checkperiod: 60 });

async function fetchFromOpenWeather(cityId) {
  const url = `https://api.openweathermap.org/data/2.5/weather?id=${encodeURIComponent(cityId)}&appid=${OWM_API_KEY}&units=metric`;
  const resp = await axios.get(url, { timeout: 10000 });
  const d = resp.data;
  return {
    id: d.id,
    name: d.name,
    weatherDescription: d.weather && d.weather[0] ? d.weather[0].description : null,
    temp: d.main ? d.main.temp : null,
    raw: d
  };
}

async function getWeatherById(cityId) {
  const key = `weather:${cityId}`;
  const cached = cache.get(key);
  if (cached) return { cached: true, data: cached };

  const payload = await fetchFromOpenWeather(cityId);
  cache.set(key, payload);
  return { cached: false, data: payload };
}

async function getAllWeather() {
  const promises = cities.map(id =>
    getWeatherById(id)
      .then(result => ({ id, ok: true, result }))
      .catch(error => ({ id, ok: false, error: error.message }))
  );
  const results = await Promise.all(promises);
  const successes = results.filter(r => r.ok).map(r => ({ id: r.id, cached: r.result.cached, data: r.result.data }));
  const failures = results.filter(r => !r.ok).map(r => ({ id: r.id, error: r.error }));
  return { count: successes.length, successes, failures };
}

function getCities() { return [...cities]; }

module.exports = { getCities, getWeatherById, getAllWeather };
