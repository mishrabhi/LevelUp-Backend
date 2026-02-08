import express from 'express';
import {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getAvailableJobs,
  getOverDeadlineJobs,
} from '../controllers/jobController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/available', protect, getAvailableJobs);
router.get('/overdeadline', protect, getOverDeadlineJobs);
router.get('/', protect, getJobs);
router.get('/:id', protect, getJob);
router.post('/', protect, admin, createJob);
router.put('/:id', protect, admin, updateJob);
router.delete('/:id', protect, admin, deleteJob);

export default router;
