/**
 * Interview Service Tests
 * Comprehensive test suite for all interview service functionality
 */

const request = require('supertest');
const app = require('../server');
const sessionManager = require('../sessions/sessionManager');

describe('Interview Service API Tests', () => {
  let sessionId;
  const mockResume = `
    I am a full-stack developer with 5 years of experience.
    Tech Stack: JavaScript, React, Node.js, MongoDB, PostgreSQL
    Frameworks: Express.js, Next.js
    Tools: Git, Docker, AWS
    
    Experience:
    - Senior Developer at TechCorp (2 years)
    - Full Stack Developer at StartupXYZ (3 years)
    
    Projects:
    - E-commerce platform using MERN stack
    - Real-time chat application with WebSockets
  `;

  // ============================================
  // Test Suite 1: Start Interview
  // ============================================
  describe('POST /api/interview/start', () => {
    test('should start interview with valid input', async () => {
      const response = await request(app)
        .post('/api/interview/start')
        .send({
          resumeText: mockResume,
          jobRole: 'Senior Full Stack Developer',
          company: 'Google',
          questionCount: 3
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.sessionId).toBeDefined();
      expect(response.body.data.firstQuestion).toBeDefined();
      expect(response.body.data.jobRole).toBe('Senior Full Stack Developer');
      expect(response.body.data.company).toBe('Google');
      expect(response.body.data.totalQuestions).toBe(3);

      sessionId = response.body.data.sessionId;
    });

    test('should return error when resume text is missing', async () => {
      const response = await request(app)
        .post('/api/interview/start')
        .send({
          jobRole: 'Developer',
          company: 'Google'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should return error when job role is missing', async () => {
      const response = await request(app)
        .post('/api/interview/start')
        .send({
          resumeText: mockResume,
          company: 'Google'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should work with default company parameter', async () => {
      const response = await request(app)
        .post('/api/interview/start')
        .send({
          resumeText: mockResume,
          jobRole: 'Full Stack Developer'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.company).toBe('General');
    });
  });

  // ============================================
  // Test Suite 2: Get Question
  // ============================================
  describe('GET /api/interview/:sessionId/question', () => {
    let testSessionId;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/interview/start')
        .send({
          resumeText: mockResume,
          jobRole: 'Backend Developer',
          company: 'Amazon',
          questionCount: 2
        });
      testSessionId = response.body.data.sessionId;
    });

    test('should get current question for valid session', async () => {
      const response = await request(app)
        .get(`/api/interview/${testSessionId}/question`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.question).toBeDefined();
      expect(response.body.data.questionNumber).toBe(1);
      expect(response.body.data.progress).toBeDefined();
    });

    test('should return error for invalid session ID', async () => {
      const response = await request(app)
        .get('/api/interview/invalid-session-id/question');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // Test Suite 3: Submit Answer
  // ============================================
  describe('POST /api/interview/:sessionId/submit', () => {
    let testSessionId;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/interview/start')
        .send({
          resumeText: mockResume,
          jobRole: 'Frontend Developer',
          company: 'Netflix',
          questionCount: 2
        });
      testSessionId = response.body.data.sessionId;
    });

    test('should submit answer and get evaluation', async () => {
      const response = await request(app)
        .post(`/api/interview/${testSessionId}/submit`)
        .send({
          answer: 'I would approach this problem by first understanding the requirements, then breaking it down into smaller components, and finally implementing with proper error handling.'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.evaluation).toBeDefined();
      expect(response.body.data.evaluation.score).toBeDefined();
      expect(response.body.data.evaluation.feedback).toBeDefined();
      expect(response.body.data.quickFeedback).toBeDefined();
      expect(response.body.data.sessionId).toBe(testSessionId);
    });

    test('should return error when answer is missing', async () => {
      const response = await request(app)
        .post(`/api/interview/${testSessionId}/submit`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should validate score is between 0-100', async () => {
      const response = await request(app)
        .post(`/api/interview/${testSessionId}/submit`)
        .send({
          answer: 'Test answer'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.evaluation.score).toBeGreaterThanOrEqual(0);
      expect(response.body.data.evaluation.score).toBeLessThanOrEqual(100);
    });
  });

  // ============================================
  // Test Suite 4: Progress Tracking
  // ============================================
  describe('GET /api/interview/:sessionId/progress', () => {
    let testSessionId;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/interview/start')
        .send({
          resumeText: mockResume,
          jobRole: 'DevOps Engineer',
          company: 'Microsoft',
          questionCount: 2
        });
      testSessionId = response.body.data.sessionId;
    });

    test('should get initial progress (0%)', async () => {
      const response = await request(app)
        .get(`/api/interview/${testSessionId}/progress`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalQuestions).toBe(2);
      expect(response.body.data.completedQuestions).toBe(0);
      expect(response.body.data.progressPercentage).toBe(0);
    });

    test('should update progress after answer submission', async () => {
      await request(app)
        .post(`/api/interview/${testSessionId}/submit`)
        .send({
          answer: 'Sample answer for progress tracking'
        });

      const response = await request(app)
        .get(`/api/interview/${testSessionId}/progress`);

      expect(response.body.data.completedQuestions).toBe(1);
      expect(response.body.data.progressPercentage).toBe(50);
    });
  });

  // ============================================
  // Test Suite 5: Follow-up Questions
  // ============================================
  describe('POST /api/interview/:sessionId/follow-up', () => {
    let testSessionId;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/interview/start')
        .send({
          resumeText: mockResume,
          jobRole: 'Data Engineer',
          company: 'Meta',
          questionCount: 1
        });
      testSessionId = response.body.data.sessionId;
    });

    test('should generate follow-up question', async () => {
      const response = await request(app)
        .post(`/api/interview/${testSessionId}/follow-up`)
        .send({
          question: 'How would you optimize a database query?',
          answer: 'I would use indexes on frequently queried columns and analyze the query plan.'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.follow_up_question).toBeDefined();
      expect(response.body.data.difficulty).toBeDefined();
    });

    test('should return error when question or answer missing', async () => {
      const response = await request(app)
        .post(`/api/interview/${testSessionId}/follow-up`)
        .send({
          question: 'Some question'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // Test Suite 6: Complete Interview
  // ============================================
  describe('POST /api/interview/:sessionId/complete', () => {
    let testSessionId;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/interview/start')
        .send({
          resumeText: mockResume,
          jobRole: 'QA Engineer',
          company: 'Apple',
          questionCount: 2
        });
      testSessionId = response.body.data.sessionId;

      // Answer all questions
      const questions = sessionManager.getSession(testSessionId).questions;
      for (let i = 0; i < questions.length; i++) {
        await request(app)
          .post(`/api/interview/${testSessionId}/submit`)
          .send({
            answer: `Sample answer ${i + 1}`
          });
      }
    });

    test('should complete interview and return feedback', async () => {
      const response = await request(app)
        .post(`/api/interview/${testSessionId}/complete`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.sessionId).toBe(testSessionId);
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.feedback).toBeDefined();
      expect(response.body.data.overallScore).toBeDefined();
    });
  });

  // ============================================
  // Test Suite 7: Session Report
  // ============================================
  describe('GET /api/interview/:sessionId/report', () => {
    let testSessionId;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/interview/start')
        .send({
          resumeText: mockResume,
          jobRole: 'ML Engineer',
          company: 'OpenAI',
          questionCount: 1
        });
      testSessionId = response.body.data.sessionId;

      // Answer the question
      await request(app)
        .post(`/api/interview/${testSessionId}/submit`)
        .send({
          answer: 'Machine learning is...'
        });
    });

    test('should get complete session report', async () => {
      const response = await request(app)
        .get(`/api/interview/${testSessionId}/report`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.sessionId).toBe(testSessionId);
      expect(response.body.data.questionsAndAnswers).toBeDefined();
      expect(Array.isArray(response.body.data.questionsAndAnswers)).toBe(true);
      expect(response.body.data.overallScore).toBeDefined();
    });

    test('report should contain all question-answer pairs', async () => {
      const response = await request(app)
        .get(`/api/interview/${testSessionId}/report`);

      const report = response.body.data;
      expect(report.questionsAndAnswers.length).toBeGreaterThan(0);
      
      report.questionsAndAnswers.forEach(qa => {
        expect(qa.questionNumber).toBeDefined();
        expect(qa.question).toBeDefined();
        expect(qa.answer).toBeDefined();
        expect(qa.score).toBeDefined();
      });
    });
  });

  // ============================================
  // Test Suite 8: Abandon Interview
  // ============================================
  describe('POST /api/interview/:sessionId/abandon', () => {
    let testSessionId;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/interview/start')
        .send({
          resumeText: mockResume,
          jobRole: 'Security Engineer',
          company: 'Tesla',
          questionCount: 5
        });
      testSessionId = response.body.data.sessionId;
    });

    test('should abandon interview session', async () => {
      const response = await request(app)
        .post(`/api/interview/${testSessionId}/abandon`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('abandoned');

      const session = sessionManager.getSession(testSessionId);
      expect(session.status).toBe('abandoned');
    });
  });

  // ============================================
  // Test Suite 9: Integration Test
  // ============================================
  describe('Complete Interview Flow Integration Test', () => {
    test('should complete full interview flow', async () => {
      // Step 1: Start interview
      const startResponse = await request(app)
        .post('/api/interview/start')
        .send({
          resumeText: mockResume,
          jobRole: 'Solutions Architect',
          company: 'IBM',
          questionCount: 2
        });

      expect(startResponse.status).toBe(200);
      const { sessionId, firstQuestion } = startResponse.body.data;

      // Step 2: Get first question
      const getQ1 = await request(app)
        .get(`/api/interview/${sessionId}/question`);

      expect(getQ1.status).toBe(200);
      expect(getQ1.body.data.questionNumber).toBe(1);

      // Step 3: Submit answer to first question
      const submitA1 = await request(app)
        .post(`/api/interview/${sessionId}/submit`)
        .send({
          answer: 'For this architecture problem, I would use a microservices approach...'
        });

      expect(submitA1.status).toBe(200);
      expect(submitA1.body.data.evaluation.score).toBeDefined();
      expect(submitA1.body.data.isInterviewComplete).toBe(false);

      // Step 4: Get second question
      const getQ2 = await request(app)
        .get(`/api/interview/${sessionId}/question`);

      expect(getQ2.body.data.questionNumber).toBe(2);

      // Step 5: Submit answer to second question
      const submitA2 = await request(app)
        .post(`/api/interview/${sessionId}/submit`)
        .send({
          answer: 'The scalability concerns would be addressed by...'
        });

      expect(submitA2.status).toBe(200);
      expect(submitA2.body.data.isInterviewComplete).toBe(true);

      // Step 6: Complete interview
      const complete = await request(app)
        .post(`/api/interview/${sessionId}/complete`);

      expect(complete.status).toBe(200);
      expect(complete.body.data.status).toBe('completed');
      expect(complete.body.data.overallScore).toBeDefined();

      // Step 7: Get full report
      const report = await request(app)
        .get(`/api/interview/${sessionId}/report`);

      expect(report.status).toBe(200);
      expect(report.body.data.questionsAndAnswers.length).toBe(2);
      expect(report.body.data.overallScore).toBeGreaterThanOrEqual(0);
      expect(report.body.data.overallScore).toBeLessThanOrEqual(100);
    });
  });

  // ============================================
  // Test Suite 10: Error Handling
  // ============================================
  describe('Error Handling', () => {
    test('should handle non-existent session gracefully', async () => {
      const response = await request(app)
        .get('/api/interview/non-existent-session/question');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    test('should handle invalid request body', async () => {
      const response = await request(app)
        .post('/api/interview/start')
        .send('invalid json');

      expect([400, 500]).toContain(response.status);
    });

    test('should handle missing session for submission', async () => {
      const response = await request(app)
        .post('/api/interview/invalid-id/submit')
        .send({
          answer: 'Some answer'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
});

// ============================================
// Performance Tests
// ============================================
describe('Performance Tests', () => {
  test('should handle multiple concurrent interviews', async () => {
    const interviews = [];

    for (let i = 0; i < 3; i++) {
      const response = await request(app)
        .post('/api/interview/start')
        .send({
          resumeText: 'I am a developer with experience in JavaScript and Python',
          jobRole: `Role ${i}`,
          company: 'TestCompany',
          questionCount: 1
        });

      expect(response.status).toBe(200);
      interviews.push(response.body.data.sessionId);
    }

    expect(interviews.length).toBe(3);
    expect(new Set(interviews).size).toBe(3); // All unique
  });

  test('response time should be reasonable', async () => {
    const startTime = Date.now();

    await request(app)
      .post('/api/interview/start')
      .send({
        resumeText: 'Developer resume',
        jobRole: 'Developer',
        company: 'Test',
        questionCount: 1
      });

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
  });
});

// ============================================
// Session Management Tests
// ============================================
describe('Session Management', () => {
  test('should track session state correctly', () => {
    const sessionId = sessionManager.createSession(
      'test resume',
      'Test Role',
      'Test Company'
    );

    const session = sessionManager.getSession(sessionId);
    expect(session.status).toBe('active');
    expect(session.questionsAnswered).toBeUndefined();

    sessionManager.deleteSession(sessionId);
    expect(() => sessionManager.getSession(sessionId)).toThrow();
  });

  test('should calculate scores correctly', () => {
    const sessionId = sessionManager.createSession(
      'resume',
      'Role',
      'Company'
    );

    sessionManager.addQuestions(sessionId, [
      { id: 1, question: 'Q1', difficulty: 'medium' },
      { id: 2, question: 'Q2', difficulty: 'medium' }
    ]);

    sessionManager.submitAnswer(sessionId, 'Answer 1', 80, {});
    sessionManager.submitAnswer(sessionId, 'Answer 2', 90, {});

    const score = sessionManager.calculateOverallScore(sessionId);
    expect(score).toBe(85);
  });
});

module.exports = {
  app,
  mockResume
};
