/**
 * AI Routes - Groq-powered endpoints for AxonApply
 * POST /api/ai/answer-question  — Generate human-like answer
 * POST /api/ai/classify-field   — Classify an unknown form field
 */

import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { answerQuestion, classifyField } from '../controllers/aiQuestionController.js';

const router = Router();

// All AI routes require authentication
router.post('/answer-question', authenticate, answerQuestion);
router.post('/classify-field', authenticate, classifyField);

export default router;
