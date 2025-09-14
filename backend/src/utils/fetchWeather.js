// const fs = require('fs');
// const path = require('path');
// const NodeCache = require('node-cache');
// const axios = require('axios');

// const OWM_API_KEY = process.env.OWM_API_KEY;
// const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS || 300);

// if (!OWM_API_KEY) {
//   console.error('ERROR: Please set OWM_API_KEY in .env');
//   process.exit(1);
// }

// const CITIES_PATH = path.join(__dirname, '..', '..', 'cities.json');
// let cities = [];
// try {
//   const raw = fs.readFileSync(CITIES_PATH, 'utf8');
//   const parsed = JSON.parse(raw);
//   const cityArray = Array.isArray(parsed) ? parsed : (parsed.List || []);
//   cities = cityArray.map(c => {
//     if (c.CityCode !== undefined) return String(c.CityCode);
//     if (c.id !== undefined) return String(c.id);
//     return null;
//   }).filter(Boolean);
//   console.log(`Loaded ${cities.length} city codes from cities.json`);
// } catch (err) {
//   console.error('Failed to load/parse cities.json:', err.message);
//   process.exit(1);
// }

// // in-memory cache
// const cache = new NodeCache({ stdTTL: CACHE_TTL_SECONDS, checkperiod: 60 });

// async function fetchFromOpenWeather(cityId) {
//   const url = `https://api.openweathermap.org/data/2.5/weather?id=${encodeURIComponent(cityId)}&appid=${OWM_API_KEY}&units=metric`;
//   const resp = await axios.get(url, { timeout: 10000 });
//   const d = resp.data;
//   return {
//     id: d.id,
//     name: d.name,
//     weatherDescription: d.weather && d.weather[0] ? d.weather[0].description : null,
//     temp: d.main ? d.main.temp : null,
//     raw: d
//   };
// }

// async function getWeatherById(cityId) {
//   const key = `weather:${cityId}`;
//   const cached = cache.get(key);
//   if (cached) return { cached: true, data: cached };

//   const payload = await fetchFromOpenWeather(cityId);
//   cache.set(key, payload);
//   return { cached: false, data: payload };
// }

// async function getAllWeather() {
//   const promises = cities.map(id =>
//     getWeatherById(id)
//       .then(result => ({ id, ok: true, result }))
//       .catch(error => ({ id, ok: false, error: error.message }))
//   );
//   const results = await Promise.all(promises);
//   const successes = results.filter(r => r.ok).map(r => ({ id: r.id, cached: r.result.cached, data: r.result.data }));
//   const failures = results.filter(r => !r.ok).map(r => ({ id: r.id, error: r.error }));
//   return { count: successes.length, successes, failures };
// }

// function getCities() { return [...cities]; }

// module.exports = { getCities, getWeatherById, getAllWeather };

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
    if (c.cityId !== undefined) return String(c.cityId);
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
  // add cachedAt for UI
  const payloadWithTs = { ...payload, cachedAt: new Date().toISOString() };
  cache.set(key, payloadWithTs);
  return { cached: false, data: payloadWithTs };
}

async function getAllWeather() 
{
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

//
// --- New helpers: search (geocoding) and addCity
//

// Call OpenWeather geocoding API (limit 5)
async function searchByName(q) {
  if (!q || typeof q !== 'string') return [];
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=5&appid=${OWM_API_KEY}`;
  const resp = await axios.get(url, { timeout: 10000 });
  // Response items look like: { name, lat, lon, country, state }
  return resp.data.map(item => ({
    name: item.name,
    country: item.country,
    state: item.state,
    lat: item.lat,
    lon: item.lon
  }));
}

// Add by OpenWeather city id. Validate first by fetching data.
async function addCityById(cityId) {
  // Prevent duplicates
  if (cities.includes(String(cityId))) {
    return { added: false, reason: 'already_exists' };
  }

  // validate: try fetch
  try {
    const w = await fetchFromOpenWeather(cityId);
    // if success, push id and persist
    cities.push(String(cityId));
    saveCitiesToFile();
    // prime cache with fetched data
    const payloadWithTs = { ...w, cachedAt: new Date().toISOString() };
    cache.set(`weather:${cityId}`, payloadWithTs);
    return { added: true, data: payloadWithTs };
  } catch (err) {
    return { added: false, reason: 'invalid_city', detail: err.message };
  }
}

// Add by lat/lon: we call current weather endpoint with lat/lon — it returns `id`
// then we add that id to cities (useful if geocoding result has no id)
async function addCityByLatLon(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${OWM_API_KEY}&units=metric`;
    const resp = await axios.get(url, { timeout: 10000 });
    const d = resp.data;
    const id = d.id;
    if (!id) return { added: false, reason: 'no_id' };
    if (cities.includes(String(id))) return { added: false, reason: 'already_exists' };
    cities.push(String(id));
    saveCitiesToFile();
    const payloadWithTs = {
      id: d.id,
      name: d.name,
      weatherDescription: d.weather?.[0]?.description ?? null,
      temp: d.main?.temp ?? null,
      raw: d,
      cachedAt: new Date().toISOString()
    };
    cache.set(`weather:${id}`, payloadWithTs);
    return { added: true, data: payloadWithTs };
  } catch (err) {
    return { added: false, reason: 'invalid_latlon', detail: err.message };
  }
}

// persist cities array to cities.json (writes as { "List": [ { "CityCode": id }, ... ]} )
function saveCitiesToFile() {
  try {
    // Build a structure similar to the original file
    const out = { List: cities.map(id => ({ CityCode: id })) };
    fs.writeFileSync(CITIES_PATH, JSON.stringify(out, null, 2), 'utf8');
    console.log('Saved cities.json with', cities.length, 'items');
  } catch (err) {
    console.error('Failed to save cities.json:', err.message);
  }
}

module.exports = {
  getCities,
  getWeatherById,
  getAllWeather,
  searchByName,
  addCityById,
  addCityByLatLon
};
