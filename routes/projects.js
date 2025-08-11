import express from 'express';
import Project from '../models/Project.js';
import { uploadAll, formatUploadedFiles } from '../utils/fileUpload.js';

const router = express.Router();

// ==================== ADMIN/TEAM ROUTES ====================

// Create new project
router.post('/', uploadAll, async (req, res) => {
  try {
    console.log('=== BACKEND DEBUG ===');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request body:', req.body);
    console.log('Request files:', req.files ? Object.keys(req.files) : 'No files');
    
    const {
      name,
      description,
      status,
      featured,
      location,
      price,
      area,
      bedrooms,
      contactInfo
    } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    // Format uploaded files
    const uploadedFiles = formatUploadedFiles(req.files);

    const project = new Project({
      name,
      description,
      status: status || 'active',
      featured: featured === 'true',
      images: uploadedFiles.images,
      videos: uploadedFiles.videos,
      brochures: uploadedFiles.brochures,
      layoutPlans: uploadedFiles.layoutPlans,
      approvalLetters: uploadedFiles.approvalLetters,
      location: location ? JSON.parse(location) : {},
      price: price ? JSON.parse(price) : {},
      area: area ? JSON.parse(area) : {},
      bedrooms: bedrooms ? JSON.parse(bedrooms) : {},
      contactInfo: contactInfo ? JSON.parse(contactInfo) : {},
      createdBy: req.user?.id || null // Set to null if no user
    });

    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (error) {
    console.error('Error creating project:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to create project', details: error.message });
  }
});

// Get all projects (with filters for both admin and mobile)
router.get('/', async (req, res) => {
  try {
    const { status, featured, city, page = 1, limit = 10, public: isPublic } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (featured) filter.featured = featured === 'true';
    if (city) filter['location.city'] = new RegExp(city, 'i');
    
    // If public=true, only return public projects
    if (isPublic === 'true') {
      filter.isPublic = true;
    }

    const projects = await Project.find(filter)
      .populate('createdBy', 'name username')
      .populate('updatedBy', 'name username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments(filter);

    res.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Update project
router.put('/:id', uploadAll, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Handle file uploads
    if (req.files) {
      const uploadedFiles = formatUploadedFiles(req.files);
      
      // Merge with existing files or replace
      Object.keys(uploadedFiles).forEach(key => {
        if (uploadedFiles[key].length > 0) {
          updateData[key] = uploadedFiles[key];
        }
      });
    }

    // Parse JSON fields
    ['location', 'price', 'area', 'bedrooms', 'contactInfo'].forEach(field => {
      if (updateData[field]) {
        try {
          updateData[field] = JSON.parse(updateData[field]);
        } catch (e) {
          // If not JSON, keep as is
        }
      }
    });

    updateData.updatedBy = req.user?.id || 'system';

    const project = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name username')
     .populate('updatedBy', 'name username');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// ==================== CUSTOMER ROUTES ====================

// Get featured projects (This Week's Focus Projects)
router.get('/featured', async (req, res) => {
  try {
    const projects = await Project.find({ 
      featured: true, 
      status: 'active',
      isPublic: true 
    })
    .select('name description images location price area bedrooms contactInfo publicLink')
    .sort({ updatedAt: -1 })
    .limit(10);

    res.json(projects);
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    res.status(500).json({ error: 'Failed to fetch featured projects' });
  }
});

// Get project by public link
router.get('/public/:publicLink', async (req, res) => {
  try {
    const project = await Project.findOne({ 
      publicLink: req.params.publicLink,
      isPublic: true 
    })
    .select('-createdBy -updatedBy -__v');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Get project details (customer view)
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .select('-createdBy -updatedBy -__v');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// ==================== SHARING ROUTES ====================

// Generate sharing links
router.post('/:id/share', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const publicUrl = `${baseUrl}/api/projects/public/${project.publicLink}`;
    
    const shareLinks = {
      whatsapp: `https://wa.me/?text=Check out this project: ${project.name} - ${publicUrl}`,
      email: `mailto:?subject=${encodeURIComponent(project.name)}&body=${encodeURIComponent(`Check out this project: ${publicUrl}`)}`,
      publicLink: publicUrl
    };

    res.json(shareLinks);
  } catch (error) {
    console.error('Error generating share links:', error);
    res.status(500).json({ error: 'Failed to generate share links' });
  }
});



export default router; 