# AI Interview Simulation Service

An intelligent interview simulation service that generates personalized interview questions, evaluates answers using AI, and provides comprehensive feedback.

## Features

- **Intelligent Question Generation**: Generates role-specific and company-specific interview questions based on candidate's resume
- **AI-Powered Evaluation**: Uses Groq's AI to evaluate answers with detailed scoring and feedback
- **Session Management**: Maintains interview sessions with progress tracking
- **Follow-up Questions**: Generates contextual follow-up questions for deeper assessment
- **Comprehensive Feedback**: Provides detailed interview feedback and performance metrics
- **Real-time Assessment**: Quick feedback during the interview
- **Multiple Interview Modes**: Technical, behavioral, system design, and problem-solving questions

## Architecture

### Services

1. **groqClient.js** - Groq API wrapper for AI interactions
2. **questionGenerator.js** - Generates interview questions and follow-ups
3. **answerEvaluator.js** - Evaluates answers and generates feedback
4. **sessionManager.js** - Manages interview sessions and state

### Controllers & Routes

- **interviewController.js** - Business logic for interview operations
- **interviewRoutes.js** - API endpoint definitions

## API Endpoints

### Start Interview
**POST** `/api/interview/start`

```json
{
  "resumeText": "Full resume text...",
  "jobRole": "Senior Full Stack Developer",
  "company": "Google",
  "questionCount": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "jobRole": "Senior Full Stack Developer",
    "company": "Google",
    "totalQuestions": 5,
    "estimatedDuration": 45,
    "interviewFocus": ["System Design", "Data Structures"],
    "firstQuestion": {...}
  }
}
```

### Submit Answer
**POST** `/api/interview/:sessionId/submit`

```json
{
  "answer": "Your answer to the question..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "evaluation": {
      "score": 85,
      "breakdown": {...},
      "feedback": "..."
    },
    "isInterviewComplete": false,
    "nextQuestion": {...}
  }
}
```

### Get Progress
**GET** `/api/interview/:sessionId/progress`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalQuestions": 5,
    "completedQuestions": 2,
    "progressPercentage": 40,
    "currentScore": 82
  }
}
```

### Get Follow-up Question
**POST** `/api/interview/:sessionId/follow-up`

```json
{
  "question": "Original question...",
  "answer": "User's answer..."
}
```

### Complete Interview
**POST** `/api/interview/:sessionId/complete`

Returns comprehensive feedback and final score.

### Get Session Report
**GET** `/api/interview/:sessionId/report`

Returns full interview transcript and detailed analysis.

## Setup

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Groq API key

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# .env
GROQ_API_KEY=your_api_key_here
PORT=5001
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## How It Works

### Interview Flow

1. **Start**: Candidate submits resume and target role
2. **Generate**: AI generates customized questions
3. **Ask**: First question is presented
4. **Answer**: Candidate submits their answer
5. **Evaluate**: AI evaluates the answer with detailed scoring
6. **Feedback**: Real-time feedback and suggestion for follow-up
7. **Continue**: Move to next question or generate follow-up
8. **Complete**: Finish interview and get comprehensive report

### Evaluation Criteria

Answers are scored on:
- **Correctness** (0-100): Accuracy of the answer
- **Clarity** (0-100): How well explained
- **Depth** (0-100): Understanding demonstrated
- **Approach** (0-100): Problem-solving methodology
- **Quality** (0-100): Code/solution quality (if applicable)

### Question Categories

- **Technical**: Algorithm, design patterns, language specifics
- **Behavioral**: Soft skills, teamwork, conflict resolution
- **System Design**: Architecture, scalability, trade-offs
- **Problem Solving**: Approach to novel problems

## Interview Report

The final report includes:
- Overall performance score (0-100)
- Interview verdict: `strong_hire`, `hire`, `neutral`, `no_hire`
- Technical skills assessment
- Communication skills rating
- Problem-solving evaluation
- Cultural fit assessment
- Top strengths and areas for development
- Next steps recommendations

## Session Management

Sessions are stored in-memory with the following lifecycle:
- **active**: Interview in progress
- **completed**: Interview finished
- **abandoned**: User left interview

Sessions older than 24 hours are automatically cleaned up.

## Integration with Backend

The service connects to the resume analysis backend. Resume data flows from:
1. Frontend uploads resume
2. Backend analyzes resume
3. Interview service uses analyzed data to generate customized questions

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## Performance Notes

- Questions are generated asynchronously
- Follow-up questions have shorter timeouts for faster responses
- Interview sessions support concurrent interviews
- Groq API calls are optimized with appropriate temperature and token limits

## Future Enhancements

- Database persistence for sessions and results
- Video/audio recording support
- Real candidate screening mode
- Interview templates for different companies
- Performance analytics dashboard
- Integration with job posting platforms

## Support

For issues or questions, check the main project README or contact the development team.
