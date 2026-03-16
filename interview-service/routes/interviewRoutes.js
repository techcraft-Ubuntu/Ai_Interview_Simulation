const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');

/**
 * POST /api/interview/start
 * Start a new interview session
 * Body: { resumeText, jobRole, company, questionCount }
 */
router.post('/start', interviewController.startInterview);

/**
 * GET /api/interview/:sessionId/question
 * Get the current question
 */
router.get('/:sessionId/question', interviewController.getQuestion);

/**
 * POST /api/interview/:sessionId/submit
 * Submit an answer and get evaluation
 * Body: { answer }
 */
router.post('/:sessionId/submit', interviewController.submitAnswer);

/**
 * POST /api/interview/:sessionId/follow-up
 * Generate a follow-up question
 * Body: { question, answer }
 */
router.post('/:sessionId/follow-up', interviewController.getFollowUpQuestion);

/**
 * POST /api/interview/:sessionId/complete
 * Complete the interview and get final feedback
 */
router.post('/:sessionId/complete', interviewController.completeInterview);

/**
 * GET /api/interview/:sessionId/report
 * Get full session report
 */
router.get('/:sessionId/report', interviewController.getSessionReport);

/**
 * GET /api/interview/:sessionId/progress
 * Get interview progress
 */
router.get('/:sessionId/progress', interviewController.getProgress);

/**
 * POST /api/interview/:sessionId/abandon
 * Abandon an interview
 */
router.post('/:sessionId/abandon', interviewController.abandonInterview);

/**
 * GET /api/interview/admin/sessions
 * Get all sessions (admin endpoint)
 */
router.get('/admin/all-sessions', interviewController.getAllSessions);

module.exports = router;
