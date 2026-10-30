# AI Interview Service

An AI-powered interview simulation service built with **Node.js, Express.js, and Groq API (Llama 3.1)**. It generates personalized interview questions, evaluates candidate responses, manages interview sessions, and produces detailed performance reports.

This service is an independent component of the **AI Interview Simulation Platform**, responsible for handling the complete interview lifecycle.

## Overview

The Interview Service provides an interactive interview experience based on a candidate's resume, selected job role, and target company.

Its primary responsibilities include:

- Generating personalized interview questions using AI.
- Managing interview sessions and candidate progress.
- Evaluating submitted answers against multiple criteria.
- Generating relevant follow-up questions.
- Calculating interview performance scores.
- Producing a comprehensive final interview report.

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API development |
| Groq API | LLM integration |
| Llama 3.1 | AI question generation and evaluation |
| UUID | Unique interview session identification |
| dotenv | Environment variable management |

## Project Structure

```text
interview-service/
│
├── server.js
│
├── routes/
│   └── interviewRoutes.js
│
├── controllers/
│   └── interviewController.js
│
├── services/
│   ├── questionGenerator.js
│   ├── answerEvaluator.js
│   └── groqClient.js
│
├── sessions/
│   └── sessionManager.js
│
├── package.json
└── README.md
```

### Architecture and Responsibilities

**1. server.js**
- Initializes the Express application.
- Configures middleware.
- Registers interview routes.
- Starts the interview service.

**2. routes/interviewRoutes.js**

Defines REST API endpoints and connects incoming requests to their respective controller functions.

**3. controllers/interviewController.js**

Acts as the orchestration layer. It handles:
- Starting interview sessions.
- Retrieving questions.
- Processing submitted answers.
- Managing interview completion.
- Generating final reports.

**4. services/questionGenerator.js**

Responsible for AI-powered question generation.

- Uses resume context, job role, and company information.
- Generates personalized interview questions.
- Supports relevant follow-up question generation.
- Uses the Groq client for LLM communication.

**5. services/answerEvaluator.js**

Evaluates candidate responses using five criteria:

| Criterion | What it evaluates |
|---|---|
| Correctness | Accuracy and relevance |
| Clarity | Clarity of explanation |
| Depth | Technical depth and detail |
| Approach | Soundness of methodology |
| Quality | Overall answer quality |

Generates numerical scores and actionable feedback for submitted answers.

**6. services/groqClient.js**

Provides a centralized interface for communicating with the Groq API.

- Handles LLM API requests.
- Supports structured JSON responses.
- Provides AI responses to question generation and evaluation services.

**7. sessions/sessionManager.js**

Manages interview session information, including:
- Unique session IDs.
- Resume context.
- Selected job role and company.
- Generated questions.
- Submitted answers and evaluation results.
- Interview progress and completion status.

---

## How It Works

The service follows a structured interview lifecycle.

### 1. Start Interview

The frontend sends the candidate's resume text, selected job role, company, and desired question count.

```http
POST /api/interview/start
```

Example request:

```json
{
  "resumeText": "Python, React, Node.js...",
  "jobRole": "Full Stack Developer",
  "company": "Google",
  "questionCount": 5
}
```

**Processing:**

1. Creates a unique interview session.
2. Stores session information.
3. Sends resume context and job requirements to the question generator.
4. Uses Groq API to generate personalized questions.
5. Returns the session ID and first question.

### 2. Submit Answer

The candidate submits an answer to the current interview question.

```http
POST /api/interview/{sessionId}/submit
```

Example request:

```json
{
  "answer": "My approach would be to..."
}
```

**Processing:**

1. Retrieves the current question from the session.
2. Sends the question and candidate's answer to the answer evaluator.
3. Evaluates the answer across five criteria.
4. Generates feedback and a score.
5. Stores the answer and evaluation.
6. Generates the next question or a relevant follow-up question.
7. Updates interview progress.

### 3. Complete Interview

Once all questions are answered, the frontend requests interview completion.

```http
POST /api/interview/{sessionId}/complete
```

The service:

- Calculates the overall interview score.
- Computes performance metrics.
- Analyzes all submitted answers.
- Identifies candidate strengths and improvement areas.
- Generates a hiring recommendation.
- Compiles the final interview report.

### 4. Final Interview Report

The final report contains:

- Overall interview score.
- Hiring verdict.
- Technical skills assessment.
- Communication assessment.
- Problem-solving assessment.
- Cultural fit assessment.
- Candidate strengths.
- Areas for improvement.
- Recommended next steps.
- Question-wise answers, scores, and feedback.

The frontend displays the report and allows the candidate to download it.

---

## API Endpoints

Base URL (development):

```text
http://localhost:5001
```

Base path:

```text
/api/interview
```

| Method | Endpoint | Description |
|---|---|---|
| POST | `/start` | Start a new interview |
| GET | `/:sessionId/question` | Retrieve current question |
| POST | `/:sessionId/submit` | Submit and evaluate an answer |
| GET | `/:sessionId/progress` | Retrieve interview progress |
| POST | `/:sessionId/complete` | Complete interview and generate report |
| GET | `/:sessionId/report` | Retrieve final interview report |
| POST | `/:sessionId/abandon` | Abandon an active interview |

---

## Interview Scoring System

Each submitted answer is evaluated across five dimensions, with individual scores ranging from 0 to 100.

The overall answer score is calculated as:

```text
Answer Score =
(Correctness + Clarity + Depth + Approach + Quality) / 5
```

The final interview score is calculated using the average of all question scores.

### Hiring Recommendation

The service generates a recommendation based on the overall score.

| Score | Recommendation |
|---|---|
| 85–100 | Strong Hire |
| 70–84 | Hire |
| 55–69 | Neutral |
| Below 55 | No Hire |

These recommendations are intended as practice feedback, not actual hiring decisions.

---

## Installation and Setup

### Prerequisites

- Node.js
- npm
- Groq API key

### 1. Clone the repository

```bash
git clone https://github.com/techcraft-Ubuntu/Ai_Interview_Simulation.git
```

### 2. Navigate to the service

```bash
cd Ai_Interview_Simulation/interview-service
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `interview-service` directory.

```env
GROQ_API_KEY=your_groq_api_key
PORT=5001
NODE_ENV=development
```

Never commit your actual API key to GitHub.

### 5. Start the service

```bash
npm start
```

The interview service runs at:

```text
http://localhost:5001
```

---

## Integration with the Main Application

The Interview Service communicates with the React frontend through REST APIs.

The overall application contains three major components:

```text
                 USER
                   |
                   v
          REACT FRONTEND
                   |
          +--------+--------+
          |                 |
          v                 v
     FLASK BACKEND     INTERVIEW SERVICE
          |                 |
          v                 v
     RESUME ANALYSIS    INTERVIEW ENGINE
          |                 |
          +--------+--------+
                   |
                   v
                GROQ API
                LLAMA 3.1
```

**Flask Backend:**
Handles PDF parsing, resume text extraction, skill analysis, and resume scoring.

**Interview Service:**
Handles question generation, answer evaluation, session management, and interview reports.

**React Frontend:**
Provides the user interface for resume upload, analysis, interview interaction, and report visualization.

---

## Error Handling

The service is designed to handle common operational errors, including:

- Missing resume context.
- Invalid job role or interview input.
- Invalid session IDs.
- Empty candidate answers.
- Groq API authentication errors.
- API rate limits and request failures.
- Network and service communication errors.

Errors are handled through the API response flow so the frontend can display appropriate messages.

## Future Improvements

Potential areas for further development:

- Persistent interview session storage.
- User authentication and interview history.
- Rate limiting and API security.
- More detailed interview analytics.
- Additional LLM providers.
- Automated interview difficulty adjustment.
- Voice-based interview interaction.

---

## Key Engineering Concepts

This project demonstrates practical implementation of:

- RESTful API design.
- Modular backend architecture.
- Separation of concerns.
- Service-layer abstraction.
- LLM API integration.
- Prompt-based question generation.
- Structured AI evaluation.
- Session lifecycle management.
- Multi-service application integration.

## Author

**Priyanshu Maurya**

GitHub: https://github.com/techcraft-Ubuntu

Project: [AI Interview Simulation](https://github.com/techcraft-Ubuntu/Ai_Interview_Simulation)
