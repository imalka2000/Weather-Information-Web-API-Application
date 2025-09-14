const express = require('express');
const router = express.Router();
const fetcher = require('../utils/fetchWeather');

// GET /api/weather/cities
router.get('/cities', (req, res) => {
  const cityCodes = fetcher.getCities();
  res.json({ count: cityCodes.length, cityCodes });
});

// GET /api/weather/:id
router.get('/:id', async (req, res) => {
  const id = String(req.params.id);
  const cityCodes = fetcher.getCities();
  if (!cityCodes.includes(id)) return res.status(404).json({ error: 'City id not found in cities.json' });

  try {
    const result = await fetcher.getWeatherById(id);
    res.json(result);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// GET /api/weather (all)
router.get('/', async (req, res) => {
  try {
    const result = await fetcher.getAllWeather();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Unexpected server error', detail: err.message });
  }
});



/**
 * NEW: GET /api/weather/search?q=London
 * Uses OpenWeather geocoding to return up to 5 candidate places
 */
router.get('/search', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'q query param required' });
  try {
    const results = await fetcher.searchByName(q);
    res.json({ count: results.length, results });
  } catch (err) {
    res.status(502).json({ error: 'Geocoding failed', detail: err.message });
  }
});

/**
 * NEW: POST /api/weather/add
 * body: { id: '12345' } OR { lat: 12.34, lon: 56.78 }
 */
router.post('/add', express.json(), async (req, res) => {
  const { id, lat, lon } = req.body || {};
  try {
    if (id) {
      const result = await fetcher.addCityById(id);
      if (result.added) return res.json({ added: true, data: result.data });
      return res.status(400).json({ added: false, reason: result.reason, detail: result.detail });
    } else if (lat !== undefined && lon !== undefined)  {
      const result = await fetcher.addCityByLatLon(lat, lon);
      if (result.added) return res.json({ added: true, data: result.data });
      return res.status(400).json({ added: false, reason: result.reason, detail: result.detail });
    } else {
      return res.status(400).json({ error: 'Provide id OR lat and lon in body' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
