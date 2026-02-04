/**
 * AxonApply Routes
 * Handles extension-based apply tracking endpoints
 */

import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { getAxonApplyEvents, upsertAxonApplyEvent } from '../controllers/axonApplyController.js';

const router = express.Router();

router.use(authenticate);

// GET /api/axon-apply/events
router.get('/events', getAxonApplyEvents);

// POST /api/axon-apply/events
router.post('/events', upsertAxonApplyEvent);

export default router;
