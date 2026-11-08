/**
 * Groq Client - Reusable Groq SDK instance
 * Uses the configured Groq model for AI tasks
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

// Default model to use across all AI features.
// qwen/qwen3.8-27b is available on the current Groq account and returns standard text responses.
export const GROQ_MODEL = 'qwen/qwen3.8-27b';
export const GROQ_LATEX_MODEL = 'openai/gpt-oss-20b';

/**
 * Generate a chat completion using Groq
 * @param {string} prompt - The user prompt
 * @param {object} options - Optional model, token limit, reasoning, and retry settings
 * @returns {Promise<string>} - The generated text response
 */
export const generateCompletion = async (prompt, options = {}) => {
  const {
    temperature = 0.7,
    max_tokens,
    maxTokens,
    maxCompletionTokens,
    maxRetries = 2,
    model = GROQ_MODEL,
    reasoningEffort,
    reasoningFormat
  } = options;
  const requestedLimit = Number(maxCompletionTokens ?? max_tokens ?? maxTokens ?? 2048);
  const tokenLimit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 64), 4096) : 2048;

  const groq = getGroqClient();

  const completionOptions = {
    model,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature
  };
  if (maxCompletionTokens !== undefined) {
    completionOptions.max_completion_tokens = tokenLimit;
  } else {
    completionOptions.max_tokens = tokenLimit;
  }
  if (reasoningEffort !== undefined) {
    completionOptions.reasoning_effort = reasoningEffort;
  }
  if (reasoningFormat !== undefined) {
    completionOptions.reasoning_format = reasoningFormat;
  }

  const completion = await groq.chat.completions.create(completionOptions, { maxRetries });

  const message = completion.choices?.[0]?.message || {};
  return message.content || message.reasoning || '';
};

export default getGroqClient;
