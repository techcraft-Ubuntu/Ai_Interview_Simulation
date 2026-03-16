import React, { useState } from 'react';
import './ResumeAnalysis.css';

interface ResumeAnalysisProps {
  analysis: any;
  onSelectRole: (role: string, company: string) => void;
  onLoading?: (isLoading: boolean) => void;
}

export const ResumeAnalysis: React.FC<ResumeAnalysisProps> = ({
  analysis,
  onSelectRole,
  onLoading
}) => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  const handleStartInterview = () => {
    if (selectedRole && selectedCompany) {
      onLoading?.(true);
      onSelectRole(selectedRole, selectedCompany);
    }
  };

  return (
    <div className="resume-analysis-container">
      <div className="analysis-header">
        <h2>Resume Analysis Results</h2>
      </div>

      {/* Tech Stack Section */}
      <div className="analysis-section">
        <h3>📦 Detected Tech Stack</h3>
        <div className="tech-stack">
          {analysis.detected_stack?.primary_language && (
            <div className="tech-item">
              <span className="tech-label">Primary Language:</span>
              <span className="tech-value">{analysis.detected_stack.primary_language}</span>
            </div>
          )}
          {analysis.detected_stack?.frameworks?.length > 0 && (
            <div className="tech-item">
              <span className="tech-label">Frameworks:</span>
              <div className="tech-tags">
                {analysis.detected_stack.frameworks.map((fw: string, idx: number) => (
                  <span key={idx} className="tag">{fw}</span>
                ))}
              </div>
            </div>
          )}
          {analysis.detected_stack?.databases?.length > 0 && (
            <div className="tech-item">
              <span className="tech-label">Databases:</span>
              <div className="tech-tags">
                {analysis.detected_stack.databases.map((db: string, idx: number) => (
                  <span key={idx} className="tag">{db}</span>
                ))}
              </div>
            </div>
          )}
          {analysis.detected_stack?.tools?.length > 0 && (
            <div className="tech-item">
              <span className="tech-label">Tools:</span>
              <div className="tech-tags">
                {analysis.detected_stack.tools.map((tool: string, idx: number) => (
                  <span key={idx} className="tag">{tool}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Strengths Section */}
      {analysis.strengths?.length > 0 && (
        <div className="analysis-section">
          <h3>💪 Strengths</h3>
          <ul className="list-items">
            {analysis.strengths.map((strength: string, idx: number) => (
              <li key={idx}>{strength}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing Skills Section */}
      {analysis.missing_skills?.length > 0 && (
        <div className="analysis-section">
          <h3>⚠️ Skills to Develop</h3>
          <ul className="list-items">
            {analysis.missing_skills.map((skill: string, idx: number) => (
              <li key={idx}>{skill}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Role Selection Section */}
      <div className="analysis-section role-selection">
        <h3>🎯 Select a Role for Interview</h3>
        
        <div className="role-selector">
          <label>Job Role:</label>
          <select
            value={selectedRole || ''}
            onChange={(e) => setSelectedRole(e.target.value || null)}
            className="selector-input"
          >
            <option value="">-- Select a role --</option>
            <option value={analysis.selected_role}>{analysis.selected_role}</option>
            <option value="Frontend Developer">Frontend Developer</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Full Stack Developer">Full Stack Developer</option>
            <option value="DevOps Engineer">DevOps Engineer</option>
            <option value="Data Engineer">Data Engineer</option>
            <option value="ML Engineer">ML Engineer</option>
            <option value="Solutions Architect">Solutions Architect</option>
            <option value="QA Engineer">QA Engineer</option>
          </select>
        </div>

        <div className="company-selector">
          <label>Target Company:</label>
          <select
            value={selectedCompany || ''}
            onChange={(e) => setSelectedCompany(e.target.value || null)}
            className="selector-input"
          >
            <option value="">-- Select a company --</option>
            {analysis.suggested_application_companies?.map((company: any, idx: number) => (
              <option key={idx} value={company.name}>{company.name}</option>
            ))}
            <option value="Google">Google</option>
            <option value="Amazon">Amazon</option>
            <option value="Microsoft">Microsoft</option>
            <option value="Meta">Meta</option>
            <option value="Netflix">Netflix</option>
            <option value="Apple">Apple</option>
            <option value="Tesla">Tesla</option>
            <option value="Startup">Startup</option>
          </select>
        </div>

        <button
          className="start-interview-btn"
          onClick={handleStartInterview}
          disabled={!selectedRole || !selectedCompany}
        >
          Start AI Interview
        </button>
      </div>

      {/* Recommendations Section */}
      {analysis.resume_improvements?.length > 0 && (
        <div className="analysis-section">
          <h3>💡 Resume Improvements</h3>
          <ul className="list-items">
            {analysis.resume_improvements.map((improvement: string, idx: number) => (
              <li key={idx}>{improvement}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Interview Focus Section */}
      {analysis.interview_focus?.length > 0 && (
        <div className="analysis-section">
          <h3>🎓 Focus Areas for Interview</h3>
          <ul className="list-items">
            {analysis.interview_focus.map((focus: string, idx: number) => (
              <li key={idx}>{focus}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Match Score */}
      {analysis.overall_match_score && (
        <div className="match-score-section">
          <h3>Overall Match Score</h3>
          <div className="score-bar">
            <div
              className="score-fill"
              style={{ width: `${analysis.overall_match_score}%` }}
            ></div>
          </div>
          <p className="score-text">{analysis.overall_match_score}%</p>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalysis;
