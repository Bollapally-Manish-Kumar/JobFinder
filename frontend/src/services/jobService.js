/**
 * Job Service - API calls for job-related operations
 */

import api from './api';

export const jobService = {
  // Get all jobs with pagination
  getJobs: async (page = 1, limit = 20, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });
    const response = await api.get(`/jobs?${params}`);
    return response.data;
  },

  // Search jobs
  searchJobs: async (query, filters = {}) => {
    const params = new URLSearchParams({
      q: query,
      ...filters,
    });
    const response = await api.get(`/jobs/search?${params}`);
    return response.data;
  },

  // Get single job by ID
  getJobById: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  // Get saved jobs
  getSavedJobs: async () => {
    const response = await api.get('/jobs/user/saved');
    return response.data;
  },

  // Save a job
  saveJob: async (jobId) => {
    const response = await api.post(`/jobs/${jobId}/save`);
    return response.data;
  },

  // Unsave a job
  unsaveJob: async (jobId) => {
    const response = await api.delete(`/jobs/${jobId}/save`);
    return response.data;
  },

  // Get filter options
  getFilters: async () => {
    const response = await api.get('/jobs/filters');
    return response.data;
  },

  // Get sync status (jobs added today, last sync time)
  getSyncStatus: async () => {
    const response = await api.get('/jobs/sync-status');
    return response.data;
  },
};

export default jobService;
