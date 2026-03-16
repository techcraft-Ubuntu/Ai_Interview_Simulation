import React, { useEffect, useState } from 'react';
import { interviewAPI } from '../services/apiService';
import './InterviewInterface.css';

interface InterviewInterfaceProps {
  sessionId: string;
  jobRole: string;
  company: string;
  onComplete: (report: any) => void;
  onAbandon: () => void;
}

export const InterviewInterface: React.FC<InterviewInterfaceProps> = ({
  sessionId,
  jobRole,
  company,
  onComplete,
  onAbandon
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [showFollowUpOption, setShowFollowUpOption] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    loadQuestion();
  }, [sessionId]);

  const loadQuestion = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [questionRes, progressRes] = await Promise.all([
        interviewAPI.getQuestion(sessionId),
        interviewAPI.getProgress(sessionId)
      ]);

      if (questionRes.success) {
        setCurrentQuestion(questionRes.data);
      } else {
        setError(questionRes.error);
      }

      if (progressRes.success) {
        setProgress(progressRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setAnswer(text);
    setCharCount(text.length);
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      setError('Please enter your answer');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setFeedback(null);

      const response = await interviewAPI.submitAnswer(sessionId, answer);

      if (response.success) {
        setFeedback(response.data.evaluation);
        setShowFollowUpOption(true);

        // Reload progress
        const progressRes = await interviewAPI.getProgress(sessionId);
        if (progressRes.success) {
          setProgress(progressRes.data);
        }

        // If interview is complete, show completion
        if (response.data.isInterviewComplete) {
          setTimeout(() => {
            completeInterview();
          }, 3000);
        }
      } else {
        setError(response.error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setAnswer('');
    setCharCount(0);
    setFeedback(null);
    setShowFollowUpOption(false);
    loadQuestion();
  };

  const completeInterview = async () => {
    try {
      setIsLoading(true);
      const response = await interviewAPI.completeInterview(sessionId);

      if (response.success) {
        onComplete(response.data);
      } else {
        setError(response.error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete interview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAbandonInterview = async () => {
    if (confirm('Are you sure you want to abandon this interview?')) {
      try {
        await interviewAPI.abandonInterview(sessionId);
        onAbandon();
      } catch (err: any) {
        setError(err.message || 'Failed to abandon interview');
      }
    }
  };

  if (isLoading && !currentQuestion) {
    return (
      <div className="interview-loading">
        <div className="spinner"></div>
        <p>Loading interview...</p>
      </div>
    );
  }

  return (
    <div className="interview-container">
      {/* Header */}
      <div className="interview-header">
        <div className="header-info">
          <h1>AI Interview Simulation</h1>
          <p>{jobRole} at {company}</p>
        </div>
        <button className="abandon-btn" onClick={handleAbandonInterview}>
          Exit Interview
        </button>
      </div>

      {/* Progress Bar */}
      {progress && (
        <div className="progress-section">
          <div className="progress-info">
            <span>Question {progress.completedQuestions + 1} of {progress.totalQuestions}</span>
            <span className="score">Current Score: {progress.currentScore}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress.progressPercentage}%` }}
            ></div>
          </div>
          <p className="progress-text">{Math.round(progress.progressPercentage)}% Complete</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="interview-error">
          <p>{error}</p>
        </div>
      )}

      {/* Question Section */}
      {currentQuestion && !feedback && (
        <div className="question-section">
          <div className="question-content">
            <div className="question-header">
              <h2>Question {currentQuestion.questionNumber}</h2>
              <span className="difficulty-badge">{currentQuestion.question.difficulty}</span>
            </div>

            <p className="question-text">{currentQuestion.question.question}</p>

            {currentQuestion.question.expected_topics && (
              <div className="topics-hint">
                <strong>Topics to cover:</strong>
                <div className="topic-tags">
                  {currentQuestion.question.expected_topics.map((topic: string, idx: number) => (
                    <span key={idx} className="topic-tag">{topic}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Answer Input */}
          <div className="answer-section">
            <label htmlFor="answer-textarea">Your Answer:</label>
            <textarea
              id="answer-textarea"
              value={answer}
              onChange={handleAnswerChange}
              placeholder="Type your detailed answer here..."
              rows={8}
              disabled={isSubmitting}
            />
            <div className="char-count">
              {charCount} characters
            </div>

            <button
              className="submit-btn"
              onClick={handleSubmitAnswer}
              disabled={isSubmitting || !answer.trim()}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Answer'}
            </button>
          </div>
        </div>
      )}

      {/* Feedback Section */}
      {feedback && (
        <div className="feedback-section">
          <div className="feedback-header">
            <h3>Answer Evaluation</h3>
            <div className="score-display">
              <span className="score-label">Score:</span>
              <span className="score-value">{feedback.score}/100</span>
            </div>
          </div>

          {/* Score Breakdown */}
          {feedback.breakdown && (
            <div className="breakdown-grid">
              {Object.entries(feedback.breakdown).map(([criterion, score]: [string, any]) => (
                <div key={criterion} className="breakdown-item">
                  <label>{criterion}</label>
                  <div className="mini-bar">
                    <div
                      className="mini-fill"
                      style={{
                        width: `${score}%`,
                        backgroundColor: score >= 80 ? '#4CAF50' : score >= 60 ? '#FFC107' : '#F44336'
                      }}
                    ></div>
                  </div>
                  <span className="score">{score}/100</span>
                </div>
              ))}
            </div>
          )}

          {/* Feedback Text */}
          {feedback.feedback && (
            <div className="feedback-text">
              <h4>Detailed Feedback</h4>
              <p>{feedback.feedback}</p>
            </div>
          )}

          {/* Strengths */}
          {feedback.strengths?.length > 0 && (
            <div className="feedback-list strengths">
              <h4>✓ Strengths</h4>
              <ul>
                {feedback.strengths.map((strength: string, idx: number) => (
                  <li key={idx}>{strength}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {feedback.weaknesses?.length > 0 && (
            <div className="feedback-list weaknesses">
              <h4>⚠ Areas for Improvement</h4>
              <ul>
                {feedback.weaknesses.map((weakness: string, idx: number) => (
                  <li key={idx}>{weakness}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Button */}
          <button
            className="next-btn"
            onClick={handleNextQuestion}
            disabled={isLoading}
          >
            {progress?.completedQuestions >= progress?.totalQuestions - 1
              ? 'Finish Interview'
              : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  );
};

export default InterviewInterface;
