import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

//Get all applications - admin can filter by jobId, studentId, and status, while students can only see their own applications
//Endpoint: GET /api/applications
//Access: Admin and Student (students only see their own applications)
export const getApplications = async (req, res) => {
  try {
    const { jobId, studentId, status } = req.query;
    const query = {};

    if (req.user.role === 'Student') {
      query.studentId = req.user._id;
    } else if (req.user.role === 'Admin') {
      if (jobId) query.jobId = jobId;
      if (studentId) query.studentId = studentId;
    }

    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('studentId', 'name email branch year CGPA skills campus')
      .populate('jobId', 'companyName jobTitle jobDescription eligibilityCriteria applicationDeadline')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get single application by ID - admin can access any application, while students can only access their own applications
//Endpoint: GET /api/applications/:id
//Access: Admin and Student (students only see their own applications)
export const getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('studentId', 'name email branch year CGPA skills campus')
      .populate('jobId', 'companyName jobTitle jobDescription eligibilityCriteria applicationDeadline');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if user has access to this application
    if (
      req.user.role === 'Student' &&
      application.studentId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Create application - only students can apply for jobs, and only if deadline has not passed, and only if they haven't already applied to that job
//Endpoint: POST /api/applications
//Access: Student only
export const createApplication = async (req, res) => {
  try {
    if (req.user.role !== 'Student') {
      return res.status(403).json({ message: 'Only students can apply for jobs' });
    }

    const { jobId } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if deadline has passed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (job.applicationDeadline < today) {
      return res.status(400).json({ message: 'Application deadline has passed' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      studentId: req.user._id,
      jobId: jobId,
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied to this job' });
    }

    // No eligibility checks - admin already selected who can see this job
    const application = new Application({
      studentId: req.user._id,
      jobId: jobId,
      status: 'Applied',
    });

    const savedApplication = await application.save();
    const populatedApplication = await Application.findById(savedApplication._id)
      .populate('studentId', 'name email branch year CGPA skills campus')
      .populate('jobId', 'companyName jobTitle jobDescription eligibilityCriteria applicationDeadline');

    res.status(201).json(populatedApplication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//Update application status - only admin can do this, and only to Shortlisted, Selected, or Rejected (NOT 'Applied')
//Endpoint: PUT /api/applications/:id/status
//Access: Admin only
export const updateApplicationStatus = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can update application status' });
    }

    const { status } = req.body;
    // Only allow admin to set these statuses - NOT 'Applied'
    const validStatuses = ['Shortlisted', 'Selected', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Admin can only set: Shortlisted, Selected, or Rejected' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    application.updatedAt = new Date();
    await application.save();

    const populatedApplication = await Application.findById(application._id)
      .populate('studentId', 'name email branch year CGPA skills campus')
      .populate('jobId', 'companyName jobTitle jobDescription eligibilityCriteria applicationDeadline');

    res.json(populatedApplication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    if (req.user.role !== 'Student') {
      return res.status(403).json({ message: 'Only students can view their applications' });
    }

    const applications = await Application.find({ studentId: req.user._id })
      .populate('jobId', 'companyName jobTitle jobDescription eligibilityCriteria applicationDeadline')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectJob = async (req, res) => {
  try {
    if (req.user.role !== 'Student') {
      return res.status(403).json({ message: 'Only students can reject jobs' });
    }

    const { jobId } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    let application = await Application.findOne({
      studentId: req.user._id,
      jobId: jobId,
    });

    if (application) {
      // If already applied, update status to Rejected
      application.status = 'Rejected';
      application.updatedAt = new Date();
      await application.save();
    } else {
      // Create new rejected application
      application = new Application({
        studentId: req.user._id,
        jobId: jobId,
        status: 'Rejected',
      });
      await application.save();
    }

    const populatedApplication = await Application.findById(application._id)
      .populate('studentId', 'name email branch year CGPA skills campus')
      .populate('jobId', 'companyName jobTitle jobDescription eligibilityCriteria applicationDeadline');

    res.status(201).json(populatedApplication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
