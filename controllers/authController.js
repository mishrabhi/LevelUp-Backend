import jwt from 'jsonwebtoken';
import User from '../models/User.js';

//Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
    expiresIn: '30d',
  });
};

//Login user and get token - both admin and students can log in with this endpoint, and it will return a token that can be used for authentication in other endpoints
//Endpoint: POST /api/auth/login
//Access: Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      console.log("returning invalid email");
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log("returning invalid password");
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        year: user.year,
        CGPA: user.CGPA,
        skills: user.skills,
        campus: user.campus,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Signup - students and admins can signup with their respective details
//Endpoint: POST /api/auth/signup
//Access: Public
export const signup = async (req, res) => {
  try {
    const { name, email, password, role, branch, year, CGPA, skills, campus } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide name, email, password, and role' });
    }

    // Validate role
    if (!['Student', 'Admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either Student or Admin' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Create user object
    const userData = {
      name,
      email,
      password,
      role,
    };

    // Add student-specific fields if role is Student
    if (role === 'Student') {
      userData.branch = branch || '';
      userData.year = year || null;
      userData.CGPA = CGPA || null;
      userData.skills = Array.isArray(skills) ? skills : (skills ? [skills] : []);
      userData.campus = campus || '';
    }

    // Create and save user
    const user = new User(userData);
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        year: user.year,
        CGPA: user.CGPA,
        skills: user.skills,
        campus: user.campus,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get current logged in user - both admin and students can access this endpoint, and it will return the details of the logged in user
//Endpoint: GET /api/auth/me
//Access: Admin and Student
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
      year: user.year,
      CGPA: user.CGPA,
      skills: user.skills,
      campus: user.campus,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
