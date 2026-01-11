/**
 * Admin Routes
 * Protected routes for admin operations
 */

import express from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth.js';
import {
  createJobWithAI,
  bulkCreateJobs,
  getAdminJobs,
  deleteJob
} from '../controllers/adminJobController.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// =============================================
// JOB MANAGEMENT
// =============================================

// Create a single job with AI auto-fill
router.post('/jobs', createJobWithAI);

// Bulk create jobs
router.post('/jobs/bulk', bulkCreateJobs);

// Get all admin-uploaded jobs
router.get('/jobs', getAdminJobs);

// Delete a job
router.delete('/jobs/:jobId', deleteJob);

export default router;
