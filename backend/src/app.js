// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');

// const weatherRoutes = require('./routes/weather');
// const healthRoutes = require('./routes/health');

// const app = express();
// app.use(express.json());

// app.use(cors({ 
//     origin: '*' ,
//     credentials: true,
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));

// // Auth0 configuration
// const authConfig = {
//   authRequired: false,
//   auth0Logout: true,
//   issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
//   baseURL: process.env.AUTH0_BASE_URL,
//   clientID: process.env.AUTH0_CLIENT_ID,
//   secret: process.env.AUTH0_SECRET,
//   idpLogout: true
// };

// // initialize Auth0 middleware (adds /login, /logout and /callback)
// app.use(auth(authConfig));

// // request logger showing user email if authenticated or not
// app.use((req, res, next) => {
//   const userEmail = req.oidc && req.oidc.user ? (req.oidc.user.email || req.oidc.user.sub) : 'anonymous';
//   console.log(new Date().toISOString(), req.method, req.url, 'user=', userEmail);
//   next();
// });


// // JWT middleware to validate access tokens issued by Auth0
// if (!process.env.AUTH0_ISSUER_BASE_URL || !process.env.AUTH0_AUDIENCE) {
//   console.error('ERROR: AUTH0_ISSUER_BASE_URL and AUTH0_AUDIENCE must be set in .env');
//   process.exit(1);
// }


// const checkJwt = jwt({
//   // Dynamically provide a signing key based on the kid in the header and the signing keys provided by the JWKS endpoint.
//   secret: jwksRsa.expressJwtSecret({
//     cache: true,
//     rateLimit: true,
//     jwksRequestsPerMinute: 5,
//     jwksUri: `${process.env.AUTH0_ISSUER_BASE_URL}/.well-known/jwks.json`
//   }),
//   // Validate the audience and the issuer.
//   audience: process.env.AUTH0_AUDIENCE,
//   issuer: process.env.AUTH0_ISSUER_BASE_URL,
//   algorithms: ['RS256']
// });


// // Mount routes
// //app.use('/api/weather', weatherRoutes);
// app.use('/api/weather', requiresAuth(), weatherRoutes);
// app.use('/health', healthRoutes);


// // Basic 404 for other routes
// app.use((req, res) => {
//   res.status(404).json({ error: 'Not found' });
// });


// // Simple homepage
// app.get('/', (req, res) => {
//   if (req.oidc && req.oidc.isAuthenticated()) {
//     return res.send(`
//       <h3>Logged in as ${req.oidc.user.email}</h3>
//       <p><a href="/api/weather/cities">Get Cities (protected)</a></p>
//       <p><a href="/logout">Logout</a></p>
//     `);
//   }
//   res.send(`
//     <h3>Not logged in</h3>
//     <p><a href="/login">Login</a></p>
//   `);
// });

// module.exports = app;



require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');

const weatherRoutes = require('./routes/weather');
const healthRoutes = require('./routes/health');

const app = express();
app.use(express.json());

// Allow frontend origin (Vite)
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true
}));

// Logger
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

// Validate environment
if (!process.env.AUTH0_ISSUER_BASE_URL || !process.env.AUTH0_AUDIENCE) {
  console.error('ERROR: AUTH0_ISSUER_BASE_URL and AUTH0_AUDIENCE must be set in .env');
  process.exit(1);
}

// JWT validation middleware
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.AUTH0_ISSUER_BASE_URL.replace(/\/$/, '')}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: process.env.AUTH0_ISSUER_BASE_URL, // keep trailing slash here
  algorithms: ['RS256']
});


// Public route
app.use('/health', healthRoutes);

// Protected routes
app.use('/api/weather', checkJwt, weatherRoutes);

// Auth error handler
app.use((err, req, res, next) => {
  if (err && (err.name === 'UnauthorizedError' || err.code === 'invalid_token')) {
    return res.status(401).json({ error: 'Invalid token', detail: err.message });
  }
  console.error(err);
  next(err);
});

module.exports = app;
