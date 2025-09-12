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

// initialize Auth0 middleware (adds /login, /logout and /callback)
app.use(auth(authConfig));

// request logger showing user email if authenticated or not
app.use((req, res, next) => {
  const userEmail = req.oidc && req.oidc.user ? (req.oidc.user.email || req.oidc.user.sub) : 'anonymous';
  console.log(new Date().toISOString(), req.method, req.url, 'user=', userEmail);
  next();
});


// Mount routes
//app.use('/api/weather', weatherRoutes);
app.use('/api/weather', requiresAuth(), weatherRoutes);
app.use('/health', healthRoutes);


// Basic 404 for other routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});


// Simple homepage
app.get('/', (req, res) => {
  if (req.oidc && req.oidc.isAuthenticated()) {
    return res.send(`
      <h3>Logged in as ${req.oidc.user.email}</h3>
      <p><a href="/api/weather/cities">Get Cities (protected)</a></p>
      <p><a href="/logout">Logout</a></p>
    `);
  }
  res.send(`
    <h3>Not logged in</h3>
    <p><a href="/login">Login</a></p>
  `);
});

module.exports = app;
