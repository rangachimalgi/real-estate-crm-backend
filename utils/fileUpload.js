import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    // Create different folders based on file type
    if (file.fieldname === 'images' || file.fieldname === 'videos') {
      uploadPath += 'media/';
    } else if (file.fieldname === 'brochures' || file.fieldname === 'layoutPlans' || file.fieldname === 'approvalLetters') {
      uploadPath += 'documents/';
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
  const allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  let allowedTypes = [];
  
  switch (file.fieldname) {
    case 'images':
      allowedTypes = allowedImageTypes;
      break;
    case 'videos':
      allowedTypes = allowedVideoTypes;
      break;
    case 'brochures':
    case 'layoutPlans':
    case 'approvalLetters':
      allowedTypes = allowedDocumentTypes;
      break;
    default:
      allowedTypes = [...allowedImageTypes, ...allowedVideoTypes, ...allowedDocumentTypes];
  }
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit (increased from 10MB)
    files: 20 // Maximum 20 files per request (increased from 10)
  }
});

// Specific upload configurations
export const uploadImages = upload.array('images', 10);
export const uploadVideos = upload.array('videos', 5);
export const uploadDocuments = upload.fields([
  { name: 'brochures', maxCount: 5 },
  { name: 'layoutPlans', maxCount: 5 },
  { name: 'approvalLetters', maxCount: 5 }
]);

export const uploadAll = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 5 },
  { name: 'brochures', maxCount: 5 },
  { name: 'layoutPlans', maxCount: 5 },
  { name: 'approvalLetters', maxCount: 5 }
]);

// Helper function to format uploaded files
export const formatUploadedFiles = (files) => {
  const formatted = {
    images: [],
    videos: [],
    brochures: [],
    layoutPlans: [],
    approvalLetters: []
  };
  
  if (!files) return formatted;
  
  Object.keys(files).forEach(fieldName => {
    if (files[fieldName]) {
      formatted[fieldName] = files[fieldName].map((file, index) => ({
        url: `/uploads/${fieldName === 'images' || fieldName === 'videos' ? 'media' : 'documents'}/${file.filename}`,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        order: index
      }));
    }
  });
  
  return formatted;
};

export default upload; 