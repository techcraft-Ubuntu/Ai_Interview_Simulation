import { useState, useRef, type ChangeEvent, type DragEvent, type FC } from 'react';
import { resumeAPI } from '../services/apiService';
import './ResumeUpload.css';

interface ResumeUploadProps {
  onAnalysisComplete: (analysisData: any, resumeText: string, role: string, company: string) => void;
  onLoading?: (isLoading: boolean) => void;
}

export const ResumeUpload: FC<ResumeUploadProps> = ({
  onAnalysisComplete,
  onLoading
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const [selectedRole, setSelectedRole] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');

  const handleFile = async (file: File) => {
    setError(null);
    setSuccess(false);

    if (!selectedRole) {
      setError('Please select the role you want this resume reviewed for.');
      return;
    }

    if (!selectedCompany) {
      setError('Please select the target company for this review.');
      return;
    }

    // Validate file type
    if (!file.name.endsWith('.pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    try {
      setIsLoading(true);
      onLoading?.(true);

      const response = await resumeAPI.uploadResume(file, selectedRole, selectedCompany);

      if (response.success) {
        setSuccess(true);
        onAnalysisComplete(
          response.data,
          response.data.resume_text || '',
          selectedRole,
          selectedCompany
        );
      } else {
        setError(response.error || 'Failed to analyze resume');
      }
    } catch (err: any) {
      setError(err.message || 'Error uploading resume');
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
      onLoading?.(false);
    }
  };

  return (
    <div className="resume-upload-container">
      <div className="resume-upload-header">
        <h2>Upload Your Resume</h2>
        <p>Start by uploading your resume for AI analysis</p>
      </div>

      <div className="upload-meta">
        <div className="meta-field">
          <label htmlFor="role-select">Review Role</label>
          <select
            id="role-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">-- Select role --</option>
            <option value="Frontend Developer">Frontend Developer</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Full Stack Developer">Full Stack Developer</option>
            <option value="Data Engineer">Data Engineer</option>
            <option value="ML Engineer">ML Engineer</option>
            <option value="DevOps Engineer">DevOps Engineer</option>
            <option value="QA Engineer">QA Engineer</option>
            <option value="Solutions Architect">Solutions Architect</option>
          </select>
        </div>

        <div className="meta-field">
          <label htmlFor="company-select">Target Company</label>
          <select
            id="company-select"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
          >
            <option value="">-- Select company --</option>
            <option value="Google">Google</option>
            <option value="Amazon">Amazon</option>
            <option value="Microsoft">Microsoft</option>
            <option value="Meta">Meta</option>
            <option value="Netflix">Netflix</option>
            <option value="Apple">Apple</option>
            <option value="IBM">IBM</option>
            <option value="Startup">Startup</option>
          </select>
        </div>
      </div>

      <div
        className={`resume-drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="drop-zone-content">
          <svg
            className="upload-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <h3>Drag & Drop Your Resume</h3>
          <p>or click to browse</p>
          <span className="file-type">PDF files only (Max 10MB)</span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      {isLoading && (
        <div className="resume-loading">
          <div className="spinner"></div>
          <p>Analyzing your resume...</p>
        </div>
      )}

      {error && (
        <div className="resume-error">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="resume-success">
          <p>✓ Resume uploaded and analyzed successfully!</p>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
