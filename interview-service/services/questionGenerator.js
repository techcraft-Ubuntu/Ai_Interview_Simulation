const { callGroqAPIWithJSON } = require('./groqClient');

/**
 * Generate interview questions based on resume and role
 */
async function generateInterviewQuestions(resumeText, jobRole, company = 'General', count = 5) {
  const prompt = `
You are an expert technical interviewer.

STRICT RULES:
- Output ONLY valid JSON.
- No explanation.
- No markdown.
- No text before or after JSON.

Generate ${count} technical interview questions for the following:

Job Role: ${jobRole}
Company: ${company}

Context from Resume:
"""
${resumeText}
"""

Return JSON format EXACTLY (do not include backticks or any markdown):

{
  "questions": [
    {
      "id": 1,
      "question": "Question text here",
      "category": "technical|behavioral|system_design|problem_solving",
      "difficulty": "easy|medium|hard",
      "expected_topics": ["topic1", "topic2"],
      "evaluation_criteria": ["criterion1", "criterion2"]
    }
  ],
  "interview_focus": ["focus_area1", "focus_area2"],
  "estimated_duration_minutes": 45
}
`;

  try {
    const result = await callGroqAPIWithJSON(prompt);
    return result;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
}

/**
 * Generate a follow-up question based on answer
 */
async function generateFollowUpQuestion(previousQuestion, userAnswer, category) {
  const prompt = `
You are an expert technical interviewer conducting a deep-dive interview.

STRICT RULES:
- Output ONLY valid JSON.
- No explanation.
- No markdown.
- No text before or after JSON.

Based on the user's answer to the previous question, generate a relevant follow-up to dig deeper.

Previous Question: ${previousQuestion}
User's Answer: ${userAnswer}
Question Category: ${category}

Return JSON format EXACTLY:

{
  "follow_up_question": "The follow-up question text",
  "difficulty": "easy|medium|hard",
  "expected_topics": ["topic1", "topic2"],
  "evaluation_criteria": ["criterion1", "criterion2"],
  "reason": "Why this follow-up is important"
}
`;

  try {
    const result = await callGroqAPIWithJSON(prompt);
    return result;
  } catch (error) {
    console.error('Error generating follow-up:', error);
    throw error;
  }
}

module.exports = {
  generateInterviewQuestions,
  generateFollowUpQuestion
};
