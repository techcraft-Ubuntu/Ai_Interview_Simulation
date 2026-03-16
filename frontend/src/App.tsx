import React, { useState } from 'react';
import { ResumeUpload } from './components/ResumeUpload';
import { ResumeAnalysis } from './components/ResumeAnalysis';
import { InterviewInterface } from './components/InterviewInterface';
import { InterviewReport } from './components/InterviewReport';
import { interviewAPI } from './services/apiService';
import './App.css';

type AppState = 
  | 'upload' 
  | 'analysis' 
  | 'interview' 
  | 'report';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [interviewReport, setInterviewReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle resume upload completion
  const handleResumeAnalysisComplete = (analysis: any, resume: string) => {
    setAnalysisData(analysis);
    setResumeText(resume);
    setCurrentState('analysis');
    setError(null);
  };

  // Handle role selection and start interview
  const handleSelectRole = async (role: string, company: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setSelectedRole(role);
      setSelectedCompany(company);

      // Start interview session
      const response = await interviewAPI.startInterview(
        resumeText,
        role,
        company,
        5 // 5 questions
      );

      if (response.success) {
        setSessionId(response.data.sessionId);
        setCurrentState('interview');
      } else {
        setError(response.error || 'Failed to start interview');
      }
    } catch (err: any) {
      setError(err.message || 'Error starting interview');
      console.error('Interview start error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle interview completion
  const handleInterviewComplete = (report: any) => {
    setInterviewReport(report);
    setCurrentState('report');
  };

  // Handle abandon interview
  const handleAbandonInterview = () => {
    setCurrentState('analysis');
    setSessionId(null);
  };

  // Handle start new interview
  const handleStartNewInterview = () => {
    setCurrentState('analysis');
    setSessionId(null);
    setInterviewReport(null);
  };

  // Handle report download
  const handleDownloadReport = () => {
    if (!interviewReport) return;

    const reportText = `
Interview Report
================

Role: ${selectedRole}
Company: ${selectedCompany}
Overall Score: ${interviewReport.overallScore}/100
Verdict: ${interviewReport.feedback?.interview_verdict}

Performance Summary:
${interviewReport.feedback?.performance_summary}

Technical Skills: ${interviewReport.feedback?.technical_skills_assessment?.rating}
Communication: ${interviewReport.feedback?.communication_skills?.rating}
Problem Solving: ${interviewReport.feedback?.problem_solving?.rating}
Cultural Fit: ${interviewReport.feedback?.cultural_fit?.rating}

Top Strengths:
${interviewReport.feedback?.top_strengths?.map((s: string) => `- ${s}`).join('\n')}

Areas for Development:
${interviewReport.feedback?.areas_for_development?.map((a: string) => `- ${a}`).join('\n')}

Next Steps:
${interviewReport.feedback?.next_steps_recommendations?.map((r: string) => `- ${r}`).join('\n')}

Questions & Answers:
${interviewReport.questionsAndAnswers?.map((qa: any, idx: number) => `
Q${idx + 1}: ${qa.question}
Score: ${qa.score}/100
Your Answer: ${qa.answer}
`).join('\n---\n')}
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(reportText));
    element.setAttribute('download', `interview-report-${new Date().toISOString().slice(0, 10)}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>🎯 AI Career Development Platform</h1>
          <p>Resume Analysis + AI Interview Simulation</p>
        </div>
        <div className="progress-indicator">
          <span className={currentState === 'upload' ? 'active' : 'done'}>1. Upload</span>
          <span className="separator">→</span>
          <span className={currentState === 'analysis' ? 'active' : 'done'}>2. Analyze</span>
          <span className="separator">→</span>
          <span className={currentState === 'interview' ? 'active' : 'done'}>3. Interview</span>
          <span className="separator">→</span>
          <span className={currentState === 'report' ? 'active' : ''}>4. Report</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {error && (
          <div className="global-error">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        {isLoading && (
          <div className="global-loading">
            <div className="spinner-large"></div>
            <p>Processing...</p>
          </div>
        )}

        {!isLoading && currentState === 'upload' && (
          <ResumeUpload
            onAnalysisComplete={handleResumeAnalysisComplete}
            onLoading={setIsLoading}
          />
        )}

        {!isLoading && currentState === 'analysis' && analysisData && (
          <ResumeAnalysis
            analysis={analysisData}
            onSelectRole={handleSelectRole}
            onLoading={setIsLoading}
          />
        )}

        {!isLoading && currentState === 'interview' && sessionId && (
          <InterviewInterface
            sessionId={sessionId}
            jobRole={selectedRole}
            company={selectedCompany}
            onComplete={handleInterviewComplete}
            onAbandon={handleAbandonInterview}
          />
        )}

        {!isLoading && currentState === 'report' && interviewReport && (
          <InterviewReport
            report={interviewReport}
            onStartNewInterview={handleStartNewInterview}
            onDownloadReport={handleDownloadReport}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>&copy; 2024 AI Career Development Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;