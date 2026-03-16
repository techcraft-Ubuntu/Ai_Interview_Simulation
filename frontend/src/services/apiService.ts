/**
 * API Service for Interview and Resume Services
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const INTERVIEW_API_BASE_URL = import.meta.env.VITE_INTERVIEW_API_URL || 'http://localhost:5001';

// ============================================
// Resume Analysis API
// ============================================

export const resumeAPI = {
  /**
   * Upload and analyze resume
   */
  async uploadResume(file) {
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/resume/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Resume upload error:', error);
      throw error;
    }
  },

  /**
   * Get resume analysis results
   */
  async getAnalysis(analysisId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/resume/analysis/${analysisId}`);

      if (!response.ok) {
        throw new Error(`Fetch failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get analysis error:', error);
      throw error;
    }
  }
};

// ============================================
// Interview API
// ============================================

export const interviewAPI = {
  /**
   * Start a new interview session
   */
  async startInterview(resumeText, jobRole, company = 'General', questionCount = 5) {
    try {
      const response = await fetch(`${INTERVIEW_API_BASE_URL}/api/interview/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resumeText,
          jobRole,
          company,
          questionCount
        })
      });

      if (!response.ok) {
        throw new Error(`Start interview failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Start interview error:', error);
      throw error;
    }
  },

  /**
   * Get current question
   */
  async getQuestion(sessionId) {
    try {
      const response = await fetch(`${INTERVIEW_API_BASE_URL}/api/interview/${sessionId}/question`);

      if (!response.ok) {
        throw new Error(`Get question failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get question error:', error);
      throw error;
    }
  },

  /**
   * Submit answer and get evaluation
   */
  async submitAnswer(sessionId, answer) {
    try {
      const response = await fetch(`${INTERVIEW_API_BASE_URL}/api/interview/${sessionId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answer })
      });

      if (!response.ok) {
        throw new Error(`Submit answer failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Submit answer error:', error);
      throw error;
    }
  },

  /**
   * Get follow-up question
   */
  async getFollowUpQuestion(sessionId, question, answer) {
    try {
      const response = await fetch(`${INTERVIEW_API_BASE_URL}/api/interview/${sessionId}/follow-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question, answer })
      });

      if (!response.ok) {
        throw new Error(`Get follow-up failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get follow-up error:', error);
      throw error;
    }
  },

  /**
   * Complete interview
   */
  async completeInterview(sessionId) {
    try {
      const response = await fetch(`${INTERVIEW_API_BASE_URL}/api/interview/${sessionId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Complete interview failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Complete interview error:', error);
      throw error;
    }
  },

  /**
   * Get session report
   */
  async getReport(sessionId) {
    try {
      const response = await fetch(`${INTERVIEW_API_BASE_URL}/api/interview/${sessionId}/report`);

      if (!response.ok) {
        throw new Error(`Get report failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get report error:', error);
      throw error;
    }
  },

  /**
   * Get interview progress
   */
  async getProgress(sessionId) {
    try {
      const response = await fetch(`${INTERVIEW_API_BASE_URL}/api/interview/${sessionId}/progress`);

      if (!response.ok) {
        throw new Error(`Get progress failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get progress error:', error);
      throw error;
    }
  },

  /**
   * Abandon interview
   */
  async abandonInterview(sessionId) {
    try {
      const response = await fetch(`${INTERVIEW_API_BASE_URL}/api/interview/${sessionId}/abandon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Abandon interview failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Abandon interview error:', error);
      throw error;
    }
  }
};

export default {
  resumeAPI,
  interviewAPI
};
