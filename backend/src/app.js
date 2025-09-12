require('dotenv').config();
const express = require('express');
const cors = require('cors');

const weatherRoutes = require('./routes/weather');
const healthRoutes = require('./routes/health');

const app = express();
app.use(express.json());

app.use(cors({ 
    origin: '*' ,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));



// Auth0 configuration
const authConfig = {
  authRequired: false,
  auth0Logout: true,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  secret: process.env.AUTH0_SECRET,
  idpLogout: true
};



// Mount routes
app.use('/api/weather', weatherRoutes);
app.use('/health', healthRoutes);












// Basic 404 for other routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;
