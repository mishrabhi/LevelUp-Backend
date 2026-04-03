import express from 'express';
import { getUsers, getUser, updateUser } from '../controllers/userController.js';
import { protect, admin } from '../middleware/auth.js';
import upload from '../config/multer.js';

const router = express.Router();

router.get('/', protect, admin, getUsers);
router.get('/:id', protect, getUser);
router.put('/:id', protect, upload.single('profilePicture'), updateUser);

export default router;
