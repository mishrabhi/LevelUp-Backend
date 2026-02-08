# LevelUP by NG - Backend API

Backend API for the LevelUP by NG Campus Placement Portal built with Node.js, Express, and MongoDB.

## Features

- User authentication with JWT tokens
- Role-based access control (Admin/Student)
- Job posting and management
- Application submission and tracking
- Password hashing with bcrypt
- MongoDB database integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
```

4. Seed the database with initial data:
```bash
npm run seed
```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will run on `http://localhost:5000` by default.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Jobs
- `GET /api/jobs` - Get all jobs (protected, admin only for full list)
- `GET /api/jobs/available` - Get available jobs for students (protected)
- `GET /api/jobs/:id` - Get job by ID (protected)
- `POST /api/jobs` - Create new job (protected, admin only)
- `PUT /api/jobs/:id` - Update job (protected, admin only)
- `DELETE /api/jobs/:id` - Delete job (protected, admin only)

### Applications
- `GET /api/applications` - Get all applications (protected)
- `GET /api/applications/my` - Get current user's applications (protected)
- `GET /api/applications/:id` - Get application by ID (protected)
- `POST /api/applications` - Create new application (protected, student only)
- `PUT /api/applications/:id/status` - Update application status (protected, admin only)

### Users
- `GET /api/users` - Get all users (protected, admin only)
- `GET /api/users/:id` - Get user by ID (protected)
- `PUT /api/users/:id` - Update user (protected)

## Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Database Models

### User
- name, email, password (hashed), role, branch, year, CGPA, skills, campus, createdAt

### Job
- companyName, jobTitle, jobDescription, eligibilityCriteria, applicationDeadline, createdBy, createdAt

### Application
- studentId, jobId, status, appliedAt, updatedAt

## Default Credentials

After seeding the database:
- **Admin**: admin@example.com / admin123
- **Student**: student@example.com / password123

## Notes

- Passwords are hashed using bcrypt before storage
- JWT tokens expire after 30 days
- Application statuses: Applied, Shortlisted, Selected, Rejected
