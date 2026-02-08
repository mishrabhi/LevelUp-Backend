import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

dotenv.config();

// Get current date for reference
const today = new Date();
today.setHours(0, 0, 0, 0);

// Future dates
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

const threeDaysFromNow = new Date(today);
threeDaysFromNow.setDate(today.getDate() + 3);

const sevenDaysFromNow = new Date(today);
sevenDaysFromNow.setDate(today.getDate() + 7);

const fourteenDaysFromNow = new Date(today);
fourteenDaysFromNow.setDate(today.getDate() + 14);

// Past dates
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(today.getDate() - 3);


// Simple, clean test data
const users = [
  // Admin
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'Admin',
    branch: '',
    year: null,
    CGPA: null,
    skills: [],
    campus: '',
  },
  // Main test student
  {
    name: 'Raj Kumar',
    email: 'student@example.com',
    password: 'student123',
    role: 'Student',
    branch: 'Computer Science',
    year: 4,
    CGPA: 8.5,
    skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
    campus: 'BCA Himachal',
  },
  // Dummy students for other campuses
  {
    name: 'Priya Singh',
    email: 'priya@example.com',
    password: 'priya123',
    role: 'Student',
    branch: 'Computer Science',
    year: 3,
    CGPA: 8.2,
    skills: ['React', 'Python', 'JavaScript'],
    campus: 'Pune',
  },
  {
    name: 'Amit Patel',
    email: 'amit@example.com',
    password: 'amit123',
    role: 'Student',
    branch: 'Information Technology',
    year: 4,
    CGPA: 7.9,
    skills: ['Node.js', 'MongoDB', 'Express'],
    campus: 'Dharamshala',
  },
  {
    name: 'Sneha Gupta',
    email: 'sneha@example.com',
    password: 'sneha123',
    role: 'Student',
    branch: 'Electronics',
    year: 3,
    CGPA: 8.0,
    skills: ['Python', 'Machine Learning', 'JavaScript'],
    campus: 'Jashpur',
  },
  {
    name: 'Vikram Reddy',
    email: 'vikram@example.com',
    password: 'vikram123',
    role: 'Student',
    branch: 'Computer Science',
    year: 4,
    CGPA: 8.3,
    skills: ['React', 'TypeScript', 'Node.js'],
    campus: 'Raigarh',
  },
];


const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB\n');

    // Clear all collections
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    console.log('Database cleared\n');

    // Create users
    console.log('Creating users...');
    const createdUsers = await User.insertMany(users);
    console.log(`✓ Created ${createdUsers.length} users\n`);

    // Get user references
    const admin = createdUsers.find(u => u.role === 'Admin');
    const mainStudent = createdUsers.find(u => u.email === 'student@example.com');
    const priya = createdUsers.find(u => u.email === 'priya@example.com');
    const amit = createdUsers.find(u => u.email === 'amit@example.com');
    const sneha = createdUsers.find(u => u.email === 'sneha@example.com');
    const vikram = createdUsers.find(u => u.email === 'vikram@example.com');

    // Create jobs
    const jobs = [
      {
        companyName: 'TechCorp India',
        jobTitle: 'Full Stack Developer',
        jobDescription: 'Looking for an experienced Full Stack Developer to build web applications.',
        eligibilityCriteria: {
          branch: ['Computer Science', 'Information Technology'],
          year: [3, 4],
          minCGPA: 7.5,
          requiredSkills: ['React', 'Node.js'],
        },
        applicationDeadline: sevenDaysFromNow,
        campuses: ['BCA Himachal', 'Pune'],
        allowedStudents: [mainStudent._id, vikram._id],
        createdBy: admin._id,
      },
      {
        companyName: 'DataSoft Solutions',
        jobTitle: 'Python Developer',
        jobDescription: 'Build data processing pipelines and APIs using Python.',
        eligibilityCriteria: {
          branch: ['Computer Science', 'Electronics'],
          year: [3, 4],
          minCGPA: 7.0,
          requiredSkills: ['Python'],
        },
        applicationDeadline: fourteenDaysFromNow,
        campuses: ['Dharamshala', 'Jashpur'],
        allowedStudents: [amit._id, sneha._id],
        createdBy: admin._id,
      },
      {
        companyName: 'CloudOne Tech',
        jobTitle: 'Frontend Engineer',
        jobDescription: 'Create stunning UI/UX with React and modern design patterns.',
        eligibilityCriteria: {
          branch: ['Computer Science', 'Information Technology'],
          year: [4],
          minCGPA: 8.0,
          requiredSkills: ['React', 'JavaScript'],
        },
        applicationDeadline: threeDaysFromNow,
        campuses: ['BCA Himachal'],
        allowedStudents: [mainStudent._id, priya._id],
        createdBy: admin._id,
      },
      {
        companyName: 'InnovateLabs',
        jobTitle: 'Backend Engineer',
        jobDescription: 'Design and build scalable backend systems with Node.js and MongoDB.',
        eligibilityCriteria: {
          branch: ['Computer Science'],
          year: [4],
          minCGPA: 8.0,
          requiredSkills: ['Node.js', 'MongoDB'],
        },
        applicationDeadline: yesterday, // PAST DEADLINE - for Over Deadline testing
        campuses: ['Pune'],
        allowedStudents: [mainStudent._id],
        createdBy: admin._id,
      },
      {
        companyName: 'AI Ventures',
        jobTitle: 'Machine Learning Engineer',
        jobDescription: 'Work on cutting-edge ML models and deep learning projects.',
        eligibilityCriteria: {
          branch: ['Electronics'],
          year: [3, 4],
          minCGPA: 7.5,
          requiredSkills: ['Python'],
        },
        applicationDeadline: threeDaysAgo, // PAST DEADLINE - for Over Deadline testing
        campuses: ['Jashpur', 'Raigarh'],
        allowedStudents: [sneha._id],
        createdBy: admin._id,
      },
    ];

    console.log('Creating jobs...');
    const createdJobs = await Job.insertMany(jobs);
    console.log(`✓ Created ${createdJobs.length} jobs\n`);

    console.log('='.repeat(60));
    console.log('DATABASE SEEDING COMPLETE');
    console.log('='.repeat(60));
    console.log('\n📝 TEST CREDENTIALS\n');

    console.log('ADMIN ACCOUNT:');
    console.log('  Email: admin@example.com');
    console.log('  Password: admin123');

    console.log('\nMAIN STUDENT ACCOUNT:');
    console.log('  Email: student@example.com');
    console.log('  Password: student123');
    console.log('  Campus: BCA Himachal');

    console.log('\nOTHER STUDENTS (For Testing):');
    console.log('  Name: Priya Singh | Email: priya@example.com | Password: priya123 | Campus: Pune');
    console.log('  Name: Amit Patel | Email: amit@example.com | Password: amit123 | Campus: Dharamshala');
    console.log('  Name: Sneha Gupta | Email: sneha@example.com | Password: sneha123 | Campus: Jashpur');
    console.log('  Name: Vikram Reddy | Email: vikram@example.com | Password: vikram123 | Campus: Raigarh');

    console.log('\n📋 JOBS CREATED\n');
    console.log('1. TechCorp India - Full Stack Developer');
    console.log('   Allowed Students: Raj Kumar, Vikram Reddy');
    console.log('   Deadline: 7 days from now (ACTIVE)\n');

    console.log('2. DataSoft Solutions - Python Developer');
    console.log('   Allowed Students: Amit Patel, Sneha Gupta');
    console.log('   Deadline: 14 days from now (ACTIVE)\n');

    console.log('3. CloudOne Tech - Frontend Engineer');
    console.log('   Allowed Students: Raj Kumar, Priya Singh');
    console.log('   Deadline: 3 days from now (ACTIVE)\n');

    console.log('4. InnovateLabs - Backend Engineer');
    console.log('   Allowed Students: Raj Kumar');
    console.log('   Deadline: YESTERDAY (OVER DEADLINE)\n');

    console.log('5. AI Ventures - Machine Learning Engineer');
    console.log('   Allowed Students: Sneha Gupta');
    console.log('   Deadline: 3 DAYS AGO (OVER DEADLINE)\n');

    console.log('='.repeat(60));
    console.log('TESTING TIPS:');
    console.log('='.repeat(60));
    console.log('1. Login as admin → Create job with selected students');
    console.log('2. Logout → Login as student → See job in "Available Jobs"');
    console.log('3. Apply for job → See it in "My Applications"');
    console.log('4. Admin updates status → Student sees status change');
    console.log('5. Past deadline jobs appear in "Over Deadline" tab');
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
