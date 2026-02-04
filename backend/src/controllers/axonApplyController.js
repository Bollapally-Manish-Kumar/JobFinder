/**
 * AxonApply Controller
 * Tracks AxonApply events (apply / skip / pending) from the extension
 */

import prisma from '../utils/prisma.js';

const VALID_STATUSES = ['APPLIED', 'SKIPPED', 'PENDING'];
const VALID_DECISIONS = ['APPLY', 'SKIP', 'ASK_USER'];

/**
 * Get AxonApply events for current user
 * GET /api/axon-apply/events
 */
export const getAxonApplyEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 100 } = req.query;

    const where = { userId };
    if (status && VALID_STATUSES.includes(status.toUpperCase())) {
      where.status = status.toUpperCase();
    }

    const events = await prisma.axonApplyEvent.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: Math.min(Number(limit) || 100, 500)
    });

    res.json({ success: true, events });
  } catch (error) {
    console.error('Get AxonApply events error:', error);
    res.status(500).json({ error: 'Failed to fetch AxonApply events' });
  }
};

/**
 * Log or update an AxonApply event (idempotent by userId + jobUrl)
 * POST /api/axon-apply/events
 */
export const upsertAxonApplyEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      jobTitle,
      company,
      platform,
      jobUrl,
      resumeVersion,
      status = 'PENDING',
      decision,
      reasonCodes,
      notes
    } = req.body;

    if (!jobTitle || !company || !platform || !jobUrl) {
      return res.status(400).json({
        error: 'jobTitle, company, platform, and jobUrl are required'
      });
    }

    const normalizedStatus = status.toUpperCase();
    if (!VALID_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    let normalizedDecision = decision;
    if (decision) {
      normalizedDecision = decision.toUpperCase();
      if (!VALID_DECISIONS.includes(normalizedDecision)) {
        return res.status(400).json({
          error: `Invalid decision. Must be one of: ${VALID_DECISIONS.join(', ')}`
        });
      }
    }

    const event = await prisma.axonApplyEvent.upsert({
      where: { userId_jobUrl: { userId, jobUrl } },
      update: {
        jobTitle,
        company,
        platform,
        resumeVersion,
        status: normalizedStatus,
        decision: normalizedDecision,
        reasonCodes,
        notes,
        appliedAt: normalizedStatus === 'APPLIED' ? new Date() : undefined
      },
      create: {
        userId,
        jobTitle,
        company,
        platform,
        jobUrl,
        resumeVersion,
        status: normalizedStatus,
        decision: normalizedDecision,
        reasonCodes,
        notes,
        appliedAt: normalizedStatus === 'APPLIED' ? new Date() : undefined
      }
    });

    res.status(201).json({
      success: true,
      message: 'AxonApply event logged',
      event
    });
  } catch (error) {
    console.error('Upsert AxonApply event error:', error);
    res.status(500).json({ error: 'Failed to log AxonApply event' });
  }
};
