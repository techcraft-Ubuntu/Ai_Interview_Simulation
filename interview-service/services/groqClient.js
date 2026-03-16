const { Groq } = require('groq-sdk');
const dotenv = require('dotenv');

dotenv.config();

const API_KEY = process.env.GROQ_API_KEY;

if (!API_KEY) {
  throw new Error('GROQ_API_KEY is not set in environment variables');
}

const client = new Groq({
  apiKey: API_KEY
});

const MODEL_NAME = 'llama-3.1-8b-instant';

/**
 * Extract JSON from text response
 */
function extractJsonFromText(text) {
  try {
    // Remove markdown code blocks
    text = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Find JSON object
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('No JSON found in response');
  } catch (error) {
    console.error('JSON extraction failed:', error);
    console.error('Raw output:', text);
    throw error;
  }
}

/**
 * Call Groq API with a prompt
 */
async function callGroqAPI(prompt, temperature = 0.3, maxTokens = 1500) {
  try {
    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature,
      max_tokens: maxTokens
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Groq API error:', error);
    throw error;
  }
}

/**
 * Call Groq API and extract JSON response
 */
async function callGroqAPIWithJSON(prompt, temperature = 0.3, maxTokens = 1500) {
  const response = await callGroqAPI(prompt, temperature, maxTokens);
  return extractJsonFromText(response);
}

module.exports = {
  callGroqAPI,
  callGroqAPIWithJSON,
  extractJsonFromText
};
