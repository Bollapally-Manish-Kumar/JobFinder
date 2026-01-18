/**
 * Profile Service - User profile and resume management
 */

import api from './api';

const profileService = {
  /**
   * Get user profile
   */
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data) => {
    const response = await api.put('/profile', data);
    return response.data;
  },

  /**
   * Upload resume PDF
   * @param {File} file - PDF file
   */
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await api.post('/profile/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000 // 60 seconds for large files
    });
    return response.data;
  },

  /**
   * Delete resume
   */
  deleteResume: async () => {
    const response = await api.delete('/profile/resume');
    return response.data;
  }
};

export default profileService;
