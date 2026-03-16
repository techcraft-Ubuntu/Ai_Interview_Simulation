const { v4: uuidv4 } = require('uuid');

// In-memory session storage (in production, use a database)
const sessions = new Map();

/**
 * Create a new interview session
 */
function createSession(resumeData, jobRole, company = 'General') {
  const sessionId = uuidv4();
  
  const session = {
    id: sessionId,
    resumeData,
    jobRole,
    company,
    startTime: new Date(),
    endTime: null,
    status: 'active', // active, completed, abandoned
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    scores: [],
    feedback: null,
    overallFeedback: null
  };

  sessions.set(sessionId, session);
  return sessionId;
}

/**
 * Get session by ID
 */
function getSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error(`Session not found: ${sessionId}`);
  }
  return session;
}

/**
 * Add questions to session
 */
function addQuestions(sessionId, questions) {
  const session = getSession(sessionId);
  session.questions = questions;
  session.currentQuestionIndex = 0;
  return session;
}

/**
 * Get current question in session
 */
function getCurrentQuestion(sessionId) {
  const session = getSession(sessionId);
  
  if (session.currentQuestionIndex >= session.questions.length) {
    return null;
  }

  return {
    question: session.questions[session.currentQuestionIndex],
    questionNumber: session.currentQuestionIndex + 1,
    totalQuestions: session.questions.length
  };
}

/**
 * Submit answer and move to next question
 */
function submitAnswer(sessionId, answer, score, feedback) {
  const session = getSession(sessionId);

  session.answers.push({
    questionIndex: session.currentQuestionIndex,
    answer,
    timestamp: new Date()
  });

  session.scores.push({
    questionIndex: session.currentQuestionIndex,
    score,
    maxScore: 100,
    feedback
  });

  session.currentQuestionIndex++;
  return {
    isComplete: session.currentQuestionIndex >= session.questions.length,
    nextQuestion: getCurrentQuestion(sessionId)
  };
}

/**
 * Check if interview is complete
 */
function isInterviewComplete(sessionId) {
  const session = getSession(sessionId);
  return session.currentQuestionIndex >= session.questions.length;
}

/**
 * Get interview progress
 */
function getProgress(sessionId) {
  const session = getSession(sessionId);
  const totalQuestions = session.questions.length;
  const completedQuestions = session.currentQuestionIndex;
  const progressPercentage = totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0;

  return {
    totalQuestions,
    completedQuestions,
    progressPercentage,
    isComplete: completedQuestions >= totalQuestions
  };
}

/**
 * Calculate overall score
 */
function calculateOverallScore(sessionId) {
  const session = getSession(sessionId);
  
  if (session.scores.length === 0) {
    return 0;
  }

  const totalScore = session.scores.reduce((sum, score) => sum + score.score, 0);
  return Math.round(totalScore / session.scores.length);
}

/**
 * Complete interview session
 */
function completeSession(sessionId, overallFeedback) {
  const session = getSession(sessionId);
  session.status = 'completed';
  session.endTime = new Date();
  session.overallFeedback = overallFeedback;
  
  const duration = Math.round((session.endTime - session.startTime) / 1000 / 60); // in minutes
  
  return {
    sessionId: session.id,
    jobRole: session.jobRole,
    company: session.company,
    duration,
    status: session.status,
    totalQuestions: session.questions.length,
    questionsAnswered: session.answers.length,
    overallScore: calculateOverallScore(sessionId),
    feedback: overallFeedback
  };
}

/**
 * Get full session report
 */
function getSessionReport(sessionId) {
  const session = getSession(sessionId);
  
  const report = {
    sessionId: session.id,
    jobRole: session.jobRole,
    company: session.company,
    startTime: session.startTime,
    endTime: session.endTime,
    duration: session.endTime ? Math.round((session.endTime - session.startTime) / 1000 / 60) : null,
    status: session.status,
    overallScore: calculateOverallScore(sessionId),
    
    questionsAndAnswers: session.questions.map((q, index) => ({
      questionNumber: index + 1,
      question: q,
      answer: session.answers[index] ? session.answers[index].answer : null,
      score: session.scores[index] ? session.scores[index].score : null,
      feedback: session.scores[index] ? session.scores[index].feedback : null
    })),
    
    overallFeedback: session.overallFeedback
  };

  return report;
}

/**
 * Get all sessions (for admin)
 */
function getAllSessions() {
  return Array.from(sessions.values());
}

/**
 * Delete session
 */
function deleteSession(sessionId) {
  return sessions.delete(sessionId);
}

/**
 * Clear old sessions (older than 24 hours)
 */
function clearOldSessions() {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  let deletedCount = 0;
  for (const [sessionId, session] of sessions.entries()) {
    if (session.startTime < oneDayAgo && session.status === 'completed') {
      sessions.delete(sessionId);
      deletedCount++;
    }
  }

  return deletedCount;
}

module.exports = {
  createSession,
  getSession,
  addQuestions,
  getCurrentQuestion,
  submitAnswer,
  isInterviewComplete,
  getProgress,
  calculateOverallScore,
  completeSession,
  getSessionReport,
  getAllSessions,
  deleteSession,
  clearOldSessions
};
