const { GoogleGenerativeAI } = require("@google/generative-ai");

const MODEL = "gemini-2.0-flash";

let model = null;

const getModel = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!model) model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({ model: MODEL });
  return model;
};

const isAiConfigured = () => Boolean(process.env.GEMINI_API_KEY);

/**
 * Writes a full article body with Gemini. Returns null when AI is unavailable
 * or fails — callers must skip the article rather than publish filler text.
 */
const generateFullArticle = async ({ title, description, category }) => {
  const gemini = getModel();
  if (!gemini) return null;

  const prompt = `
Write a professional long-form NEWS ARTICLE (minimum 700 words).

RULES:
- Plain text only (NO markdown, NO ###, NO bullets)
- Use section titles in CAPITAL LETTERS on their own line
- Paragraph based writing
- SEO friendly, informative, Indian context if possible
- Do not invent quotes or statistics

TITLE: ${title}
CATEGORY: ${category}
DESCRIPTION: ${description}
`;

  try {
    const result = await gemini.generateContent(prompt);
    const text = result.response.text();
    return text && text.trim().length > 200 ? text : null;
  } catch (error) {
    console.error("Gemini generation failed:", error.message);
    return null;
  }
};

module.exports = { generateFullArticle, isAiConfigured };
