/**
 * Application Tracker Controller
 * Handles job application tracking: Applied, Interview, Offer, Rejected
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Valid application statuses
const VALID_STATUSES = ['APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'];

/**
 * Get all applications for the current user
 * GET /api/applications
 */
export const getApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const where = { userId };
    
    // Filter by status if provided
    if (status && VALID_STATUSES.includes(status.toUpperCase())) {
      where.status = status.toUpperCase();
    }

    const applications = await prisma.jobApplication.findMany({
      where,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            source: true,
            url: true,
            isRemote: true,
            isIndiaEligible: true,
            salary: true,
            type: true,
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Group by status for dashboard view
    const stats = {
      total: applications.length,
      applied: applications.filter(a => a.status === 'APPLIED').length,
      interview: applications.filter(a => a.status === 'INTERVIEW').length,
      offer: applications.filter(a => a.status === 'OFFER').length,
      rejected: applications.filter(a => a.status === 'REJECTED').length,
    };

    res.json({
      success: true,
      applications,
      stats
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

/**
 * Add a job to applications (mark as applied)
 * POST /api/applications
 */
export const addApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId, status = 'APPLIED', notes = '' } = req.body;

    if (!jobId) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    // Validate status
    const normalizedStatus = status.toUpperCase();
    if (!VALID_STATUSES.includes(normalizedStatus)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` 
      });
    }

    // Check if job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if already tracking this job
    const existing = await prisma.jobApplication.findUnique({
      where: { userId_jobId: { userId, jobId } }
    });

    if (existing) {
      return res.status(400).json({ 
        error: 'Already tracking this job',
        application: existing
      });
    }

    // Create application
    const application = await prisma.jobApplication.create({
      data: {
        userId,
        jobId,
        status: normalizedStatus,
        notes
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            source: true,
            url: true,
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Application tracked successfully',
      application
    });
  } catch (error) {
    console.error('Add application error:', error);
    res.status(500).json({ error: 'Failed to track application' });
  }
};

/**
 * Update application status
 * PATCH /api/applications/:id
 */
export const updateApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status, notes } = req.body;

    // Find application
    const application = await prisma.jobApplication.findUnique({
      where: { id }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check ownership
    if (application.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Build update data
    const updateData = {};
    
    if (status) {
      const normalizedStatus = status.toUpperCase();
      if (!VALID_STATUSES.includes(normalizedStatus)) {
        return res.status(400).json({ 
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` 
        });
      }
      updateData.status = normalizedStatus;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Update application
    const updated = await prisma.jobApplication.update({
      where: { id },
      data: updateData,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            source: true,
            url: true,
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Application updated',
      application: updated
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
};

/**
 * Delete application
 * DELETE /api/applications/:id
 */
export const deleteApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Find application
    const application = await prisma.jobApplication.findUnique({
      where: { id }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check ownership
    if (application.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete
    await prisma.jobApplication.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Application removed from tracker'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
};

/**
 * Check if user is tracking a specific job
 * GET /api/applications/check/:jobId
 */
export const checkApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    const application = await prisma.jobApplication.findUnique({
      where: { userId_jobId: { userId, jobId } }
    });

    res.json({
      isTracking: !!application,
      application: application || null
    });
  } catch (error) {
    console.error('Check application error:', error);
    res.status(500).json({ error: 'Failed to check application' });
  }
};

/**
 * Bulk check multiple jobs
 * POST /api/applications/bulk-check
 */
export const bulkCheckApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobIds } = req.body;

    if (!Array.isArray(jobIds)) {
      return res.status(400).json({ error: 'jobIds must be an array' });
    }

    const applications = await prisma.jobApplication.findMany({
      where: {
        userId,
        jobId: { in: jobIds }
      },
      select: {
        jobId: true,
        status: true
      }
    });

    // Create a map of jobId -> status
    const trackingMap = {};
    applications.forEach(app => {
      trackingMap[app.jobId] = app.status;
    });

    res.json({
      success: true,
      trackingMap
    });
  } catch (error) {
    console.error('Bulk check applications error:', error);
    res.status(500).json({ error: 'Failed to check applications' });
  }
};
