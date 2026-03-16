# Complete Testing & Deployment Guide

## Testing Setup

### Interview Service Testing

The interview service includes comprehensive test suite with Jest.

#### Setup Tests

1. **Install Test Dependencies** (interview-service):
```bash
cd interview-service
npm install --save-dev jest supertest
```

2. **Update package.json** (interview-service/package.json):
```json
{
  "scripts": {
    "test": "jest --detectOpenHandles",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "testEnvironment": "node",
    "coveragePathIgnorePatterns": ["/node_modules/"]
  }
}
```

#### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

#### Test Results Expected

The test suite covers:
- ✅ Interview session creation
- ✅ Question generation
- ✅ Answer submission & evaluation
- ✅ Progress tracking
- ✅ Follow-up question generation
- ✅ Interview completion
- ✅ Report generation
- ✅ Session management
- ✅ Error handling
- ✅ Performance testing
- ✅ Integration testing

#### Test Output Example
```
PASS  tests/interview.test.js
  Interview Service API Tests
    POST /api/interview/start
      ✓ should start interview with valid input (450ms)
      ✓ should return error when resume text is missing (120ms)
      ✓ should return error when job role is missing (110ms)
      ✓ should work with default company parameter (150ms)
    GET /api/interview/:sessionId/question
      ✓ should get current question for valid session (200ms)
      ✓ should return error for invalid session ID (100ms)
    POST /api/interview/:sessionId/submit
      ✓ should submit answer and get evaluation (800ms)
      ✓ should return error when answer is missing (50ms)
      ✓ should validate score is between 0-100 (900ms)
    ...
    
Test Suites: 1 passed, 1 total
Tests: 50 passed, 50 total
Time: 45.238 s
```

## Environment Configuration

### Backend (.env)
```env
GROQ_API_KEY=your_groq_api_key
FLASK_ENV=development
FLASK_DEBUG=1
```

### Interview Service (.env)
```env
GROQ_API_KEY=your_groq_api_key
PORT=5001
NODE_ENV=development
```

### Frontend (.env.local - if needed)
```env
VITE_API_URL=http://localhost:5000
VITE_INTERVIEW_API_URL=http://localhost:5001
```

## Complete Workflow

### 1. Start All Services

**Terminal 1 - Backend**:
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
# Output: Running on http://127.0.0.1:5000
```

**Terminal 2 - Interview Service**:
```bash
cd interview-service
npm install  # First time only
npm start
# Output: Interview Service running on http://localhost:5001
```

**Terminal 3 - Frontend**:
```bash
cd frontend
npm install  # First time only
npm run dev
# Output: VITE v5.0.0  ready in ... ms
# ➜  Local:   http://localhost:5173/
```

### 2. Complete User Flow

**Step 1: Upload Resume**
- User uploads PDF resume
- Frontend sends to backend: `POST /api/resume/upload`
- Backend analyzes and returns: `{ status, data: { analysis }, success }`

**Step 2: View Analysis**
- Frontend displays resume analysis
- Shows detected tech stack, strengths, improvements
- User selects job role and target company

**Step 3: Start Interview**
- Frontend sends to interview service: `POST /api/interview/start`
- Service returns `{ sessionId, firstQuestion, jobRole, company }`
- Interview UI loads with first question

**Step 4: Answer Questions**
- For each question:
  - User enters answer: `POST /api/interview/{sessionId}/submit`
  - Service evaluates and returns score + feedback
  - User sees score breakdown and next question

**Step 5: Get Report**
- After all questions: `POST /api/interview/{sessionId}/complete`
- Service generates comprehensive report
- Frontend displays results with visualizations
- User can download report as text file

## API Testing

### Using cURL

#### Test Resume Analysis
```bash
curl -X POST http://localhost:5000/api/resume/upload \
  -F "resume=@/path/to/resume.pdf" \
  -F "role=Senior Developer" \
  -F "company=Google"
```

#### Test Interview Start
```bash
curl -X POST http://localhost:5001/api/interview/start \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "Your resume text here...",
    "jobRole": "Senior Developer",
    "company": "Google",
    "questionCount": 5
  }'
```

#### Test Answer Submission
```bash
curl -X POST http://localhost:5001/api/interview/{sessionId}/submit \
  -H "Content-Type: application/json" \
  -d '{"answer": "Your answer here..."}'
```

### Using Postman

1. Create a new collection
2. Add requests for each endpoint
3. Use variables for `sessionId` and `response` data
4. Run tests with proper assertions

## Frontend Testing

### Manual Testing Checklist

- [ ] Resume upload accepts PDF
- [ ] Analysis displays correctly
- [ ] Can select role and company
- [ ] Interview starts with first question
- [ ] Can type answer in textarea
- [ ] Answer submits and feedback displays
- [ ] Progress bar updates
- [ ] Can navigate to next question
- [ ] Completion shows report
- [ ] Can download report
- [ ] Can start new interview
- [ ] Mobile responsive design works

### Testing on Different Devices

```bash
# Test on different screen sizes
# Device toolbar in browser dev tools

# Desktop: 1920x1080
# Tablet: 768x1024
# Mobile: 375x667
```

## Performance Testing

### Interview Service Load Test

```bash
# Using Apache Bench
ab -n 100 -c 10 http://localhost:5001/

# Using wrk (for more detailed metrics)
wrk -t4 -c100 -d30s http://localhost:5001/
```

Expected performance:
- Response time < 1000ms for generation
- P95 < 1500ms
- Error rate < 1%

## Production Deployment

### Pre-Deployment Checklist

**Backend**:
- [ ] Verify GROQ_API_KEY is set
- [ ] Test with production-like resume
- [ ] Check PDF parsing with various formats
- [ ] Verify error handling
- [ ] Load test the API

**Interview Service**:
- [ ] All tests passing
- [ ] Production dependencies only
- [ ] Error logging configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured

**Frontend**:
- [ ] Build without errors: `npm run build`
- [ ] Test build output: `npm run preview`
- [ ] Check all links work
- [ ] Verify API URLs are correct
- [ ] Test on multiple browsers

### Deployment Commands

#### Backend (Heroku Example)
```bash
cd backend
heroku login
heroku create your-backend-app
heroku config:set GROQ_API_KEY=your_key
git push heroku main
```

#### Interview Service (Heroku Example)
```bash
cd interview-service
heroku create your-interview-service-app
heroku config:set GROQ_API_KEY=your_key
git push heroku main
```

#### Frontend (Vercel Example)
```bash
cd frontend
npm install -g vercel
vercel
# Follow prompts to deploy
```

### Environment Variables for Production

**Backend Production (.env)**:
```env
GROQ_API_KEY=prod_key_here
FLASK_ENV=production
DATABASE_URL=your_db_url
SECRET_KEY=your_secret_key
```

**Interview Service Production (.env)**:
```env
GROQ_API_KEY=prod_key_here
PORT=5001
NODE_ENV=production
DB_URL=your_db_url
CORS_ORIGIN=your_frontend_url
```

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find process
lsof -i :5000  # Backend
lsof -i :5001  # Interview Service
lsof -i :5173  # Frontend

# Kill process
kill -9 <PID>
```

**GROQ API Errors**
```
Error: "GROQ_API_KEY not set"
→ Check .env file exists and has correct key

Error: "Rate limit exceeded"
→ Wait before retrying or upgrade API plan

Error: "Invalid API key"
→ Verify key in Groq dashboard
```

**Frontend API Connection Issues**
```
Error: "Failed to fetch from interview service"
→ Ensure interview service is running on port 5001
→ Check CORS is enabled
→ Check environment variables are set
```

**Interview Service Crashes**
```
Error: "Cannot read property of undefined"
→ Ensure sessionId is passed correctly
→ Check session exists in sessionManager
→ Verify JSON response format
```

### Debug Mode

**Backend Debug**:
```bash
FLASK_ENV=development FLASK_DEBUG=1 python app.py
```

**Interview Service Debug**:
```bash
NODE_DEBUG=* npm start
```

**Frontend Debug**:
```bash
npm run dev  # Full debugging enabled
```

## Monitoring & Analytics

### Backend Monitoring
```python
# Add to app.py for logging
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@app.before_request
def log_request():
    logger.info(f'{request.method} {request.path}')
```

### Interview Service Monitoring
```javascript
// Add to server.js
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});
```

### Frontend Error Tracking
```typescript
// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Frontend error:', event.error);
  // Send to error tracking service
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
```

## Continuous Integration

### GitHub Actions Example (.github/workflows/ci.yml)
```yaml
name: CI/CD

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - uses: actions/setup-python@v2
      
      - name: Install Dependencies
        run: |
          cd backend && pip install -r requirements.txt
          cd ../interview-service && npm install
          cd ../frontend && npm install
      
      - name: Run Tests
        run: |
          cd interview-service && npm test
          cd ../backend && python -m pytest
      
      - name: Build Frontend
        run: cd frontend && npm run build
```

## Success Criteria

- ✅ All tests passing
- ✅ No errors in browser console
- ✅ No errors in server logs
- ✅ Resume uploads and analyzes correctly
- ✅ Interview sessions create successfully
- ✅ Questions generate and display
- ✅ Answers evaluate and score correctly
- ✅ Reports generate and display properly
- ✅ Response times acceptable (< 1000ms)
- ✅ Mobile responsive design works
- ✅ All features work end-to-end

## Support & Help

- Check error logs for detailed information
- Review API responses in browser dev tools
- Test endpoints individually with Postman
- Verify all environment variables are set
- Check Groq API quota and limits
- Review system performance metrics
