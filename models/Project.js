import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'completed', 'upcoming'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  // Media files
  images: [{
    url: String,
    caption: String,
    order: Number
  }],
  videos: [{
    url: String,
    caption: String,
    order: Number
  }],
  brochures: [{
    url: String,
    name: String,
    description: String
  }],
  layoutPlans: [{
    url: String,
    name: String,
    description: String
  }],
  approvalLetters: [{
    url: String,
    name: String,
    description: String
  }],
  
  // Location information
  location: {
    address: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Project details
  price: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'INR'
    }
  },
  area: {
    min: Number,
    max: Number,
    unit: {
      type: String,
      default: 'sqft'
    }
  },
  bedrooms: {
    min: Number,
    max: Number
  },
  
  // Contact information
  contactInfo: {
    phone: String,
    email: String,
    whatsapp: String
  },
  
  // Sharing and visibility
  publicLink: {
    type: String,
    unique: true,
    sparse: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  

  
  // Created by and timestamps
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Generate public link on save if not exists
ProjectSchema.pre('save', function(next) {
  if (!this.publicLink) {
    // Use a random string instead of _id since it might not be available yet
    const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    this.publicLink = `project-${randomId}-${Date.now()}`;
  }
  next();
});

// Index for better query performance
ProjectSchema.index({ status: 1, featured: 1 });
ProjectSchema.index({ publicLink: 1 });
ProjectSchema.index({ 'location.city': 1 });

const Project = mongoose.model('Project', ProjectSchema);
export default Project; 