# AI Interview Service - Quick Start Guide

## Installation & Setup

### 1. Install Dependencies
```bash
cd interview-service
npm install
```

### 2. Environment Configuration
Create `.env` file with:
```env
GROQ_API_KEY=your_groq_api_key_here
PORT=5001
```

### 3. Start the Service
```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

The service will run on `http://localhost:5001`

## API Usage Examples

### Example 1: Start an Interview
```curl
POST http://localhost:5001/api/interview/start
Content-Type: application/json

{
  "resumeText": "Your full resume text here...",
  "jobRole": "Senior Full Stack Developer",
  "company": "Google",
  "questionCount": 5
}
```

**Response includes:**
- `sessionId`: Use this for all subsequent requests
- `firstQuestion`: The first interview question
- `estimatedDuration`: Interview will take ~45 minutes

### Example 2: Submit Answer and Get Evaluation
```curl
POST http://localhost:5001/api/interview/{sessionId}/submit
Content-Type: application/json

{
  "answer": "Your detailed answer to the question..."
}
```

**Response includes:**
- `score`: 0-100 score for the answer
- `feedback`: Detailed evaluation
- `nextQuestion`: The next interview question (if not complete)
- `isInterviewComplete`: Whether interview is finished

### Example 3: Complete Interview
```curl
POST http://localhost:5001/api/interview/{sessionId}/complete
```

**Response includes:**
- `overallScore`: Final interview score
- `feedback`: Comprehensive feedback on all aspects
  - Technical skills assessment
  - Communication skills rating
  - Problem-solving evaluation
  - Cultural fit assessment
  - Strengths and areas for improvement

## Frontend Integration

### 1. Update API Base URL
In your frontend, set the interview service URL:
```typescript
const INTERVIEW_API = 'http://localhost:5001/api/interview';
```

### 2. Interview Session Flow
```typescript
// Start interview
const startInterview = async (resumeText, jobRole, company) => {
  const response = await fetch(`${INTERVIEW_API}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resumeText,
      jobRole,
      company,
      questionCount: 5
    })
  });
  return response.json();
};

// Submit answer
const submitAnswer = async (sessionId, answer) => {
  const response = await fetch(`${INTERVIEW_API}/${sessionId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answer })
  });
  return response.json();
};

// Complete interview
const completeInterview = async (sessionId) => {
  const response = await fetch(`${INTERVIEW_API}/${sessionId}/complete`, {
    method: 'POST'
  });
  return response.json();
};
```

### 3. UI Components Needed

**Interview Question Display:**
- Display current question
- Show question number (e.g., "Question 2 of 5")
- Show progress bar

**Answer Input:**
- Text area for answer submission
- Real-time character count
- Submit button with loading state

**Real-time Feedback:**
- Display quick feedback after answer
- Show score breakdown
- Next button or auto-advance

**Final Report:**
- Display overall score
- Show verdict (Strong Hire/Hire/Neutral/No Hire)
- List strengths and improvements
- Display recommendations

## Testing the Service

### Test with cURL
```bash
# Start interview
curl -X POST http://localhost:5001/api/interview/start \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "I am a full stack developer with 5 years of experience...",
    "jobRole": "Senior Full Stack Developer",
    "company": "Google",
    "questionCount": 3
  }'

# Check progress
curl http://localhost:5001/api/interview/{sessionId}/progress

# Get report
curl http://localhost:5001/api/interview/{sessionId}/report
```

### Test with JavaScript
```javascript
// Test script
const testInterview = async () => {
  // Start
  const startRes = await fetch('http://localhost:5001/api/interview/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resumeText: 'Full stack developer with Node.js, React, MongoDB experience',
      jobRole: 'Full Stack Developer',
      company: 'Startup',
      questionCount: 2
    })
  });
  
  const { data } = await startRes.json();
  const sessionId = data.sessionId;
  
  console.log('Interview started:', sessionId);
  console.log('First question:', data.firstQuestion);
  
  // Submit answer
  const answerRes = await fetch(
    `http://localhost:5001/api/interview/${sessionId}/submit`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answer: 'I would implement this using React for frontend...'
      })
    }
  );
  
  const { data: answerData } = await answerRes.json();
  console.log('Score:', answerData.evaluation.score);
  console.log('Next question:', answerData.nextQuestion);
};

testInterview();
```

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process using port 5001
lsof -i :5001
kill -9 <PID>
```

### GROQ_API_KEY Error
- Verify `.env` file is in the correct location
- Check API key is valid
- Make sure no spaces or quotes in the key

### Interview Stuck
- Check session ID in logs
- Verify network connection
- Restart service if needed

### Slow Response Times
- Check internet connection
- Monitor Groq API rate limits
- Consider reducing question count

## Production Deployment

### Before Deploying

1. **Environment Variables**
   - Use secure secret management
   - Never hardcode API keys

2. **Database Integration**
   - Replace in-memory sessions with persistent database
   - Implement session cleanup cronjobs

3. **Rate Limiting**
   - Add rate limiting middleware
   - Implement API quotas

4. **Error Logging**
   - Set up proper logging
   - Monitor API failures

5. **CORS Configuration**
   - Restrict CORS to known domains
   - Remove `*` in production

### Deployment Example (Heroku)

```bash
# Create Heroku app
heroku create interview-service-app

# Set environment variable
heroku config:set GROQ_API_KEY=your_key

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

## Performance Optimization

- **Interview Caching**: Cache common questions
- **Async Processing**: Use message queues for evaluation
- **CDN**: Serve static content via CDN
- **Database Indexing**: Index sessions by userId and status

## Support

- Check main project README
- Review Groq API documentation
- Check Node.js/Express best practices
