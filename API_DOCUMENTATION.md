# Project Module API Documentation

## Overview
The Project module provides comprehensive functionality for managing real estate projects with features for both admin/team users and customers.

## Base URL
```
http://localhost:5000/projects
```

## Authentication
Most admin endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Admin/Team Endpoints

### 1. Create New Project
**POST** `/projects`

Creates a new project with media files, location, and project details.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  ```
  name: "Project Name" (required)
  description: "Project description" (required)
  status: "active|inactive|completed|upcoming" (optional, default: active)
  featured: "true|false" (optional, default: false)
  location: JSON string
  price: JSON string
  area: JSON string
  bedrooms: JSON string
  contactInfo: JSON string
  siteVisitEnabled: "true|false" (optional, default: true)
  siteVisitDays: JSON array string (optional, default: ["sunday"])
  siteVisitSlots: JSON array string (optional)
  images: File[] (max 10)
  videos: File[] (max 5)
  brochures: File[] (max 5)
  layoutPlans: File[] (max 5)
  approvalLetters: File[] (max 5)
  ```

**Example Request:**
```javascript
const formData = new FormData();
formData.append('name', 'Luxury Heights Residency');
formData.append('description', 'Premium residential project...');
formData.append('featured', 'true');
formData.append('location', JSON.stringify({
  address: '123 Luxury Lane',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  coordinates: { latitude: 19.0760, longitude: 72.8777 }
}));
formData.append('price', JSON.stringify({
  min: 2500000,
  max: 8500000,
  currency: 'INR'
}));
formData.append('images', imageFile1);
formData.append('images', imageFile2);
formData.append('brochures', brochureFile);
```

**Response:**
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "name": "Luxury Heights Residency",
  "description": "Premium residential project...",
  "status": "active",
  "featured": true,
  "images": [
    {
      "url": "/uploads/media/images-1234567890-123456789.jpg",
      "originalName": "main-view.jpg",
      "size": 1024000,
      "mimetype": "image/jpeg",
      "order": 0
    }
  ],
  "publicLink": "project-64f8a1b2c3d4e5f6a7b8c9d0-1234567890",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### 2. Get All Projects (with filters)
**GET** `/projects`

**Query Parameters:**
- `status`: Filter by status
- `featured`: Filter by featured status (true/false)
- `city`: Filter by city
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `public`: Filter only public projects (true/false)

**Examples:**
```
GET /projects?status=active&featured=true&page=1&limit=5
GET /projects?public=true&city=Mumbai
```

**Response:**
```json
{
  "projects": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "Luxury Heights Residency",
      "status": "active",
      "featured": true,
      "createdBy": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "John Doe",
        "username": "johndoe"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "totalPages": 2,
  "currentPage": 1,
  "total": 15
}
```

### 3. Update Project
**PUT** `/projects/:id`

Updates an existing project. Supports file uploads and partial updates.

**Request:** Same as create project (multipart/form-data)

**Response:** Updated project object

### 4. Delete Project
**DELETE** `/projects/:id`

**Response:**
```json
{
  "message": "Project deleted successfully"
}
```

---

## Customer Endpoints

### 1. Get Featured Projects
**GET** `/projects/featured`

Returns "This Week's Focus Projects" - featured and active projects.

**Response:**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Luxury Heights Residency",
    "description": "Premium residential project...",
    "images": [...],
    "location": {
      "address": "123 Luxury Lane",
      "city": "Mumbai",
      "state": "Maharashtra"
    },
    "price": {
      "min": 2500000,
      "max": 8500000,
      "currency": "INR"
    },
    "publicLink": "project-64f8a1b2c3d4e5f6a7b8c9d0-1234567890"
  }
]
```

### 2. Get Project by Public Link
**GET** `/projects/public/:publicLink`

**Example:**
```
GET /projects/public/project-64f8a1b2c3d4e5f6a7b8c9d0-1234567890
```

**Response:** Complete project details (customer view)

### 3. Get Project Details
**GET** `/projects/:id`

**Response:** Project details without admin fields

---

## Sharing Endpoints

### Generate Share Links
**POST** `/projects/:id/share`

**Response:**
```json
{
  "whatsapp": "https://wa.me/?text=Check out this project: Luxury Heights Residency - http://localhost:5000/projects/public/project-64f8a1b2c3d4e5f6a7b8c9d0-1234567890",
  "email": "mailto:?subject=Luxury Heights Residency&body=Check out this project: http://localhost:5000/projects/public/project-64f8a1b2c3d4e5f6a7b8c9d0-1234567890",
  "publicLink": "http://localhost:5000/projects/public/project-64f8a1b2c3d4e5f6a7b8c9d0-1234567890"
}
```

---

## Site Visit Booking Endpoints

### 1. Book Site Visit
**POST** `/projects/:id/book-visit`

**Request:**
```json
{
  "customer": {
    "name": "John Doe",
    "phone": "+91-9876543210",
    "email": "john@example.com",
    "address": "123 Main Street, Mumbai"
  },
  "visitDate": "2024-01-21",
  "visitTime": "10:00 AM",
  "pickupLocation": {
    "address": "Andheri Station",
    "coordinates": {
      "latitude": 19.1197,
      "longitude": 72.8464
    }
  }
}
```

**Response:**
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
  "project": "64f8a1b2c3d4e5f6a7b8c9d0",
  "customer": {
    "name": "John Doe",
    "phone": "+91-9876543210",
    "email": "john@example.com"
  },
  "visitDate": "2024-01-21T00:00:00.000Z",
  "visitTime": "10:00 AM",
  "status": "pending",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### 2. Get Bookings for Project (Admin)
**GET** `/projects/:id/bookings`

**Response:** Array of booking objects

### 3. Update Booking Status
**PUT** `/projects/bookings/:bookingId`

**Request:**
```json
{
  "status": "confirmed",
  "cabDetails": {
    "driverName": "Ramesh Kumar",
    "driverPhone": "+91-9876543211",
    "vehicleNumber": "MH-01-AB-1234",
    "estimatedArrival": "2024-01-21T09:45:00.000Z"
  },
  "notes": "Customer confirmed for 10 AM slot"
}
```

---

## Customer Interest Endpoints

### 1. Submit Interest Form
**POST** `/projects/:id/interest`

**Request:**
```json
{
  "customer": {
    "name": "Jane Smith",
    "phone": "+91-9876543212",
    "email": "jane@example.com",
    "address": "456 Oak Street, Pune",
    "budget": {
      "min": 3000000,
      "max": 6000000,
      "currency": "INR"
    },
    "preferredArea": {
      "min": 1200,
      "max": 2000,
      "unit": "sqft"
    },
    "bedrooms": {
      "min": 2,
      "max": 3
    },
    "timeline": "3_months"
  },
  "inquiryType": "pricing",
  "message": "Interested in 2BHK options. Please share pricing details.",
  "source": "website"
}
```

**Response:**
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
  "project": "64f8a1b2c3d4e5f6a7b8c9d0",
  "customer": {
    "name": "Jane Smith",
    "phone": "+91-9876543212"
  },
  "inquiryType": "pricing",
  "status": "new",
  "source": "website",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### 2. Get Interests for Project (Admin)
**GET** `/projects/:id/interests`

**Response:** Array of interest objects with assigned user details

### 3. Update Interest Status
**PUT** `/projects/interests/:interestId`

**Request:**
```json
{
  "status": "contacted",
  "assignedTo": "64f8a1b2c3d4e5f6a7b8c9d1",
  "notes": "Called customer. Interested in 2BHK. Follow up next week."
}
```

---

## File Upload Specifications

### Supported File Types
- **Images**: JPEG, JPG, PNG, WebP
- **Videos**: MP4, AVI, MOV, WMV
- **Documents**: PDF, DOC, DOCX

### File Size Limits
- Maximum file size: 50MB per file
- Maximum files per request: 20

### File Storage Structure
```
uploads/
├── media/
│   ├── images-*.jpg
│   └── videos-*.mp4
└── documents/
    ├── brochures-*.pdf
    ├── layoutPlans-*.pdf
    └── approvalLetters-*.pdf
```

### File URLs
Files are accessible via:
```
http://localhost:5000/uploads/media/filename.jpg
http://localhost:5000/uploads/documents/filename.pdf
```

---

## Error Responses

### Common Error Codes
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

### Error Response Format
```json
{
  "error": "Error message description"
}
```

---

## Usage Examples

### Frontend Integration Examples

#### 1. Display Featured Projects
```javascript
fetch('/projects/featured')
  .then(response => response.json())
  .then(projects => {
    projects.forEach(project => {
      console.log(`${project.name} - ${project.price.min} to ${project.price.max} ${project.price.currency}`);
    });
  });
```

#### 2. Share Project via WhatsApp
```javascript
fetch(`/projects/${projectId}/share`)
  .then(response => response.json())
  .then(shareLinks => {
    window.open(shareLinks.whatsapp, '_blank');
  });
```

#### 3. Book Site Visit
```javascript
const bookingData = {
  customer: {
    name: 'John Doe',
    phone: '+91-9876543210',
    email: 'john@example.com'
  },
  visitDate: '2024-01-21',
  visitTime: '10:00 AM',
  pickupLocation: {
    address: 'Andheri Station'
  }
};

fetch(`/projects/${projectId}/book-visit`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(bookingData)
})
.then(response => response.json())
.then(booking => {
  console.log('Booking confirmed:', booking);
});
```

#### 4. Submit Interest Form
```javascript
const interestData = {
  customer: {
    name: 'Jane Smith',
    phone: '+91-9876543212',
    email: 'jane@example.com'
  },
  inquiryType: 'pricing',
  message: 'Interested in 2BHK options'
};

fetch(`/projects/${projectId}/interest`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(interestData)
})
.then(response => response.json())
.then(interest => {
  console.log('Interest submitted:', interest);
});
```

---

## Testing

### Seed Sample Data
Run the seed script to populate the database with sample projects:
```bash
node seed/seedProjects.js
```

### Test Endpoints
1. Create a project with files
2. View featured projects
3. Book a site visit
4. Submit interest form
5. Generate share links

---

## Notes
- All timestamps are in ISO 8601 format
- File uploads require multipart/form-data
- Public links are automatically generated for projects
- Site visits are restricted to specified days (default: Sunday only)
- Customer data is stored for follow-up purposes 