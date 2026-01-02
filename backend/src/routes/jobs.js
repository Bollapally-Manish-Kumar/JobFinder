/**
 * Job Routes
 * Handles job listings, search, and saved jobs
 */

import express from 'express';
import { 
  getJobs, 
  getJobById, 
  searchJobs,
  getSavedJobs,
  saveJob,
  unsaveJob,
  getFilters,
  getSyncStatus
} from '../controllers/jobController.js';
import { authenticate, optionalAuth } from '../middlewares/auth.js';

const router = express.Router();

// Public routes (with optional auth for personalization)
router.get('/filters', getFilters); // Get filter options (must be before /:id)
router.get('/sync-status', getSyncStatus); // Get sync status (must be before /:id)
router.get('/', optionalAuth, getJobs);
router.get('/search', optionalAuth, searchJobs);
router.get('/:id', optionalAuth, getJobById);

// Protected routes
router.get('/user/saved', authenticate, getSavedJobs);
router.post('/:id/save', authenticate, saveJob);
router.delete('/:id/save', authenticate, unsaveJob);

export default router;
