import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { generateAISummaryMessage } from '../services/ai.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

const motivationalMessages = [
  "Keep pushing forward — every session counts!",
  "Consistency beats intensity. You're building great habits!",
  "Small steps every day lead to big results.",
  "You're making progress. Stay focused and keep going!",
  "Every completed topic is a victory. Celebrate your progress!",
  "The best time to study was yesterday. The next best time is now!",
  "Your dedication today shapes your success tomorrow.",
  "Focus on progress, not perfection. You're doing great!"
];

function getTemplatedMessage(data) {
  if (data.missed > data.topicsCompleted && data.missed > 0) {
    return "You missed some sessions recently. Try to stay consistent — even 30 minutes helps!";
  }
  if (data.streak >= 7) {
    return `Amazing ${data.streak}-day streak! Your consistency is paying off!`;
  }
  if (data.hoursStudied > 10) {
    return "Great effort this period! Make sure to take breaks and stay refreshed.";
  }
  return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
}

// Calculate streak
async function calculateStreak(userId) {
  const sessions = await prisma.studySession.findMany({
    where: { userId, status: 'COMPLETED' },
    orderBy: { date: 'desc' },
    select: { date: true }
  });

  if (sessions.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let checkDate = new Date(today);
  
  // Check if there's a session today or yesterday
  const todaySessions = sessions.filter(s => {
    const d = new Date(s.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });
  
  if (todaySessions.length === 0) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dayStr = checkDate.toISOString().split('T')[0];
    const hasSessions = sessions.some(s => {
      const d = new Date(s.date).toISOString().split('T')[0];
      return d === dayStr;
    });
    
    if (hasSessions) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// Daily summary
router.get('/daily', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessions = await prisma.studySession.findMany({
      where: {
        userId: req.userId,
        date: { gte: today, lt: tomorrow }
      },
      include: {
        topic: { include: { subject: true } },
        assignment: { include: { subject: true } }
      }
    });

    const completed = sessions.filter(s => s.status === 'COMPLETED');
    const missed = sessions.filter(s => s.status === 'MISSED');
    const planned = sessions.filter(s => s.status === 'PLANNED');

    // Calculate hours
    const hoursStudied = completed.reduce((sum, s) => {
      const [sh, sm] = s.startTime.split(':').map(Number);
      const [eh, em] = s.endTime.split(':').map(Number);
      return sum + (eh + em / 60) - (sh + sm / 60);
    }, 0);

    const topicsCompleted = completed.filter(s => s.topicId).length;
    const streak = await calculateStreak(req.userId);

    const summaryData = {
      hoursStudied: Math.round(hoursStudied * 10) / 10,
      topicsCompleted,
      missed: missed.length,
      planned: planned.length,
      streak
    };

    // Try AI message, fall back to template
    let message = await generateAISummaryMessage(summaryData);
    if (!message) message = getTemplatedMessage(summaryData);

    res.json({
      success: true,
      data: {
        ...summaryData,
        sessions,
        message
      }
    });
  } catch (error) {
    next(error);
  }
});

// Weekly summary
router.get('/weekly', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const sessions = await prisma.studySession.findMany({
      where: {
        userId: req.userId,
        date: { gte: weekAgo, lte: today }
      },
      include: {
        topic: { include: { subject: true } },
        assignment: { include: { subject: true } }
      }
    });

    const completed = sessions.filter(s => s.status === 'COMPLETED');
    const missed = sessions.filter(s => s.status === 'MISSED');

    const hoursStudied = completed.reduce((sum, s) => {
      const [sh, sm] = s.startTime.split(':').map(Number);
      const [eh, em] = s.endTime.split(':').map(Number);
      return sum + (eh + em / 60) - (sh + sm / 60);
    }, 0);

    const hoursPlanned = sessions.reduce((sum, s) => {
      const [sh, sm] = s.startTime.split(':').map(Number);
      const [eh, em] = s.endTime.split(':').map(Number);
      return sum + (eh + em / 60) - (sh + sm / 60);
    }, 0);

    // Daily breakdown
    const dailyBreakdown = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      
      const daySessions = sessions.filter(s => 
        new Date(s.date).toISOString().split('T')[0] === dayStr
      );
      const dayCompleted = daySessions.filter(s => s.status === 'COMPLETED');
      
      const dayHoursPlanned = daySessions.reduce((sum, s) => {
        const [sh, sm] = s.startTime.split(':').map(Number);
        const [eh, em] = s.endTime.split(':').map(Number);
        return sum + (eh + em / 60) - (sh + sm / 60);
      }, 0);
      
      const dayHoursCompleted = dayCompleted.reduce((sum, s) => {
        const [sh, sm] = s.startTime.split(':').map(Number);
        const [eh, em] = s.endTime.split(':').map(Number);
        return sum + (eh + em / 60) - (sh + sm / 60);
      }, 0);

      dailyBreakdown.push({
        date: dayStr,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        planned: Math.round(dayHoursPlanned * 10) / 10,
        completed: Math.round(dayHoursCompleted * 10) / 10
      });
    }

    const topicsCompleted = completed.filter(s => s.topicId).length;
    const streak = await calculateStreak(req.userId);

    const summaryData = {
      hoursStudied: Math.round(hoursStudied * 10) / 10,
      hoursPlanned: Math.round(hoursPlanned * 10) / 10,
      topicsCompleted,
      missed: missed.length,
      totalSessions: sessions.length,
      streak,
      dailyBreakdown
    };

    let message = await generateAISummaryMessage(summaryData);
    if (!message) message = getTemplatedMessage(summaryData);

    res.json({
      success: true,
      data: { ...summaryData, message }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
