import express from 'express';
import {
  getApplications,
  getApplication,
  createApplication,
  updateApplicationStatus,
  getMyApplications,
  rejectJob,
} from '../controllers/applicationController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/my', protect, getMyApplications);
router.get('/', protect, getApplications);
router.get('/:id', protect, getApplication);
router.post('/', protect, createApplication);
router.post('/reject', protect, rejectJob);
router.put('/:id/status', protect, admin, updateApplicationStatus);

export default router;
