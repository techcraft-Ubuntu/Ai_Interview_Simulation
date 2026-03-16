const { callGroqAPIWithJSON } = require('./groqClient');

/**
 * Evaluate user's answer to an interview question
 */
async function evaluateAnswer(question, userAnswer, evaluationCriteria, difficulty = 'medium') {
  const prompt = `
You are an expert technical interviewer evaluating a candidate's answer.

STRICT RULES:
- Output ONLY valid JSON.
- No explanation.
- No markdown.
- No text before or after JSON.

Question: ${question}
Candidate's Answer: ${userAnswer}
Question Difficulty: ${difficulty}

Evaluation Criteria:
${evaluationCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Evaluate the answer based on:
1. Correctness and accuracy
2. Clarity and communication
3. Depth of understanding
4. Problem-solving approach
5. Code quality (if applicable)

Return JSON format EXACTLY:

{
  "score": 0,
  "max_score": 100,
  "breakdown": {
    "correctness": 0,
    "clarity": 0,
    "depth": 0,
    "approach": 0,
    "quality": 0
  },
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestions_for_improvement": ["suggestion1", "suggestion2"],
  "follow_up_points": ["point1", "point2"],
  "feedback": "Detailed feedback about the answer"
}
`;

  try {
    const result = await callGroqAPIWithJSON(prompt);
    return result;
  } catch (error) {
    console.error('Error evaluating answer:', error);
    throw error;
  }
}

/**
 * Generate interview feedback summary
 */
async function generateInterviewFeedback(allQuestionsAndAnswers, jobRole, resumeExcerpt) {
  const questionsAnswersText = allQuestionsAndAnswers
    .map((qa) => `Q: ${qa.question}\nA: ${qa.answer}\nScore: ${qa.score}/100`)
    .join('\n\n');

  const prompt = `
You are an expert HR and technical interviewer providing comprehensive feedback.

STRICT RULES:
- Output ONLY valid JSON.
- No explanation.
- No markdown.
- No text before or after JSON.

Analyze this interview performance:

Job Role Applied For: ${jobRole}
Resume Background: ${resumeExcerpt}

Interview Q&A History:
${questionsAnswersText}

Return JSON format EXACTLY:

{
  "overall_performance_score": 0,
  "interview_verdict": "strong_hire|hire|neutral|no_hire",
  "performance_summary": "Overall summary of interview performance",
  "technical_skills_assessment": {
    "rating": "excellent|good|average|poor",
    "details": "Assessment details"
  },
  "communication_skills": {
    "rating": "excellent|good|average|poor",
    "details": "Assessment details"
  },
  "problem_solving": {
    "rating": "excellent|good|average|poor",
    "details": "Assessment details"
  },
  "cultural_fit": {
    "rating": "excellent|good|average|poor",
    "details": "Assessment details"
  },
  "top_strengths": ["strength1", "strength2", "strength3"],
  "areas_for_development": ["area1", "area2", "area3"],
  "next_steps_recommendations": ["recommendation1", "recommendation2"],
  "role_fit_assessment": "How well the candidate fits the role",
  "salary_expectation_guidance": "Based on performance level",
  "interview_notes": "Additional important notes"
}
`;

  try {
    const result = await callGroqAPIWithJSON(prompt);
    return result;
  } catch (error) {
    console.error('Error generating feedback:', error);
    throw error;
  }
}

/**
 * Generate quick answer assessment (real-time during interview)
 */
async function quickAssessAnswer(question, answer) {
  const prompt = `You are evaluating an interview answer quickly.

Question: ${question}
Answer: ${answer}

Provide a quick assessment in JSON:

{
  "quick_score": 0-10,
  "is_on_track": true|false,
  "brief_feedback": "Quick feedback",
  "suggest_follow_up": true|false
}`;

  try {
    const result = await callGroqAPIWithJSON(prompt, 0.5, 500);
    return result;
  } catch (error) {
    console.error('Error in quick assessment:', error);
    return {
      quick_score: 5,
      is_on_track: true,
      brief_feedback: 'Answer received',
      suggest_follow_up: false
    };
  }
}

module.exports = {
  evaluateAnswer,
  generateInterviewFeedback,
  quickAssessAnswer
};
