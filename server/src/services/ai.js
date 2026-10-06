import { z } from 'zod';

const aiSessionSchema = z.object({
  topicId: z.string().optional().nullable(),
  assignmentId: z.string().optional().nullable(),
  date: z.string(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/)
});

const aiPlanSchema = z.object({
  sessions: z.array(aiSessionSchema),
  advice: z.string().optional()
});

/**
 * Generate study plan using Gemini AI
 */
export async function generateAIPlan({ topics, assignments, exams, availability, overrides, progress }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null; // Silently fall back
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a study planning assistant. Create an optimized study schedule based on the following data. Return ONLY valid JSON matching this schema:
{
  "sessions": [{ "topicId": "string|null", "assignmentId": "string|null", "date": "YYYY-MM-DD", "startTime": "HH:MM", "endTime": "HH:MM" }],
  "advice": "one line of motivational/strategic advice"
}

Rules:
- Schedule sessions in 30-60 minute blocks
- Add 10-minute breaks after 90 minutes of study
- Prioritize topics with closer deadlines and higher difficulty
- Interleave subjects (max 2 consecutive sessions per subject)
- Never schedule after a topic's exam date or assignment deadline
- Never exceed available hours per day
- Use 24-hour time format

Data:
Topics: ${JSON.stringify(topics.map(t => ({ id: t.id, title: t.title, subjectId: t.subjectId, difficulty: t.difficulty, estimatedHours: t.estimatedHours, status: t.status })))}
Assignments: ${JSON.stringify(assignments.map(a => ({ id: a.id, title: a.title, subjectId: a.subjectId, deadline: a.deadline, estimatedHours: a.estimatedHours, status: a.status })))}
Exams: ${JSON.stringify(exams.map(e => ({ subjectId: e.subjectId, title: e.title, date: e.date })))}
Availability (weekday 0=Sun): ${JSON.stringify(availability.map(a => ({ weekday: a.weekday, hours: a.hours })))}
Overrides: ${JSON.stringify(overrides.map(o => ({ date: o.date, hours: o.hours })))}

Return ONLY the JSON, no markdown or explanation.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    const parsed = JSON.parse(jsonMatch[0]);
    const validated = aiPlanSchema.parse(parsed);
    
    return validated;
  } catch (error) {
    console.error('AI plan generation failed, falling back to rule-based:', error.message);
    return null;
  }
}

/**
 * Generate a motivational/advice message using AI
 */
export async function generateAISummaryMessage({ hoursStudied, topicsCompleted, missed, streak }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You're a supportive study coach. Given this data, write ONE short motivational/advice sentence (max 30 words):
- Hours studied: ${hoursStudied}
- Topics completed: ${topicsCompleted}
- Missed sessions: ${missed}
- Study streak: ${streak} days
Return ONLY the sentence, no quotes.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return null;
  }
}
