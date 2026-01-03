/**
 * Resume Routes
 * Handles Gemini API integration for LaTeX resume generation
 */

import express from 'express';
import { body } from 'express-validator';
import { generateResume } from '../controllers/resumeController.js';
import { authenticate, requirePaid } from '../middlewares/auth.js';

const router = express.Router();

// Resume generation validation
const resumeValidation = [
  body('jobDescription')
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ min: 50 })
    .withMessage('Job description must be at least 50 characters')
];

// Generate resume - requires paid subscription
router.post('/generate', authenticate, requirePaid, resumeValidation, generateResume);

export default router;
