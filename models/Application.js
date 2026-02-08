import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Selected', 'Rejected'],
    default: 'Applied',
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Prevent duplicate applications
applicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

export default Application;
