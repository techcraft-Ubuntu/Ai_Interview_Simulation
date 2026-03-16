# MiniProject Architecture & Integration Guide

## Project Overview

This is a comprehensive AI-driven career development platform with three main services:

1. **Backend (Flask)** - Resume Analysis & Parsing
2. **Frontend (React + TypeScript)** - User Interface
3. **Interview Service (Node.js)** - AI Interview Simulation

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React/TypeScript)              │
│              (localhost:5173 or production URL)             │
└────────────┬─────────────────┬─────────────────┬────────────┘
             │                 │                 │
      Resume Upload     Job Analysis      Start Interview
             │                 │                 │
┌────────────▼─────┐  ┌────────▼──────┐  ┌─────▼──────────────┐
│  Backend Server  │  │  Backend API  │  │ Interview Service  │
│  (Flask, port    │  │  (Resume      │  │  (Node.js,         │
│   5000)          │  │   Parsing &   │  │   port 5001)       │
│                  │  │   Analysis)   │  │                    │
└────────┬─────────┘  └───────────────┘  └────────┬───────────┘
         │                                         │
    ┌────▼────────────┐              ┌────────────▼─────────┐
    │  Groq AI API    │              │  Groq AI API         │
    │  (resume        │              │  (question           │
    │   analysis)     │              │   generation &       │
    │                 │              │   evaluation)        │
    └─────────────────┘              └──────────────────────┘
```

## Data Flow

### 1. Resume Analysis Flow
```
User Upload Resume
       ↓
Frontend sends resume to Backend
       ↓
Backend Extracts Text (PDFMiner)
       ↓
Backend calls Groq AI for Analysis
       ↓
AI Analyzes & scores against role
       ↓
Returns: Tech Stack, Matches, Recommendations
       ↓
Frontend Displays Results
```

### 2. Interview Simulation Flow
```
User Selects Interview Option
       ↓
Frontend sends resume + role to Interview Service
       ↓
Interview Service calls Groq AI for Question Generation
       ↓
AI generates personalized questions
       ↓
Frontend displays first question
       ↓
User types answer
       ↓
Interview Service evaluates with AI
       ↓
Returns score, feedback, next question
       ↓
Repeat until all questions answered
       ↓
Interview Service generates final report
       ↓
Frontend displays comprehensive results
```

## Services Breakdown

### Backend Service (Python/Flask)
**Location**: `/backend`

**Responsibilities**:
- Resume PDF parsing and text extraction
- Resume analysis using Groq AI
- Tech stack detection
- Role and company recommendations
- Resume scoring and improvements

**Key Files**:
- `app.py` - Flask application setup
- `routes/resume_routes.py` - API endpoints
- `services/resume_parser.py` - PDF parsing
- `services/ai_engine.py` - AI analysis logic

**API Endpoints**:
```
POST /api/resume/upload - Upload and analyze resume
GET /api/resume/analysis/{id} - Get analysis results
```

### Interview Service (Node.js/Express)
**Location**: `/interview-service`

**Responsibilities**:
- Interview session management
- AI question generation
- Answer evaluation
- Feedback generation
- Performance reporting

**Key Files**:
- `server.js` - Express server setup
- `controllers/interviewController.js` - Business logic
- `routes/interviewRoutes.js` - API endpoints
- `services/groqClient.js` - AI API wrapper
- `services/questionGenerator.js` - Question logic
- `services/answerEvaluator.js` - Answer evaluation
- `sessions/sessionManager.js` - Session handling

**API Endpoints**:
```
POST /api/interview/start - Start new interview
POST /api/interview/{id}/submit - Submit answer
GET /api/interview/{id}/progress - Get progress
POST /api/interview/{id}/complete - End interview
GET /api/interview/{id}/report - Get full report
```

### Frontend Application (React/TypeScript)
**Location**: `/frontend`

**Responsibilities**:
- User interface for upload and analysis
- Interview UI with Q&A
- Results display
- Progress tracking

**Key Features**:
- Resume upload with drag-and-drop
- Real-time analysis display
- Interactive interview interface
- Detailed performance reports

## Running the Complete System

### 1. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup .env
echo "GROQ_API_KEY=your_key_here" > .env

# Run server
python app.py
# Backend runs on http://localhost:5000
```

### 2. Interview Service Setup
```bash
cd interview-service

# Install dependencies
npm install

# Setup .env
echo "GROQ_API_KEY=your_key_here" > .env
echo "PORT=5001" >> .env

# Run server
npm start
# Interview Service runs on http://localhost:5001
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
# Frontend runs on http://localhost:5173
```

### Complete System Running
```
Frontend (http://localhost:5173)
   ↓ API calls ↓
Backend (http://localhost:5000) + Interview Service (http://localhost:5001)
   ↓ Groq API calls ↓
Groq Cloud AI
```

## API Integration Example

### Resume Analysis to Interview

```typescript
// Frontend code showing the complete flow

// Step 1: Upload resume and get analysis
const uploadResume = async (file: File) => {
  const formData = new FormData();
  formData.append('resume', file);
  
  const response = await fetch('http://localhost:5000/api/resume/upload', {
    method: 'POST',
    body: formData
  });
  
  const analysis = await response.json();
  return analysis; // Contains tech stack, role recommendations, etc.
};

// Step 2: Start interview with resume data
const startInterview = async (analysis, selectedRole) => {
  const response = await fetch('http://localhost:5001/api/interview/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resumeText: analysis.original_resume,
      jobRole: selectedRole,
      company: analysis.suggested_companies[0],
      questionCount: 5
    })
  });
  
  const interview = await response.json();
  return interview;
};

// Step 3: Conduct interview
const conductInterview = async (sessionId, answers) => {
  for (const answer of answers) {
    const response = await fetch(`http://localhost:5001/api/interview/${sessionId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer })
    });
    
    const evaluation = await response.json();
    // Display feedback and move to next question
  }
  
  // Complete interview
  const report = await fetch(`http://localhost:5001/api/interview/${sessionId}/complete`, {
    method: 'POST'
  });
  
  return report.json();
};
```

## Environment Variables

### Backend (.env)
```env
GROQ_API_KEY=your_groq_api_key
FLASK_ENV=development
```

### Interview Service (.env)
```env
GROQ_API_KEY=your_groq_api_key
PORT=5001
```

### Frontend (.env.local) - if needed
```env
VITE_API_URL=http://localhost:5000
VITE_INTERVIEW_API_URL=http://localhost:5001
```

## Key Technologies

| Service | Tech Stack | Purpose |
|---------|-----------|---------|
| Backend | Flask, Python | Resume parsing & analysis |
| Interview | Express, Node.js | Interview simulation & evaluation |
| Frontend | React, TypeScript, Vite | User interface |
| AI | Groq API (Llama 3.1) | Intelligent analysis & evaluation |
| Data | In-memory (dev), Database (prod) | Data persistence |

## Deployment Considerations

### Development
- Run all three services locally
- Use localhost URLs with CORS enabled
- Quick iteration and testing

### Production
- Deploy each service to cloud platform (Heroku, AWS, GCP, etc.)
- Use environment variables for API keys
- Implement database for session/resume storage
- Add authentication and authorization
- Use HTTPS for all communications
- Implement rate limiting and monitoring
- Add security headers

## Features Implemented

### Resume Analyzer (Backend)
- ✅ PDF parsing
- ✅ Text extraction
- ✅ Tech stack detection
- ✅ Role-specific scoring
- ✅ Company recommendations
- ✅ Improvement suggestions

### Interview Simulator (Interview Service)
- ✅ AI question generation
- ✅ Role & company-specific questions
- ✅ Category-based questions (technical, behavioral, design)
- ✅ Real-time answer evaluation
- ✅ Detailed scoring system
- ✅ Follow-up question generation
- ✅ Session management
- ✅ Comprehensive final report
- ✅ Progress tracking

### Frontend
- ✅ Resume upload interface
- ✅ Analysis display
- ✅ Interview UI
- ✅ Real-time feedback
- ✅ Results visualization

## Future Enhancements

1. **Interview Features**
   - Video/audio support
   - Coding environment integration
   - Case study questions
   - Whiteboarding simulation

2. **Data & Analytics**
   - User history tracking
   - Performance trends
   - Comparison with other candidates
   - Analytics dashboard

3. **Integration**
   - LinkedIn profile import
   - Job posting import
   - Interview scheduling
   - Candidate ranking

4. **AI Improvements**
   - Custom training data
   - Industry-specific models
   - Multiple language support
   - Bias detection

## Support & Troubleshooting

### Common Issues

1. **CORS errors**: Frontend can't reach backend
   - Ensure CORS is enabled in Flask
   - Check URLs are correct

2. **Groq API errors**: Key invalid or rate limited
   - Verify API key in .env
   - Check quota limits
   - Wait before retrying

3. **Session lost**: Interview stops mid-way
   - Check network connection
   - Verify session ID is passed correctly
   - Check interview service is running

4. **Resume parsing fails**: Can't extract text
   - Ensure PDF is text-based (not scanned image)
   - Check file is not corrupted
   - Try uploading a different PDF

## Quick Diagnostics

```bash
# Check if services are running
curl http://localhost:5000
curl http://localhost:5001
curl http://localhost:5173

# Test API connectivity
curl -X POST http://localhost:5001/api/interview/start \
  -H "Content-Type: application/json" \
  -d '{"resumeText": "test", "jobRole": "Developer"}'

# View logs
# Backend: Check Flask console
# Interview: Check Node.js console, or use: npm run dev
# Frontend: Check browser console
```

## Contact & Resources

- **Groq API Docs**: https://console.groq.com/docs
- **Flask Docs**: https://flask.palletsprojects.com/
- **Express Docs**: https://expressjs.com/
- **React Docs**: https://react.dev/

---

**Project Status**: ✅ Resume Analyzer Complete | 🔄 Interview Service Complete | 🎯 Ready for Integration
