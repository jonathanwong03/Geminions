const express = require('express');
const session = require('express-session');
const passport = require('./config/passport');
const cors = require('cors');
const supabase = require('./utils/supabaseClient');
const bcrypt = require('bcrypt');
const { generateImage } = require('./config/generateImage');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Middleware
app.set('trust proxy', 1); // Required for secure cookies behind a proxy (like Render)

app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const isProduction = process.env.NODE_ENV === 'production';

// Session Config (3 hours)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 3 * 60 * 60 * 1000,
    secure: isProduction, // Secure in production (HTTPS)
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax' // 'none' for cross-site cookies in prod
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Debug Middleware to log session
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} | Auth: ${req.isAuthenticated()} | User: ${req.user?.email}`);
  next();
});

// Auth Routes
app.get('/.well-known/appspecific/com.chrome.canary', (req, res) => res.status(404).end());
app.get('/.well-known/appspecific/com.chrome', (req, res) => res.status(404).end());

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${CLIENT_URL}/login` }),
  function (req, res) {
    res.redirect(`${CLIENT_URL}/dashboard`);
  });

app.post('/auth/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info.message });
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ user });
    });
  })(req, res, next);
});

app.post('/auth/register', async (req, res) => {
  const { email, password, username } = req.body;
  try {
    // Check existing
    const { data: existing } = await supabase.from('users').select('*').eq('email', email).single();
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password: hashedPassword, username }])
      .select()
      .single();

    if (error) throw error;

    // Auto login after register
    req.login(data, (err) => {
      if (err) return res.status(500).json({ message: 'Login failed after registration' });
      return res.json({ user: data });
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/auth/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ message: 'Logged out' });
  });
});

app.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user, authenticated: true });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

// API Routes
app.post('/api/generate-image', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: 'Prompt is required'
    });
  }

  try {
    console.log(`[API] Received image generation request`);
    const result = await generateImage(prompt);

    if (result.success) {
      res.json({
        success: true,
        imageData: result.imageData,
        mimeType: result.mimeType
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('[API] Error in /api/generate-image:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Root route behavior as requested
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect(`${CLIENT_URL}/dashboard`);
  } else {
    res.redirect(`${CLIENT_URL}/login`);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
