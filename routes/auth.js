import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  console.log('🧪 LOGIN route hit');

  const { username, password } = req.body;
  console.log('📦 BODY:', req.body);

  if (!username || !password) {
    console.log('⛔ Missing username/password');
    return res.status(400).json({ error: 'Username and password required' });
  }

  const user = await User.findOne({ username }).populate('role');
  console.log('👤 USER:', user);

  if (!user) {
    console.log('❌ USER NOT FOUND');
    return res.status(404).json({ error: 'User not found' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  console.log('🔐 PASSWORD MATCH?', isMatch);

  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  console.log('✅ SUCCESSFUL LOGIN');
  res.status(200).json({
    token,
    user: {
      id: user._id,
      username: user.username,
      role: user.role.name,
      screens: user.role.screens,
    },
  });
});

router.get('/test', (req, res) => {
  res.send('✅ You hit /auth/test');
});

export default router;
