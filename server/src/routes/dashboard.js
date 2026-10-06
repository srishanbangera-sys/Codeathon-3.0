import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { calculateSubjectProgress, identifyWeakSubjects, calculatePredictedProgress, calculatePriorityScore, getPriorityLabel } from '../services/scheduler.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Dashboard data
router.get('/', async (req, res, next) => {
  try {
    // Check and mark missed sessions
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await prisma.studySession.updateMany({
      where: {
        userId: req.userId,
        status: 'PLANNED',
        date: { lt: today }
      },
      data: { status: 'MISSED' }
    });

    // Fetch all data in parallel
    const [subjects, exams, assignments, todaySessions, allSessions, weekSessions] = await Promise.all([
      prisma.subject.findMany({
        where: { userId: req.userId },
        include: { topics: true, _count: { select: { topics: true } } }
      }),
      prisma.exam.findMany({
        where: { userId: req.userId, date: { gte: today } },
        include: { subject: true },
        orderBy: { date: 'asc' },
        take: 5
      }),
      prisma.assignment.findMany({
        where: { userId: req.userId, status: { not: 'COMPLETED' } },
        include: { subject: true },
        orderBy: { deadline: 'asc' },
        take: 5
      }),
      prisma.studySession.findMany({
        where: { userId: req.userId, date: { gte: today, lt: tomorrow } },
        include: {
          topic: { include: { subject: true } },
          assignment: { include: { subject: true } }
        },
        orderBy: { startTime: 'asc' }
      }),
      prisma.studySession.findMany({
        where: { userId: req.userId }
      }),
      (() => {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return prisma.studySession.findMany({
          where: { userId: req.userId, date: { gte: weekAgo } }
        });
      })()
    ]);

    // Overall progress
    const allTopics = subjects.flatMap(s => s.topics);
    const totalTopics = allTopics.length;
    const completedTopics = allTopics.filter(t => t.status === 'COMPLETED').length;
    const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    // Per-subject progress
    const subjectProgress = subjects.map(s => ({
      id: s.id,
      name: s.name,
      color: s.color,
      progress: calculateSubjectProgress(s.topics),
      totalTopics: s.topics.length,
      completedTopics: s.topics.filter(t => t.status === 'COMPLETED').length
    }));

    // Hours studied this week
    const weekCompleted = weekSessions.filter(s => s.status === 'COMPLETED');
    const hoursThisWeek = weekCompleted.reduce((sum, s) => {
      const [sh, sm] = s.startTime.split(':').map(Number);
      const [eh, em] = s.endTime.split(':').map(Number);
      return sum + (eh + em / 60) - (sh + sm / 60);
    }, 0);

    // Streak
    let streak = 0;
    const checkDate = new Date(today);
    const completedDates = new Set(
      allSessions
        .filter(s => s.status === 'COMPLETED')
        .map(s => new Date(s.date).toISOString().split('T')[0])
    );
    
    const todayStr = today.toISOString().split('T')[0];
    if (!completedDates.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    while (completedDates.has(checkDate.toISOString().split('T')[0])) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Pending topics with priority
    const pendingTopics = allTopics
      .filter(t => t.status !== 'COMPLETED')
      .map(t => {
        const subject = subjects.find(s => s.id === t.subjectId);
        const subjectExams = exams.filter(e => e.subjectId === t.subjectId);
        const nearestExam = subjectExams[0];
        const deadline = nearestExam ? new Date(nearestExam.date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const totalDays = 30;
        const progress = t.status === 'IN_PROGRESS' ? 0.5 : 0;
        const score = calculatePriorityScore(t, deadline, totalDays, subject?.priority || 3, progress);
        
        return {
          ...t,
          subjectName: subject?.name,
          subjectColor: subject?.color,
          priorityScore: score,
          priorityLabel: getPriorityLabel(score),
          daysToDeadline: Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)))
        };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 10);

    // Weak subjects
    const weakSubjects = identifyWeakSubjects(subjects);

    // Upcoming with countdown
    const upcomingExams = exams.map(e => ({
      ...e,
      daysUntil: Math.max(0, Math.ceil((new Date(e.date) - now) / (1000 * 60 * 60 * 24)))
    }));

    const upcomingDeadlines = assignments.map(a => ({
      ...a,
      daysUntil: Math.max(0, Math.ceil((new Date(a.deadline) - now) / (1000 * 60 * 60 * 24)))
    }));

    // Predicted progress per exam
    const predictions = exams.map(exam => {
      const subjectSessions = allSessions.filter(s => {
        if (s.topicId) {
          const topic = allTopics.find(t => t.id === s.topicId);
          return topic && topic.subjectId === exam.subjectId;
        }
        return false;
      });
      return {
        examId: exam.id,
        examTitle: exam.title,
        subjectName: exam.subject.name,
        date: exam.date,
        ...calculatePredictedProgress(subjectSessions, exam.date)
      };
    });

    // Weekly study data for charts
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      
      const daySessions = weekSessions.filter(s => 
        new Date(s.date).toISOString().split('T')[0] === dayStr
      );
      const dayCompleted = daySessions.filter(s => s.status === 'COMPLETED');
      
      const planned = daySessions.reduce((sum, s) => {
        const [sh, sm] = s.startTime.split(':').map(Number);
        const [eh, em] = s.endTime.split(':').map(Number);
        return sum + (eh + em / 60) - (sh + sm / 60);
      }, 0);
      
      const completed = dayCompleted.reduce((sum, s) => {
        const [sh, sm] = s.startTime.split(':').map(Number);
        const [eh, em] = s.endTime.split(':').map(Number);
        return sum + (eh + em / 60) - (sh + sm / 60);
      }, 0);
      
      weeklyData.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: dayStr,
        planned: Math.round(planned * 10) / 10,
        completed: Math.round(completed * 10) / 10
      });
    }

    // Completion donut data
    const totalSessions = allSessions.length;
    const completedSessions = allSessions.filter(s => s.status === 'COMPLETED').length;
    const missedSessions = allSessions.filter(s => s.status === 'MISSED').length;
    const plannedSessions = allSessions.filter(s => s.status === 'PLANNED').length;

    res.json({
      success: true,
      data: {
        overallProgress,
        subjectProgress,
        todaySessions,
        upcomingExams,
        upcomingDeadlines,
        pendingTopics,
        weakSubjects,
        predictions,
        streak,
        hoursThisWeek: Math.round(hoursThisWeek * 10) / 10,
        weeklyData,
        completionDonut: {
          completed: completedSessions,
          missed: missedSessions,
          planned: plannedSessions,
          total: totalSessions
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
