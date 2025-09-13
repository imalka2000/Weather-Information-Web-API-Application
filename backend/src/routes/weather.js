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

module.exports = router;
