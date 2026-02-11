import Campus from '../models/Campus.js';

// Get all campuses
// Endpoint: GET /api/campuses
// Access: Public
export const getCampuses = async (req, res) => {
  try {
    const campuses = await Campus.find().sort({ name: 1 });
    res.json(campuses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single campus by ID
// Endpoint: GET /api/campuses/:id
// Access: Public
export const getCampus = async (req, res) => {
  try {
    const campus = await Campus.findById(req.params.id);
    if (!campus) {
      return res.status(404).json({ message: 'Campus not found' });
    }
    res.json(campus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new campus
// Endpoint: POST /api/campuses
// Access: Admin only
export const createCampus = async (req, res) => {
  try {
    const { name, location, description } = req.body;

    // Validate required fields
    if (!name || !location) {
      return res.status(400).json({ message: 'Please provide name and location' });
    }

    // Check if campus already exists
    const existingCampus = await Campus.findOne({ name: { $regex: name, $options: 'i' } });
    if (existingCampus) {
      return res.status(400).json({ message: 'Campus with this name already exists' });
    }

    const campus = new Campus({
      name: name.trim(),
      location: location.trim(),
      description: description || '',
    });

    await campus.save();

    res.status(201).json({
      success: true,
      message: 'Campus created successfully',
      campus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update campus
// Endpoint: PUT /api/campuses/:id
// Access: Admin only
export const updateCampus = async (req, res) => {
  try {
    const { name, location, description } = req.body;

    let campus = await Campus.findById(req.params.id);
    if (!campus) {
      return res.status(404).json({ message: 'Campus not found' });
    }

    // Check if new name already exists (if name is being changed)
    if (name && name !== campus.name) {
      const existingCampus = await Campus.findOne({ name: { $regex: name, $options: 'i' } });
      if (existingCampus) {
        return res.status(400).json({ message: 'Campus with this name already exists' });
      }
    }

    campus.name = name ? name.trim() : campus.name;
    campus.location = location ? location.trim() : campus.location;
    campus.description = description !== undefined ? description : campus.description;

    await campus.save();

    res.json({
      success: true,
      message: 'Campus updated successfully',
      campus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete campus
// Endpoint: DELETE /api/campuses/:id
// Access: Admin only
export const deleteCampus = async (req, res) => {
  try {
    const campus = await Campus.findByIdAndDelete(req.params.id);
    if (!campus) {
      return res.status(404).json({ message: 'Campus not found' });
    }

    res.json({
      success: true,
      message: 'Campus deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
