const sessionManager = require('../sessions/sessionManager');
const { generateInterviewQuestions, generateFollowUpQuestion } = require('../services/questionGenerator');
const { evaluateAnswer, generateInterviewFeedback, quickAssessAnswer } = require('../services/answerEvaluator');

/**
 * Start a new interview session
 */
async function startInterview(req, res) {
  try {
    const { resumeText, jobRole, company = 'General', questionCount = 5 } = req.body;

    if (!resumeText || !jobRole) {
      return res.status(400).json({
        success: false,
        error: 'Resume text and job role are required'
      });
    }

    // Create session
    const sessionId = sessionManager.createSession(resumeText, jobRole, company);

    // Generate questions
    const questionsData = await generateInterviewQuestions(
      resumeText,
      jobRole,
      company,
      questionCount
    );

    // Add questions to session
    sessionManager.addQuestions(sessionId, questionsData.questions);

    // Get first question
    const firstQuestion = sessionManager.getCurrentQuestion(sessionId);

    res.json({
      success: true,
      data: {
        sessionId,
        jobRole,
        company,
        interviewFocus: questionsData.interview_focus,
        estimatedDuration: questionsData.estimated_duration_minutes,
        totalQuestions: questionsData.questions.length,
        firstQuestion: firstQuestion.question,
        questionNumber: firstQuestion.questionNumber,
        totalQuestions: firstQuestion.totalQuestions
      }
    });
  } catch (error) {
    console.error('Error starting interview:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to start interview'
    });
  }
}

/**
 * Get current question
 */
async function getQuestion(req, res) {
  try {
    const { sessionId } = req.params;

    const currentQuestion = sessionManager.getCurrentQuestion(sessionId);

    if (!currentQuestion) {
      return res.json({
        success: true,
        data: {
          isComplete: true,
          message: 'Interview complete'
        }
      });
    }

    const progress = sessionManager.getProgress(sessionId);

    res.json({
      success: true,
      data: {
        question: currentQuestion.question,
        questionNumber: currentQuestion.questionNumber,
        totalQuestions: currentQuestion.totalQuestions,
        progress: progress,
        sessionId
      }
    });
  } catch (error) {
    console.error('Error getting question:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get question'
    });
  }
}

/**
 * Submit answer and get evaluation
 */
async function submitAnswer(req, res) {
  try {
    const { sessionId } = req.params;
    const { answer } = req.body;

    if (!answer) {
      return res.status(400).json({
        success: false,
        error: 'Answer is required'
      });
    }

    const session = sessionManager.getSession(sessionId);
    const currentQuestion = session.questions[session.currentQuestionIndex];

    if (!currentQuestion) {
      return res.status(400).json({
        success: false,
        error: 'No active question in this session'
      });
    }

    // Quick assessment (real-time feedback)
    const quickAssessment = await quickAssessAnswer(currentQuestion.question, answer);

    // Full evaluation
    const evaluation = await evaluateAnswer(
      currentQuestion.question,
      answer,
      currentQuestion.evaluation_criteria || [],
      currentQuestion.difficulty
    );

    // Submit answer to session
    const result = sessionManager.submitAnswer(
      sessionId,
      answer,
      evaluation.score,
      evaluation
    );

    // Check if interview is complete
    if (result.isComplete) {
      res.json({
        success: true,
        data: {
          evaluation,
          quickFeedback: quickAssessment.brief_feedback,
          isInterviewComplete: true,
          sessionId
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          evaluation,
          quickFeedback: quickAssessment.brief_feedback,
          isInterviewComplete: false,
          nextQuestion: result.nextQuestion.question,
          questionNumber: result.nextQuestion.questionNumber,
          totalQuestions: result.nextQuestion.totalQuestions,
          sessionId
        }
      });
    }
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit answer'
    });
  }
}

/**
 * Generate follow-up question
 */
async function getFollowUpQuestion(req, res) {
  try {
    const { sessionId } = req.params;
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        error: 'Question and answer are required'
      });
    }

    const session = sessionManager.getSession(sessionId);
    const currentQuestionCategory = session.questions[session.currentQuestionIndex]?.category || 'technical';

    const followUp = await generateFollowUpQuestion(question, answer, currentQuestionCategory);

    res.json({
      success: true,
      data: followUp
    });
  } catch (error) {
    console.error('Error generating follow-up:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate follow-up'
    });
  }
}

/**
 * Complete interview and get feedback
 */
async function completeInterview(req, res) {
  try {
    const { sessionId } = req.params;

    const session = sessionManager.getSession(sessionId);

    // Generate comprehensive feedback
    const interviewData = session.answers.map((answer, index) => ({
      question: session.questions[index]?.question || 'Question not found',
      answer: answer.answer,
      score: session.scores[index]?.score || 0
    }));

    const overallFeedback = await generateInterviewFeedback(
      interviewData,
      session.jobRole,
      session.resumeData.substring(0, 500)
    );

    const completionResult = sessionManager.completeSession(sessionId, overallFeedback);

    res.json({
      success: true,
      data: completionResult
    });
  } catch (error) {
    console.error('Error completing interview:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete interview'
    });
  }
}

/**
 * Get session report
 */
async function getSessionReport(req, res) {
  try {
    const { sessionId } = req.params;

    const report = sessionManager.getSessionReport(sessionId);

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error getting report:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get report'
    });
  }
}

/**
 * Get interview progress
 */
async function getProgress(req, res) {
  try {
    const { sessionId } = req.params;

    const progress = sessionManager.getProgress(sessionId);
    const overallScore = sessionManager.calculateOverallScore(sessionId);

    res.json({
      success: true,
      data: {
        ...progress,
        currentScore: overallScore,
        sessionId
      }
    });
  } catch (error) {
    console.error('Error getting progress:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get progress'
    });
  }
}

/**
 * Abandon interview
 */
async function abandonInterview(req, res) {
  try {
    const { sessionId } = req.params;

    const session = sessionManager.getSession(sessionId);
    session.status = 'abandoned';
    session.endTime = new Date();

    res.json({
      success: true,
      data: {
        message: 'Interview abandoned',
        sessionId
      }
    });
  } catch (error) {
    console.error('Error abandoning interview:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to abandon interview'
    });
  }
}

/**
 * Get all sessions (admin endpoint)
 */
async function getAllSessions(req, res) {
  try {
    const allSessions = sessionManager.getAllSessions();

    res.json({
      success: true,
      data: {
        totalSessions: allSessions.length,
        sessions: allSessions.map(session => ({
          sessionId: session.id,
          jobRole: session.jobRole,
          company: session.company,
          status: session.status,
          startTime: session.startTime,
          endTime: session.endTime,
          questionsAnswered: session.answers.length,
          averageScore: sessionManager.calculateOverallScore(session.id)
        }))
      }
    });
  } catch (error) {
    console.error('Error getting sessions:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get sessions'
    });
  }
}

module.exports = {
  startInterview,
  getQuestion,
  submitAnswer,
  getFollowUpQuestion,
  completeInterview,
  getSessionReport,
  getProgress,
  abandonInterview,
  getAllSessions
};
