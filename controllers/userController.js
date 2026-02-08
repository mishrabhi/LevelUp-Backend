import User from '../models/User.js';

//Get all users - only admin can access this endpoint, and they can filter by role and search by name/email
//Endpoint: GET /api/users
//Access: Admin only
export const getUsers = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can view all users' });
    }

    const { role, search } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get single user by ID - admin can access any user, while students can only access their own profile
//Endpoint: GET /api/users/:id
//Access: Admin and Student (students only see their own profile)
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Students can only view their own profile, admins can view any
    if (req.user.role === 'Student' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Update user by ID - admin can update any user, while students can only update their own profile
//Endpoint: PUT /api/users/:id
//Access: Admin and Student (students only update their own profile)
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Students can only update their own profile, admins can update any
    if (req.user.role === 'Student' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Don't allow password update through this endpoint
    delete req.body.password;
    delete req.body.role; // Don't allow role change through this endpoint

    Object.assign(user, req.body);
    await user.save();

    const userResponse = user.toJSON();
    res.json(userResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
