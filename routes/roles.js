import express from 'express';
import Role from '../models/Role.js';

const router = express.Router();

// Get all roles
router.get('/', async (req, res) => {
  try {
    const roles = await Role.find().sort({ name: 1 });
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Get single role by ID
router.get('/:id', async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ error: 'Failed to fetch role' });
  }
});

// Create new role
router.post('/', async (req, res) => {
  try {
    const { name, screens } = req.body;

    if (!name || !screens || !Array.isArray(screens)) {
      return res.status(400).json({ error: 'Name and screens array are required' });
    }

    // Check if role name already exists
    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({ error: 'Role name already exists' });
    }

    const role = new Role({
      name,
      screens
    });

    const savedRole = await role.save();
    res.status(201).json(savedRole);
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// Update role
router.put('/:id', async (req, res) => {
  try {
    const { name, screens } = req.body;

    if (!name || !screens || !Array.isArray(screens)) {
      return res.status(400).json({ error: 'Name and screens array are required' });
    }

    // Check if role name already exists (excluding current role)
    const existingRole = await Role.findOne({ name, _id: { $ne: req.params.id } });
    if (existingRole) {
      return res.status(400).json({ error: 'Role name already exists' });
    }

    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      { name, screens },
      { new: true, runValidators: true }
    );

    if (!updatedRole) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json(updatedRole);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Delete role
router.delete('/:id', async (req, res) => {c
  try {
    const deletedRole = await Role.findByIdAndDelete(req.params.id);
    
    if (!deletedRole) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

export default router; 