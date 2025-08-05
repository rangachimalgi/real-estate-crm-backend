import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const router = express.Router();

// Create new user
router.post('/', async (req, res) => {
  try {
    const { username, password, name, role } = req.body;

    if (!username || !password || !name || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({
      username,
      password: hashedPassword,
      name,
      role
    });

    const savedUser = await user.save();
    
    // Return user without password
    const userResponse = {
      id: savedUser._id,
      username: savedUser.username,
      name: savedUser.name,
      role: savedUser.role
    };

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get all users (for admin purposes)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('role');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('role');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deletion of super admin users
    if (user.role?.name === 'superadmin') {
      return res.status(403).json({ error: 'Cannot delete super admin users' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router; 