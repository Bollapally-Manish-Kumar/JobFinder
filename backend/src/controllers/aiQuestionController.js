/**
 * AI Question Controller
 * Uses Groq AI to generate human-like answers for job application questions.
 * Called by the AxonApply extension when it encounters open-ended or tricky fields.
 */

import { generateCompletion } from '../utils/groqClient.js';

/**
 * POST /api/ai/answer-question
 * Body: { question, fieldType, jobContext, profile }
 * Returns: { answer }
 */
export const answerQuestion = async (req, res) => {
  try {
    const { question, fieldType, jobContext, profile } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'question is required' });
    }

    // Build a context-aware prompt
    const prompt = buildPrompt(question, fieldType, jobContext, profile);

    const answer = await generateCompletion(prompt, {
      temperature: 0.6,   // slightly creative but consistent
      max_tokens: 300      // keep answers concise
    });

    // Clean up the answer (remove quotes, extra whitespace)
    const cleaned = cleanAnswer(answer, fieldType);

    res.json({ success: true, answer: cleaned });
  } catch (error) {
    console.error('AI answerQuestion error:', error);
    res.status(500).json({ error: 'Failed to generate answer' });
  }
};

/**
 * POST /api/ai/classify-field
 * Body: { label, context }
 * Returns: { fieldType, confidence }
 */
export const classifyField = async (req, res) => {
  try {
    const { label, context } = req.body;

    if (!label) {
      return res.status(400).json({ error: 'label is required' });
    }

    const prompt = `You are a form field classifier for job applications.

Given the field label and optional context, classify what kind of field this is.
Return ONLY a JSON object with "fieldType" and "confidence" (0-1).

Known field types: firstName, lastName, fullName, email, phone, address, city, state, zipCode, country, linkedin, portfolio, github, website, experience, currentCompany, currentTitle, expectedSalary, currentSalary, noticePeriod, education, university, graduationYear, major, gpa, skills, workAuthorization, willingToRelocate, remotePreference, gender, dateOfBirth, nationality, coverLetter, whyInterested, whyCompany, careerGoals, strengths, availability, references, customQuestion

Field label: "${label}"
${context ? `Context: "${context}"` : ''}

Respond with ONLY valid JSON, example: {"fieldType":"firstName","confidence":0.95}`;

    const raw = await generateCompletion(prompt, { temperature: 0.2, max_tokens: 60 });

    try {
      const parsed = JSON.parse(raw.trim());
      return res.json({ success: true, ...parsed });
    } catch {
      return res.json({ success: true, fieldType: 'customQuestion', confidence: 0.3 });
    }
  } catch (error) {
    console.error('AI classifyField error:', error);
    res.status(500).json({ error: 'Failed to classify field' });
  }
};

// ─── Helpers ──────────────────────────────────────────────

function buildPrompt(question, fieldType, jobContext, profile) {
  const profileSummary = profile
    ? `Candidate profile:
- Name: ${profile.fullName || ''}
- Email: ${profile.email || ''}
- Current role: ${profile.currentTitle || ''} at ${profile.currentCompany || ''}
- Experience: ${profile.experienceYears || '?'} years
- Location: ${profile.city || ''}, ${profile.country || 'India'}
- Education: ${profile.highestEducation || ''} in ${profile.major || ''} from ${profile.university || ''}
- Skills: ${profile.skills || ''}
- Notice period: ${profile.noticePeriod || 'Not specified'}
- Expected salary: ${profile.expectedSalary || 'Negotiable'}
- Work authorization: ${profile.workAuthorization || 'Not specified'}`
    : '';

  const jobSummary = jobContext
    ? `Job context:
- Title: ${jobContext.title || ''}
- Company: ${jobContext.company || ''}
- Location: ${jobContext.location || ''}
- Description excerpt: ${(jobContext.description || '').slice(0, 400)}`
    : '';

  // Different prompts based on question type
  const questionTypeHints = getQuestionTypeHint(fieldType);

  return `You are filling out a job application form on behalf of a candidate.
Write a natural, human-sounding answer to the following application question.

Rules:
- Be genuine and professional — sound like a real person, NOT an AI
- Keep answers concise (1-3 sentences for short fields, up to a paragraph for cover letters)
- Use first person ("I", "my")
- Match the tone to the question (casual for simple Qs, professional for cover letters)
- If the question asks for a number, give just the number
- If the question is yes/no, answer clearly then briefly elaborate
- Never mention you are an AI or that you were generated
${questionTypeHints}

${profileSummary}

${jobSummary}

Question: "${question}"
${fieldType ? `Field type: ${fieldType}` : ''}

Answer (write ONLY the answer text, no quotes or labels):`;
}

function getQuestionTypeHint(fieldType) {
  const hints = {
    whyInterested: '- Explain genuine interest in the role based on skills and career goals',
    whyCompany: '- Show specific knowledge about the company and why it appeals to you',
    coverLetter: '- Write a brief, compelling cover letter (2-3 paragraphs max)',
    careerGoals: '- Describe realistic career aspirations that align with the role',
    strengths: '- Give concrete strengths with brief examples',
    availability: '- State when you can start (based on notice period)',
    customQuestion: '- Answer thoughtfully based on the candidate profile',
  };
  return hints[fieldType] || '';
}

function cleanAnswer(raw, fieldType) {
  let text = raw.trim();

  // Remove wrapping quotes
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    text = text.slice(1, -1);
  }

  // For numeric fields, try to extract just the number
  const numericFields = ['experienceYears', 'expectedSalary', 'currentSalary', 'gpa', 'graduationYear'];
  if (numericFields.includes(fieldType)) {
    const numMatch = text.match(/[\d,.]+/);
    if (numMatch) text = numMatch[0];
  }

  return text;
}
