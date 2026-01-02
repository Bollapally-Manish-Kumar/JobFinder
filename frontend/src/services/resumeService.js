/**
 * Resume Service - Gemini API integration for LaTeX resume generation
 */

import api from './api';

export const resumeService = {
  // Generate LaTeX resume
  generateResume: async (jobDescription, userInfo = null) => {
    const response = await api.post('/resume/generate', {
      jobDescription,
      userInfo,
    });
    return response.data;
  },
};

export default resumeService;
