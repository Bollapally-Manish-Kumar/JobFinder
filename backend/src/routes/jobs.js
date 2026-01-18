/**
 * Job Routes
 * Handles job listings, search, saved jobs, and job match analysis
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
import { getJobDetails, getQuickMatch, generateLatexResume } from '../controllers/jobMatchController.js';
import { authenticate, optionalAuth } from '../middlewares/auth.js';

const router = express.Router();

// Public routes (with optional auth for personalization)
router.get('/filters', getFilters); // Get filter options (must be before /:id)
router.get('/sync-status', getSyncStatus); // Get sync status (must be before /:id)
router.get('/', optionalAuth, getJobs);
router.get('/search', optionalAuth, searchJobs);

// Job details with match analysis (authenticated)
router.get('/:id/details', authenticate, getJobDetails);
router.get('/:id/quick-match', authenticate, getQuickMatch);
router.post('/:id/generate-latex', authenticate, generateLatexResume); // ULTIMATE only

// Basic job info (public with optional auth)
router.get('/:id', optionalAuth, getJobById);

// Protected routes
router.get('/user/saved', authenticate, getSavedJobs);
router.post('/:id/save', authenticate, saveJob);
router.delete('/:id/save', authenticate, unsaveJob);

export default router;
