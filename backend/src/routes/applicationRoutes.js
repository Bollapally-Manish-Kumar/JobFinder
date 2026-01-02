/**
 * Application Routes
 * Handles job application tracking endpoints
 */

import express from 'express';
import { 
  getApplications, 
  addApplication, 
  updateApplication, 
  deleteApplication,
  checkApplication,
  bulkCheckApplications
} from '../controllers/applicationController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/applications - Get all user's applications
router.get('/', getApplications);

// POST /api/applications - Add new application
router.post('/', addApplication);

// POST /api/applications/bulk-check - Check multiple jobs
router.post('/bulk-check', bulkCheckApplications);

// GET /api/applications/check/:jobId - Check if tracking a job
router.get('/check/:jobId', checkApplication);

// PATCH /api/applications/:id - Update application status
router.patch('/:id', updateApplication);

// DELETE /api/applications/:id - Delete application
router.delete('/:id', deleteApplication);

export default router;
