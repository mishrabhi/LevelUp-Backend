import Job from '../models/Job.js';
import Application from '../models/Application.js';
import User from '../models/User.js';

//Get all jobs with pagination and search - both admin and students can access this endpoint, but students will only see jobs that are still open (deadline not passed) and they haven't applied to yet
//Endpoint: GET /api/jobs
//Access: Admin and Student (students only see open jobs they haven't applied to)
export const getJobs = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { jobTitle: { $regex: search, $options: 'i' } },
        { jobDescription: { $regex: search, $options: 'i' } },
      ];
    }

    const jobs = await Job.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get single job by ID - both admin and students can access this endpoint, but students will only see the job if it's still open (deadline not passed) and they haven't applied to it yet
//Endpoint: GET /api/jobs/:id
//Access: Admin and Student (students only see open jobs they haven't applied to)  
export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('createdBy', 'name email');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Create job - only admin can create jobs, and they can specify allowedStudents array to restrict which students can see/apply to the job
//Endpoint: POST /api/jobs
//Access: Admin only
export const createJob = async (req, res) => {
  try {
    // Extract job data
    const { companyName, jobTitle, jobDescription, eligibilityCriteria, applicationDeadline, campuses, allowedStudents } = req.body;

    // Validate required fields
    if (!companyName || !jobTitle || !jobDescription || !eligibilityCriteria || !applicationDeadline || !campuses || campuses.length === 0) {
      return res.status(400).json({ message: 'Missing required fields: companyName, jobTitle, jobDescription, eligibilityCriteria, applicationDeadline, and campuses' });
    }

    const job = new Job({
      companyName,
      jobTitle,
      jobDescription,
      eligibilityCriteria: {
        branch: eligibilityCriteria.branch || [],
        year: eligibilityCriteria.year || [],
        minCGPA: eligibilityCriteria.minCGPA || 0,
        requiredSkills: eligibilityCriteria.requiredSkills || [],
      },
      applicationDeadline: new Date(applicationDeadline),
      campuses: campuses || [],
      allowedStudents: allowedStudents || [],
      createdBy: req.user._id,
    });

    const savedJob = await job.save();
    const populatedJob = await Job.findById(savedJob._id)
      .populate('createdBy', 'name email')
      .populate('allowedStudents', 'name email branch year CGPA campus');

    res.status(201).json(populatedJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is admin or the creator
    if (req.user.role !== 'Admin' && job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    // Update fields
    const { companyName, jobTitle, jobDescription, eligibilityCriteria, applicationDeadline, campuses, allowedStudents } = req.body;
    
    if (companyName) job.companyName = companyName;
    if (jobTitle) job.jobTitle = jobTitle;
    if (jobDescription) job.jobDescription = jobDescription;
    if (eligibilityCriteria) {
      job.eligibilityCriteria = {
        branch: eligibilityCriteria.branch || job.eligibilityCriteria.branch,
        year: eligibilityCriteria.year || job.eligibilityCriteria.year,
        minCGPA: eligibilityCriteria.minCGPA || job.eligibilityCriteria.minCGPA,
        requiredSkills: eligibilityCriteria.requiredSkills || job.eligibilityCriteria.requiredSkills,
      };
    }
    if (applicationDeadline) job.applicationDeadline = new Date(applicationDeadline);
    if (campuses) job.campuses = campuses;
    if (allowedStudents) job.allowedStudents = allowedStudents;

    const updatedJob = await job.save();
    const populatedJob = await Job.findById(updatedJob._id)
      .populate('createdBy', 'name email')
      .populate('allowedStudents', 'name email branch year CGPA campus');
    res.json(populatedJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is admin or the creator
    if (req.user.role !== 'Admin' && job.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    // Delete all applications for this job
    await Application.deleteMany({ jobId: req.params.id });
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAvailableJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'Student') {
      return res.status(403).json({ message: 'Only students can view available jobs' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all jobs with future deadlines
    const jobs = await Job.find({
      applicationDeadline: { $gte: today },
    })
      .populate('createdBy', 'name email')
      .populate('allowedStudents', 'name email')
      .sort({ createdAt: -1 });

    // Get student's all applications to exclude those jobs
    const studentApplications = await Application.find({
      studentId: user._id
    });
    const appliedJobIds = studentApplications.map(a => a.jobId.toString());

    // Filter jobs based on:
    // 1. Student must be in allowedStudents array
    // 2. Student must not have already applied or rejected
    // 3. Job deadline must be in future
    const eligibleJobs = jobs.filter((job) => {
      // Check 1: Is student in allowedStudents array?
      if (job.allowedStudents && job.allowedStudents.length > 0) {
        const isStudentAllowed = job.allowedStudents.some(
          studentObj => {
            const studentId = typeof studentObj === 'object' ? (studentObj._id?.toString() || studentObj._id) : studentObj.toString();
            return studentId === user._id.toString();
          }
        );
        // If allowedStudents is specified and student is NOT in it, hide the job
        if (!isStudentAllowed) {
          return false;
        }
      }

      // Check 2: Has student already applied?
      if (appliedJobIds.includes(job._id.toString())) {
        return false;
      }

      // If all checks pass, show the job
      return true;
    });

    res.json(eligibleJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOverDeadlineJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'Student') {
      return res.status(403).json({ message: 'Only students can view over deadline jobs' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all jobs with past deadlines
    const jobs = await Job.find({
      applicationDeadline: { $lt: today },
    })
      .populate('createdBy', 'name email')
      .populate('allowedStudents', 'name email')
      .sort({ createdAt: -1 });

    // Get student's applications (any status) to exclude applied/rejected jobs
    const studentApplications = await Application.find({
      studentId: user._id
    });
    const appliedJobIds = studentApplications.map(a => a.jobId.toString());

    // Filter jobs based on:
    // 1. Student must be in allowedStudents array
    // 2. Student must not have applied or rejected the job
    const eligibleOverDeadlineJobs = jobs.filter((job) => {
      // Check 1: Is student in allowedStudents array?
      if (job.allowedStudents && job.allowedStudents.length > 0) {
        const isStudentAllowed = job.allowedStudents.some(
          studentObj => {
            const studentId = typeof studentObj === 'object' ? (studentObj._id?.toString() || studentObj._id) : studentObj.toString();
            return studentId === user._id.toString();
          }
        );
        // If allowedStudents is specified and student is NOT in it, hide the job
        if (!isStudentAllowed) {
          return false;
        }
      }

      // Check 2: Has student already applied?
      if (appliedJobIds.includes(job._id.toString())) {
        return false;
      }

      // If all checks pass, show the job
      return true;
    });

    res.json(eligibleOverDeadlineJobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
