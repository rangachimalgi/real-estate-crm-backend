import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from "./routes/auth.js"
import rolesRoutes from "./routes/roles.js"
import usersRoutes from "./routes/users.js"
import "./keepAlive.js"
import './models/Role.js';

dotenv.config();
const app = express();

// FIX: Add this to parse JSON bodies
app.use(express.json());

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

// connect db
connectDB();

// Routes
app.use('/auth', authRoutes);
app.use('/roles', rolesRoutes);
app.use('/users', usersRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('👋 Hello from server');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
