import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Role from '../models/Role.js';

dotenv.config();

const sampleProjects = [
  {
    name: "Luxury Heights Residency",
    description: "Premium residential project with world-class amenities and modern architecture. Located in the heart of the city with easy access to all major facilities.",
    status: "active",
    featured: true,
    images: [
      {
        url: "/uploads/media/sample-project-1-main.jpg",
        caption: "Main Building View",
        order: 1
      },
      {
        url: "/uploads/media/sample-project-1-amenities.jpg",
        caption: "Swimming Pool & Gym",
        order: 2
      }
    ],
    videos: [
      {
        url: "/uploads/media/sample-project-1-video.mp4",
        caption: "Project Overview Video",
        order: 1
      }
    ],
    brochures: [
      {
        url: "/uploads/documents/luxury-heights-brochure.pdf",
        name: "Luxury Heights Brochure",
        description: "Complete project brochure with floor plans and amenities"
      }
    ],
    layoutPlans: [
      {
        url: "/uploads/documents/luxury-heights-layout.pdf",
        name: "Site Layout Plan",
        description: "Complete site layout and floor plans"
      }
    ],
    approvalLetters: [
      {
        url: "/uploads/documents/luxury-heights-approval.pdf",
        name: "RERA Approval",
        description: "RERA approval letter and compliance documents"
      }
    ],
    location: {
      address: "123 Luxury Lane, Downtown",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      coordinates: {
        latitude: 19.0760,
        longitude: 72.8777
      }
    },
    price: {
      min: 2500000,
      max: 8500000,
      currency: "INR"
    },
    area: {
      min: 1200,
      max: 3500,
      unit: "sqft"
    },
    bedrooms: {
      min: 2,
      max: 4
    },
    contactInfo: {
      phone: "+91-9876543210",
      email: "info@luxuryheights.com",
      whatsapp: "+91-9876543210"
    },
    isPublic: true
  },
  {
    name: "Green Valley Apartments",
    description: "Eco-friendly residential project with sustainable design and green building features. Perfect for nature lovers who want modern comfort.",
    status: "active",
    featured: true,
    images: [
      {
        url: "/uploads/media/sample-project-2-main.jpg",
        caption: "Green Valley Main View",
        order: 1
      },
      {
        url: "/uploads/media/sample-project-2-garden.jpg",
        caption: "Landscaped Gardens",
        order: 2
      }
    ],
    videos: [
      {
        url: "/uploads/media/sample-project-2-video.mp4",
        caption: "Green Valley Tour",
        order: 1
      }
    ],
    brochures: [
      {
        url: "/uploads/documents/green-valley-brochure.pdf",
        name: "Green Valley Brochure",
        description: "Eco-friendly features and amenities guide"
      }
    ],
    layoutPlans: [
      {
        url: "/uploads/documents/green-valley-layout.pdf",
        name: "Green Valley Layout",
        description: "Site plan with green spaces and amenities"
      }
    ],
    approvalLetters: [
      {
        url: "/uploads/documents/green-valley-approval.pdf",
        name: "Environmental Clearance",
        description: "Environmental clearance and green building certification"
      }
    ],
    location: {
      address: "456 Green Avenue, Suburban Area",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411001",
      coordinates: {
        latitude: 18.5204,
        longitude: 73.8567
      }
    },
    price: {
      min: 1800000,
      max: 5500000,
      currency: "INR"
    },
    area: {
      min: 1000,
      max: 2800,
      unit: "sqft"
    },
    bedrooms: {
      min: 1,
      max: 3
    },
    contactInfo: {
      phone: "+91-9876543211",
      email: "info@greenvalley.com",
      whatsapp: "+91-9876543211"
    },
    isPublic: true
  },
  {
    name: "Business Park Plaza",
    description: "Commercial project with office spaces, retail outlets, and business facilities. Ideal for entrepreneurs and corporate offices.",
    status: "upcoming",
    featured: false,
    images: [
      {
        url: "/uploads/media/sample-project-3-main.jpg",
        caption: "Business Park Exterior",
        order: 1
      }
    ],
    videos: [],
    brochures: [
      {
        url: "/uploads/documents/business-park-brochure.pdf",
        name: "Business Park Brochure",
        description: "Commercial space details and pricing"
      }
    ],
    layoutPlans: [
      {
        url: "/uploads/documents/business-park-layout.pdf",
        name: "Business Park Layout",
        description: "Office and retail space layout"
      }
    ],
    approvalLetters: [
      {
        url: "/uploads/documents/business-park-approval.pdf",
        name: "Commercial License",
        description: "Commercial development license and approvals"
      }
    ],
    location: {
      address: "789 Business Street, CBD",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
      coordinates: {
        latitude: 12.9716,
        longitude: 77.5946
      }
    },
    price: {
      min: 5000000,
      max: 25000000,
      currency: "INR"
    },
    area: {
      min: 2000,
      max: 10000,
      unit: "sqft"
    },
    bedrooms: {
      min: 0,
      max: 0
    },
    contactInfo: {
      phone: "+91-9876543212",
      email: "info@businesspark.com",
      whatsapp: "+91-9876543212"
    },
    isPublic: true
  }
];

const seedProjects = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing projects
    await Project.deleteMany({});
    console.log('Cleared existing projects');

    // Get a default user for createdBy field
    const defaultUser = await User.findOne();
    const defaultUserId = defaultUser ? defaultUser._id : null;

    // Add createdBy to each project and generate public links
    const projectsWithUser = sampleProjects.map(project => ({
      ...project,
      createdBy: defaultUserId,
      publicLink: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));

    // Insert sample projects
    const insertedProjects = await Project.insertMany(projectsWithUser);
    console.log(`Seeded ${insertedProjects.length} projects successfully`);

    // Display created projects
    insertedProjects.forEach(project => {
      console.log(`- ${project.name} (${project.status}) - Public Link: ${project.publicLink}`);
    });

    console.log('Project seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding projects:', error);
    process.exit(1);
  }
};

// Run the seeding
seedProjects(); 