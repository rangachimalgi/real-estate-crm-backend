import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from "./routes/auth.js"
import rolesRoutes from "./routes/roles.js"
import usersRoutes from "./routes/users.js"
import siteVisitRoutes from "./routes/siteVisits.js"
import projectRoutes from "./routes/projects.js"
import chatRoutes from "./routes/chat.js"

import "./keepAlive.js"
import './models/Role.js';
import './models/Project.js';
import './models/Chat.js';

dotenv.config();
const app = express();

// FIX: Add this to parse JSON bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Add CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files from uploads directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// connect db
connectDB();

// Routes
app.use('/auth', authRoutes);
app.use('/roles', rolesRoutes);
app.use('/users', usersRoutes);
app.use('/site-visits', siteVisitRoutes);
app.use('/projects', projectRoutes);
app.use('/chat', chatRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('👋 Hello from server');
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
