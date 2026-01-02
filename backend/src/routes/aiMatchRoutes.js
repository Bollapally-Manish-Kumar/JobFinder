/**
 * AI Job Match Routes
 * Premium feature: ₹20+ (AI or PRO_PLUS plan required)
 */

import express from 'express';
import { analyzeResumeMatch, checkAccess } from '../controllers/aiMatchController.js';
import { authenticate, requireAIPlan } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Check if user has access to AI Match feature (no plan check - just info)
router.get('/check-access', checkAccess);

// Analyze resume and match with jobs - requires AI plan (₹20+)
router.post('/analyze', requireAIPlan, analyzeResumeMatch);

export default router;
