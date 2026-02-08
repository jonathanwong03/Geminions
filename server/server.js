require('dotenv').config();
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
const { analyzeLogoChat } = require('./services/chatService');
// require('dotenv').config(); // Moved to top

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
    
    // Do not auto login. Client will redirect to login page.
    return res.json({ user: data, message: 'Registration successful' });

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
const HISTORY_FILE = path.join(__dirname, 'data', 'history.json');
const EXPORTS_FILE = path.join(__dirname, 'data', 'exports.json');

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

const getHistory = () => {
    if (!fs.existsSync(HISTORY_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    } catch (e) {
        return [];
    }
};

const saveHistory = (data) => {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2));
};

const getExports = () => {
    if (!fs.existsSync(EXPORTS_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(EXPORTS_FILE, 'utf8'));
    } catch (e) {
        return [];
    }
};

const saveExports = (data) => {
    fs.writeFileSync(EXPORTS_FILE, JSON.stringify(data, null, 2));
};

// API Routes

// Get user projects
app.get('/api/projects', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
    
    const projects = getProjects();
    const userProjects = projects.filter(p => p.userId === req.user.id);
    
    // Support filtering by type (e.g., exclude 'analysis' type for main project view)
    const excludeType = req.query.excludeType;
    let filteredProjects = userProjects;

    if (excludeType) {
        filteredProjects = userProjects.filter(p => p.type !== excludeType && p.reasoning !== 'Uploaded by user for analysis.');
    }

    // Sort by newest first
    filteredProjects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(filteredProjects);
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

// --- New Endpoints for Gems Features ---

app.get('/api/history', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
    const history = getHistory();
    // Filter by user if you want, but for now return all or user's
    // Assuming history has userId
    res.json(history.filter(h => h.userId === req.user.id).reverse()); 
});

app.post('/api/history', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
    const { action, status, desc } = req.body;
    const history = getHistory();
    history.push({
        userId: req.user.id,
        action,
        status,
        desc,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
    });
    saveHistory(history);
    res.json({ success: true });
});

app.get('/api/exports', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
    const exports = getExports();
    res.json(exports.filter(e => e.userId === req.user.id).reverse());
});

app.delete('/api/exports/:id', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
    
    const exports = getExports();
    const exportIndex = exports.findIndex(e => e.id === parseInt(req.params.id));
    
    if (exportIndex === -1) return res.status(404).json({ error: 'Export not found' });
    
    // Verify ownership
    if (exports[exportIndex].userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    
    exports.splice(exportIndex, 1);
    saveExports(exports);
    
    res.json({ success: true });
});

app.post('/api/projects/:id/rate', (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const { brandScore, satisfactionScore } = req.body;
    
    const projects = getProjects();
    const projectIndex = projects.findIndex(p => p.id === parseInt(id));

    if (projectIndex === -1) return res.status(404).json({ error: 'Project not found' });
    
    if (projects[projectIndex].userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    // Update scores
    if (brandScore !== undefined) projects[projectIndex].brandScore = parseInt(brandScore);
    if (satisfactionScore !== undefined) projects[projectIndex].satisfactionScore = parseInt(satisfactionScore);

    saveProjects(projects);
    res.json({ success: true, project: projects[projectIndex] });
});

app.post('/api/template/generate', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
    const { projectId, templateName, templateType } = req.body;
    
    const projects = getProjects();
    const project = projects.find(p => p.id === projectId || p.id === parseInt(projectId));

    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Track client disconnection
    const abortController = new AbortController();
    
    // Listen for request close or socket close to ensure we catch the abort
    const onResult = () => {
        if (!abortController.signal.aborted) {
            console.log('Client connection closed. Aborting generation...');
            abortController.abort();
        }
    };

    req.on('close', onResult);
    // Also optional: req.socket.on('close', onResult) if needed, but req on close is standard express
    
    try {
        // Find local file path from URL
         // project.imageUrl format: http://host/generated/filename.ext
         const filename = project.imageUrl.split('/').pop();
         const localFilePath = path.join(__dirname, 'generated', filename);

         if (!fs.existsSync(localFilePath)) {
             throw new Error("Source file not found on server");
         }

        // Construct prompt for resizing/adaptation based on template
        let prompt = `Adapt this image for ${templateName}. `;
        if (templateName.includes('Instagram Story') || templateName.includes('TikTok') || templateName.includes('Reels')) {
            prompt += "Crop and resize the image to a 9:16 vertical aspect ratio (1080x1920). Ensure the main subject is centered and clearly visible.";
        } else if (templateName.includes('LinkedIn') || templateName.includes('Twitter')) {
            prompt += "Resize to a wide landscape usage like 4:1 (1584x396 for LinkedIn) or 3:1. Keep text safe zones clear.";
        } else if (templateName.includes('YouTube')) {
            prompt += "Resize to 16:9 (1280x720). Make it eye-catching.";
        } else {
             prompt += "Resize and frame this image appropriately for a professional presentation.";
        }

        const outputDir = path.join(__dirname, 'generated');
        
        // Ensure remixImages is imported and available
        // We reuse the existing service
        const savedFiles = await remixImages([localFilePath], prompt, outputDir, abortController.signal);
        
        if (abortController.signal.aborted) {
            console.log('Client aborted request used cancelled generation, discarding result');
            return;
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const newImageUrl = savedFiles.length > 0 ? `${baseUrl}/generated/${savedFiles[0]}` : project.imageUrl;

        // Create Export Entry
        const exports = getExports();
        const history = getHistory();

        const newExport = {
            id: Date.now(),
            userId: req.user.id,
            name: `${templateName}_Adapted_${Date.now()}.png`,
            type: templateType === 'Video' ? 'video' : 'image',
            format: 'PNG', // Gemini outputs images usually
            project: project.title.substring(0, 20) + (project.title.length > 20 ? '...' : ''),
            url: newImageUrl, 
            status: 'Ready',
            timestamp: Date.now()
        };

        exports.push(newExport);
        saveExports(exports);

        // Log to history
        history.push({
            userId: req.user.id,
            action: 'Adaptation',
            status: 'Completed',
            desc: `Adapted to ${templateName} (Resized)`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
        });
        saveHistory(history);

        res.json({ success: true, export: newExport });

    } catch (error) {
        if (error.message === 'Aborted' || error.name === 'AbortError') {
            console.log('Generation aborted by user.');
            return; // Do not send response as connection might be closed
        }
        console.error("Template generation error:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        }
    }
});

app.post('/api/chat/analyze', upload.single('image'), async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const { message, history, projectId } = req.body;
        const parsedHistory = history ? JSON.parse(history) : [];
        
        // Determine image source
        let imageInput = null;

        if (req.file) {
            imageInput = { type: 'file', path: req.file.path, mimetype: req.file.mimetype };
        } else if (projectId) {
            const projects = getProjects();
            // Loose equality for string/int match
            const project = projects.find(p => p.id == projectId);
            if (project && project.imageUrl) {
                // Determine mimetype from extension
                const ext = project.imageUrl.split('.').pop().toLowerCase();
                let mimetype = 'image/png';
                if (ext === 'jpg' || ext === 'jpeg') mimetype = 'image/jpeg';
                else if (ext === 'webp') mimetype = 'image/webp';
                
                imageInput = { type: 'url', path: project.imageUrl, mimetype };
            }
        }
        
        if (!imageInput) {
             return res.status(400).json({ error: "Image required for context (File or Project ID)" });
        }

        const result = await analyzeLogoChat(imageInput, parsedHistory, message || "Analyze this logo.");

        let responseData = { success: true, ...result };

        if (req.file) {
             // Convert uploaded file to a persistent project so history works
             const projects = getProjects();
             const ext = req.file.mimetype.split('/')[1] || 'png';
             // Rename file to have extension
             const newPath = `${req.file.path}.${ext}`;
             const newFilename = `${req.file.filename}.${ext}`;
             
             try {
                fs.renameSync(req.file.path, newPath);
             } catch (e) {
                 fs.copyFileSync(req.file.path, newPath);
                 fs.unlinkSync(req.file.path);
             }

             const newProject = {
                id: Date.now(),
                userId: req.user.id,
                title: message || "Uploaded Asset Analysis",
                imageUrl: `${req.protocol}://${req.get('host')}/generated/${newFilename}`,
                createdAt: new Date().toISOString(),
                reasoning: 'Uploaded by user for analysis.',
                type: 'analysis', // Mark as analysis project
                chatHistory: [
                     { role: 'user', text: message || "Analyze this logo." },
                     { role: 'model', text: result.analysis }
                ]
             };

             projects.push(newProject);
             saveProjects(projects);

             responseData.project = newProject;
        }

        // Save chat history to existing project if projectId exists
        if (projectId) {
            const projects = getProjects();
            // Loose comparison for string/number id
            const pIndex = projects.findIndex(p => p.id == projectId);
            
            if (pIndex !== -1 && projects[pIndex].userId === req.user.id) {
                if (!projects[pIndex].chatHistory) {
                    projects[pIndex].chatHistory = [];
                }
                
                // Append this conversation turn
                projects[pIndex].chatHistory.push({ role: 'user', text: message || "Analyze this logo." });
                projects[pIndex].chatHistory.push({ role: 'model', text: result.analysis });
                
                // Score logic removed as requested


                saveProjects(projects);
            }
        }

        res.json(responseData);

    } catch (error) {
        console.error("Chat API Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
