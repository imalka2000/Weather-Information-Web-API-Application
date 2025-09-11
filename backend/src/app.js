require('dotenv').config();
const express = require('express');
const weatherRoutes = require('./routes/weather');
const healthRoutes = require('./routes/health');

const app = express();
app.use(express.json());

// Mount routes
app.use('/api/weather', weatherRoutes);
app.use('/health', healthRoutes);

// Basic 404 for other routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;
