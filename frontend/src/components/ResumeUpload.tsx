import React, { useState, useRef } from 'react';
import { resumeAPI } from '../services/apiService';
import './ResumeUpload.css';

interface ResumeUploadProps {
  onAnalysisComplete: (analysisData: any, resumeText: string) => void;
  onLoading?: (isLoading: boolean) => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({
  onAnalysisComplete,
  onLoading
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError(null);
    setSuccess(false);

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

      const response = await resumeAPI.uploadResume(file);

      if (response.success) {
        setSuccess(true);
        // Pass the analysis data and resume text to parent component
        onAnalysisComplete(response.data, response.data.resume_text || '');
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
