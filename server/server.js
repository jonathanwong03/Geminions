const express = require('express');
const session = require('express-session');
const passport = require('./config/passport');
const cors = require('cors');
const supabase = require('./utils/supabaseClient');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { remixImages } = require('./services/remixService');
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
  function(req, res) {
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

// Root route behavior as requested
app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect(`${CLIENT_URL}/dashboard`);
    } else {
        res.redirect(`${CLIENT_URL}/login`);
    }
});

// Multer config for uploading images
const upload = multer({ dest: 'generated/' });

// Serve static files for generated images and uploads
app.use('/generated', express.static(path.join(__dirname, 'generated')));

// Data persistence helper
const PROJECTS_FILE = path.join(__dirname, 'data', 'projects.json');

const getProjects = () => {
    if (!fs.existsSync(PROJECTS_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf8'));
    } catch (e) {
        return [];
    }
};

const saveProjects = (projects) => {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
};

// API Routes

// Get user projects
app.get('/api/projects', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
    
    const projects = getProjects();
    const userProjects = projects.filter(p => p.userId === req.user.id);
    // Sort by newest first
    userProjects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(userProjects);
});

// Delete project
app.delete('/api/projects/:id', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
    
    const projects = getProjects();
    const projectIndex = projects.findIndex(p => p.id === req.params.id || p.id === parseInt(req.params.id));
    
    if (projectIndex === -1) return res.status(404).json({ error: 'Project not found' });
    
    const project = projects[projectIndex];
    if (project.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    
    // Delete file if it exists
    if (project.imageUrl) {
        const filename = project.imageUrl.split('/').pop();
        const filePath = path.join(__dirname, 'generated', filename);
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error("Failed to delete file:", err);
            }
        }
    }
    
    projects.splice(projectIndex, 1);
    saveProjects(projects);
    
    res.json({ success: true });
});

app.post('/api/remix', upload.array('images', 5), async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const { prompt, projectId } = req.body;
        const files = req.files || [];
        
        let finalPrompt = prompt;
        if (!finalPrompt) {
            if (files.length === 1) {
                finalPrompt = "Turn this image into a professional quality studio shoot with better lighting and depth of field.";
            } else if (files.length > 1) {
                finalPrompt = "Combine the subjects of these images in a natural way, producing a new image.";
            } else {
                finalPrompt = "Generate an amazing image.";
            }
        }

        const imagePaths = files.map(f => f.path);
        // Use generated directory for storage
        const outputDir = path.join(__dirname, 'generated');
        
        // Call service
        const savedFiles = await remixImages(imagePaths, finalPrompt, outputDir);
        
        // Clean up uploaded temp files (multer inputs)
        // Note: Multer saves to generated/ already, but without extension. 
        // We delete the temp input files, keeping the generated output files.
        files.forEach(f => {
            fs.unlink(f.path, (err) => { if (err) console.error("Failed to delete temp file", err); });
        });

        // Generate URLs and Save to DB
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const projects = getProjects();
        const newProjectIds = [];
        const fileUrls = [];

        // If editing an existing project, update it with the first generated image
        if (projectId) {
            const projectIndex = projects.findIndex(p => p.id === projectId || p.id === parseInt(projectId));
            if (projectIndex !== -1 && projects[projectIndex].userId === req.user.id) {
                // Update the existing project
                if (savedFiles.length > 0) {
                    const firstFile = savedFiles[0];
                    projects[projectIndex].title = finalPrompt;
                    projects[projectIndex].imageUrl = `${baseUrl}/generated/${firstFile}`;
                    projects[projectIndex].reasoning = 'Updated by Gemini 2.5 Flash Image Preview.';
                    projects[projectIndex].createdAt = new Date().toISOString(); // Bump timestamp
                    
                    fileUrls.push(projects[projectIndex].imageUrl);
                    newProjectIds.push(projects[projectIndex].id);
                    
                    // Remove first file from list so we don't add it again as a new project
                    savedFiles.shift(); 
                }
            }
        }

        // Add remaining files as new projects
        savedFiles.forEach((filename, index) => {
            const project = {
                id: Date.now() + index,
                userId: req.user.id,
                title: finalPrompt,
                imageUrl: `${baseUrl}/generated/${filename}`,
                createdAt: new Date().toISOString(),
                reasoning: 'Generated by Gemini 2.5 Flash Image Preview based on inputs.'
            };
            projects.push(project);
            newProjectIds.push(project.id);
            fileUrls.push(project.imageUrl);
        });
        
        saveProjects(projects);

        res.json({ success: true, images: fileUrls, projectIds: newProjectIds });
    } catch (error) {
        console.error("Remix error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
