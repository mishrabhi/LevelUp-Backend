import express from 'express';
import { getCampuses, getCampus, createCampus, updateCampus, deleteCampus } from '../controllers/campusController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getCampuses);
router.get('/:id', getCampus);

// Admin only routes
router.post('/', protect, admin, createCampus);
router.put('/:id', protect, admin, updateCampus);
router.delete('/:id', protect, admin, deleteCampus);

export default router;
