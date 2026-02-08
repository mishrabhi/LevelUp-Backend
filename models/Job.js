import mongoose from 'mongoose';

const eligibilityCriteriaSchema = new mongoose.Schema({
  branch: {
    type: [String],
    default: [],
  },
  year: {
    type: [Number],
    default: [],
  },
  minCGPA: {
    type: Number,
    required: true,
  },
  requiredSkills: {
    type: [String],
    default: [],
  },
}, { _id: false });

const jobSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true,
  },
  jobDescription: {
    type: String,
    required: true,
  },
  eligibilityCriteria: {
    type: eligibilityCriteriaSchema,
    required: true,
  },
  applicationDeadline: {
    type: Date,
    required: true,
  },
  campuses: {
    type: [String],
    required: true,
    default: [],
  },
  allowedStudents: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: [],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const Job = mongoose.model('Job', jobSchema);

export default Job;
