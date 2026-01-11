/**
 * AI Job Match Routes
 * Premium feature: ₹20+ (AI or PRO_PLUS plan required)
 */

import express from 'express';
import { analyzeResumeMatch, checkAccess } from '../controllers/aiMatchController.js';
import { uploadAndAnalyzePDF, getUploadInfo } from '../controllers/pdfResumeController.js';
import { authenticate, requireAIPlan } from '../middlewares/auth.js';
import { uploadPDF, handleUploadError } from '../middlewares/upload.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Check if user has access to AI Match feature (no plan check - just info)
router.get('/check-access', checkAccess);

// Get upload info (supported types, max size)
router.get('/upload-info', getUploadInfo);

// Analyze resume text and match with jobs - requires AI plan (₹20+)
router.post('/analyze', requireAIPlan, analyzeResumeMatch);

// Upload PDF resume and analyze - requires AI plan (₹20+)
router.post(
  '/upload-pdf',
  requireAIPlan,
  uploadPDF.single('resume'),
  handleUploadError,
  uploadAndAnalyzePDF
);

export default router;
