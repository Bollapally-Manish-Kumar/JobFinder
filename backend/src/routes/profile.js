/**
 * Profile Routes
 * Handles user profile and resume management
 */

import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { uploadPDF, handleUploadError } from '../middlewares/upload.js';
import {
  getProfile,
  uploadResume,
  deleteResume,
  updateProfile
} from '../controllers/profileController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/profile
 * Get current user's profile
 */
router.get('/', getProfile);

/**
 * PUT /api/profile
 * Update user profile
 */
router.put('/', updateProfile);

/**
 * POST /api/profile/resume
 * Upload resume PDF (extracts text, doesn't store file)
 */
router.post(
  '/resume',
  uploadPDF.single('resume'),
  handleUploadError,
  uploadResume
);

/**
 * DELETE /api/profile/resume
 * Delete user's resume
 */
router.delete('/resume', deleteResume);

export default router;
