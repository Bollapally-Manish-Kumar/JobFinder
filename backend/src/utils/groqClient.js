/**
 * Groq Client - Reusable Groq SDK instance
 * Uses llama3-70b-8192 model for all AI tasks
 */

import Groq from 'groq-sdk';

// Lazy-initialized Groq client (initialized on first use)
let groqClient = null;

/**
 * Get or create Groq client instance
 * Uses lazy initialization to ensure API key is loaded from .env first
 */
const getGroqClient = () => {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set in environment');
    }
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }
  return groqClient;
};

// Default model to use across all AI features
// Using llama-3.3-70b-versatile (latest available model)
export const GROQ_MODEL = 'llama-3.3-70b-versatile';

/**
 * Generate a chat completion using Groq
 * @param {string} prompt - The user prompt
 * @param {object} options - Optional settings (temperature, max_tokens)
 * @returns {Promise<string>} - The generated text response
 */
export const generateCompletion = async (prompt, options = {}) => {
  const { temperature = 0.7, max_tokens, maxTokens } = options;
  const tokenLimit = max_tokens || maxTokens || 4096;

  const groq = getGroqClient();
  
  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature,
    max_tokens: tokenLimit
  });

  return completion.choices[0]?.message?.content || '';
};

export default getGroqClient;
