/**
 * Admin Service - API calls for admin operations
 */

import api from './api';

export const adminService = {
  // =============================================
  // JOB MANAGEMENT
  // =============================================

  // Create a single job with AI auto-fill
  createJob: async (title, url) => {
    const response = await api.post('/admin/jobs', { title, url });
    return response.data;
  },

  // Bulk create jobs
  bulkCreateJobs: async (jobs) => {
    const response = await api.post('/admin/jobs/bulk', { jobs });
    return response.data;
  },

  // Get all admin-uploaded jobs
  getAdminJobs: async () => {
    const response = await api.get('/admin/jobs');
    return response.data;
  },

  // Delete a job
  deleteJob: async (jobId) => {
    const response = await api.delete(`/admin/jobs/${jobId}`);
    return response.data;
  }
};

export default adminService;
