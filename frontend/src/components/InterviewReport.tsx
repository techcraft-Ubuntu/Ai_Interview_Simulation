import React, { useState } from 'react';
import './InterviewReport.css';

interface InterviewReportProps {
  report: any;
  onStartNewInterview: () => void;
  onDownloadReport: () => void;
}

export const InterviewReport: React.FC<InterviewReportProps> = ({
  report,
  onStartNewInterview,
  onDownloadReport
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const getVerdictColor = (verdict: string) => {
    switch (verdict?.toLowerCase()) {
      case 'strong_hire':
        return '#4CAF50';
      case 'hire':
        return '#8BC34A';
      case 'neutral':
        return '#FFC107';
      case 'no_hire':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  const getVerdictLabel = (verdict: string) => {
    switch (verdict?.toLowerCase()) {
      case 'strong_hire':
        return '🌟 Strong Hire';
      case 'hire':
        return '✓ Hire';
      case 'neutral':
        return '→ Neutral';
      case 'no_hire':
        return '✗ No Hire';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="report-container">
      {/* Header */}
      <div className="report-header">
        <h1>Interview Results</h1>
        <p>{report.jobRole} at {report.company}</p>
      </div>

      {/* Overall Score Card */}
      <div className="score-card">
        <div className="score-circle">
          <svg>
            <circle cx="70" cy="70" r="65"></circle>
            <circle
              cx="70"
              cy="70"
              r="65"
              style={{
                strokeDashoffset: 409 - (409 * report.overallScore) / 100,
                strokeDasharray: 409
              }}
            ></circle>
          </svg>
          <div className="score-text">
            <span className="score-value">{report.overallScore}</span>
            <span className="score-label">/100</span>
          </div>
        </div>

        <div className="verdict-card" style={{ borderColor: getVerdictColor(report.feedback?.interview_verdict) }}>
          <h3>Interview Verdict</h3>
          <p className="verdict" style={{ color: getVerdictColor(report.feedback?.interview_verdict) }}>
            {getVerdictLabel(report.feedback?.interview_verdict)}
          </p>
          <p className="verdict-description">{report.feedback?.performance_summary}</p>
        </div>
      </div>

      {/* Key Metrics */}
      {report.feedback && (
        <div className="metrics-grid">
          <div className="metric-card">
            <h4>Technical Skills</h4>
            <p className={`metric-rating ${report.feedback.technical_skills_assessment?.rating}`}>
              {report.feedback.technical_skills_assessment?.rating?.toUpperCase()}
            </p>
            <p className="metric-detail">{report.feedback.technical_skills_assessment?.details}</p>
          </div>

          <div className="metric-card">
            <h4>Communication</h4>
            <p className={`metric-rating ${report.feedback.communication_skills?.rating}`}>
              {report.feedback.communication_skills?.rating?.toUpperCase()}
            </p>
            <p className="metric-detail">{report.feedback.communication_skills?.details}</p>
          </div>

          <div className="metric-card">
            <h4>Problem Solving</h4>
            <p className={`metric-rating ${report.feedback.problem_solving?.rating}`}>
              {report.feedback.problem_solving?.rating?.toUpperCase()}
            </p>
            <p className="metric-detail">{report.feedback.problem_solving?.details}</p>
          </div>

          <div className="metric-card">
            <h4>Cultural Fit</h4>
            <p className={`metric-rating ${report.feedback.cultural_fit?.rating}`}>
              {report.feedback.cultural_fit?.rating?.toUpperCase()}
            </p>
            <p className="metric-detail">{report.feedback.cultural_fit?.details}</p>
          </div>
        </div>
      )}

      {/* Strengths & Development Areas */}
      <div className="strengths-development">
        <div className="section">
          <h3>💪 Top Strengths</h3>
          <ul>
            {report.feedback?.top_strengths?.map((strength: string, idx: number) => (
              <li key={idx}>{strength}</li>
            ))}
          </ul>
        </div>

        <div className="section">
          <h3>📈 Areas for Development</h3>
          <ul>
            {report.feedback?.areas_for_development?.map((area: string, idx: number) => (
              <li key={idx}>{area}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Next Steps */}
      {report.feedback?.next_steps_recommendations?.length > 0 && (
        <div className="next-steps-section">
          <h3>🎯 Next Steps & Recommendations</h3>
          <ul className="recommendations-list">
            {report.feedback.next_steps_recommendations.map((rec: string, idx: number) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Q&A Review */}
      {report.questionsAndAnswers && (
        <div className="qa-review-section">
          <h3>📋 Interview Q&A Review</h3>
          <div className="qa-list">
            {report.questionsAndAnswers.map((qa: any, idx: number) => (
              <div
                key={idx}
                className={`qa-item ${expandedIndex === idx ? 'expanded' : ''}`}
              >
                <div
                  className="qa-header"
                  onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                >
                  <div className="qa-title">
                    <span className="qa-number">Q{qa.questionNumber}</span>
                    <span className="qa-score">Score: {qa.score}/100</span>
                  </div>
                  <span className="expand-icon">
                    {expandedIndex === idx ? '▼' : '▶'}
                  </span>
                </div>

                {expandedIndex === idx && (
                  <div className="qa-content">
                    <div className="qa-question">
                      <strong>Question:</strong>
                      <p>{qa.question}</p>
                    </div>

                    <div className="qa-answer">
                      <strong>Your Answer:</strong>
                      <p>{qa.answer}</p>
                    </div>

                    {qa.feedback && (
                      <div className="qa-feedback">
                        <strong>Feedback:</strong>
                        <p>{qa.feedback.feedback}</p>

                        {qa.feedback.suggestions_for_improvement && (
                          <div className="suggestions">
                            <h5>Suggestions:</h5>
                            <ul>
                              {qa.feedback.suggestions_for_improvement.map((sug: string, sidx: number) => (
                                <li key={sidx}>{sug}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interview Meta */}
      <div className="interview-meta">
        <div className="meta-item">
          <span className="meta-label">Duration:</span>
          <span className="meta-value">{report.duration || 'N/A'} minutes</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Status:</span>
          <span className="meta-value">{report.status}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Total Questions:</span>
          <span className="meta-value">{report.totalQuestions}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="report-actions">
        <button className="btn-primary" onClick={onStartNewInterview}>
          Start New Interview
        </button>
        <button className="btn-secondary" onClick={onDownloadReport}>
          Download Report
        </button>
      </div>
    </div>
  );
};

export default InterviewReport;
