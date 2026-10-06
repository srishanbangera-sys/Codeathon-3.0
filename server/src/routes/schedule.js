import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
import { generateSchedule } from '../services/scheduler.js';
import { generateAIPlan } from '../services/ai.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Get all sessions
router.get('/sessions', async (req, res, next) => {
  try {
    const where = { userId: req.userId };
    if (req.query.from) where.date = { ...where.date, gte: new Date(req.query.from) };
    if (req.query.to) where.date = { ...where.date, lte: new Date(req.query.to) };
    if (req.query.status) where.status = req.query.status;
    
    const sessions = await prisma.studySession.findMany({
      where,
      include: {
        topic: { include: { subject: true } },
        assignment: { include: { subject: true } }
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
    });
    res.json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
});

// Generate schedule
router.post('/generate', async (req, res, next) => {
  try {
    const useAI = req.body.useAI === true;
    
    // Fetch all required data
    const [topics, assignments, exams, availabilityData, overrides] = await Promise.all([
      prisma.topic.findMany({
        where: { subject: { userId: req.userId }, status: { not: 'COMPLETED' } },
        include: { subject: true }
      }),
      prisma.assignment.findMany({
        where: { userId: req.userId, status: { not: 'COMPLETED' } },
        include: { subject: true }
      }),
      prisma.exam.findMany({
        where: { userId: req.userId, date: { gte: new Date() } },
        include: { subject: true }
      }),
      prisma.availability.findMany({ where: { userId: req.userId } }),
      prisma.availabilityOverride.findMany({ where: { userId: req.userId } })
    ]);

    // Delete future planned sessions
    await prisma.studySession.deleteMany({
      where: {
        userId: req.userId,
        status: 'PLANNED',
        date: { gte: new Date() }
      }
    });

    let sessions = [];
    let warning = null;
    let source = 'rule-based';

    // Try AI first if requested
    if (useAI) {
      const aiPlan = await generateAIPlan({
        topics, assignments, exams,
        availability: availabilityData, overrides
      });
      
      if (aiPlan && aiPlan.sessions.length > 0) {
        sessions = aiPlan.sessions.map(s => ({
          userId: req.userId,
          topicId: s.topicId || null,
          assignmentId: s.assignmentId || null,
          date: new Date(s.date),
          startTime: s.startTime,
          endTime: s.endTime,
          status: 'PLANNED'
        }));
        source = 'ai';
      }
    }

    // Fall back to rule-based
    if (sessions.length === 0) {
      const result = generateSchedule({
        topics, assignments, exams,
        availability: availabilityData, overrides
      });
      sessions = result.sessions.map(s => ({
        userId: req.userId,
        topicId: s.topicId || null,
        assignmentId: s.assignmentId || null,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        status: 'PLANNED'
      }));
      warning = result.warning;
    }

    // Save sessions
    if (sessions.length > 0) {
      await prisma.studySession.createMany({ data: sessions });
    }

    // Fetch created sessions with relations
    const createdSessions = await prisma.studySession.findMany({
      where: { userId: req.userId, status: 'PLANNED' },
      include: {
        topic: { include: { subject: true } },
        assignment: { include: { subject: true } }
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
    });

    res.json({
      success: true,
      data: {
        sessions: createdSessions,
        count: createdSessions.length,
        source,
        warning
      }
    });
  } catch (error) {
    next(error);
  }
});

// Replan
router.post('/replan', async (req, res, next) => {
  try {
    // Mark past planned sessions as MISSED
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    await prisma.studySession.updateMany({
      where: {
        userId: req.userId,
        status: 'PLANNED',
        date: { lt: now }
      },
      data: { status: 'MISSED' }
    });

    // Now regenerate (reuse generate logic)
    const [topics, assignments, exams, availabilityData, overrides] = await Promise.all([
      prisma.topic.findMany({
        where: { subject: { userId: req.userId }, status: { not: 'COMPLETED' } },
        include: { subject: true }
      }),
      prisma.assignment.findMany({
        where: { userId: req.userId, status: { not: 'COMPLETED' } },
        include: { subject: true }
      }),
      prisma.exam.findMany({
        where: { userId: req.userId, date: { gte: now } },
        include: { subject: true }
      }),
      prisma.availability.findMany({ where: { userId: req.userId } }),
      prisma.availabilityOverride.findMany({ where: { userId: req.userId } })
    ]);

    // Delete future planned sessions
    await prisma.studySession.deleteMany({
      where: {
        userId: req.userId,
        status: 'PLANNED',
        date: { gte: now }
      }
    });

    const result = generateSchedule({
      topics, assignments, exams,
      availability: availabilityData, overrides
    });

    const sessions = result.sessions.map(s => ({
      userId: req.userId,
      topicId: s.topicId || null,
      assignmentId: s.assignmentId || null,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      status: 'PLANNED'
    }));

    if (sessions.length > 0) {
      await prisma.studySession.createMany({ data: sessions });
    }

    const createdSessions = await prisma.studySession.findMany({
      where: { userId: req.userId, status: 'PLANNED' },
      include: {
        topic: { include: { subject: true } },
        assignment: { include: { subject: true } }
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
    });

    res.json({
      success: true,
      data: {
        sessions: createdSessions,
        count: createdSessions.length,
        warning: result.warning
      }
    });
  } catch (error) {
    next(error);
  }
});

// Mark session complete/missed
router.patch('/sessions/:id', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['COMPLETED', 'MISSED', 'PLANNED'].includes(status)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid status' } });
    }
    
    const session = await prisma.studySession.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!session) {
      return res.status(404).json({ success: false, error: { message: 'Session not found' } });
    }

    const updateData = { status };
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
      
      // If topic session, update topic status
      if (session.topicId) {
        await prisma.topic.update({
          where: { id: session.topicId },
          data: { status: 'IN_PROGRESS' }
        });
        
        // Check if all sessions for this topic are completed
        const topicSessions = await prisma.studySession.findMany({
          where: { topicId: session.topicId }
        });
        const allCompleted = topicSessions.every(s => 
          s.id === req.params.id ? true : s.status === 'COMPLETED'
        );
        if (allCompleted) {
          await prisma.topic.update({
            where: { id: session.topicId },
            data: { status: 'COMPLETED', completedAt: new Date() }
          });
        }
      }
      
      // If assignment session, mark in progress
      if (session.assignmentId) {
        await prisma.assignment.update({
          where: { id: session.assignmentId },
          data: { status: 'IN_PROGRESS' }
        });
      }
    }

    const updated = await prisma.studySession.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        topic: { include: { subject: true } },
        assignment: { include: { subject: true } }
      }
    });
    
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// Check and mark missed sessions (called on dashboard load)
router.post('/check-missed', async (req, res, next) => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const result = await prisma.studySession.updateMany({
      where: {
        userId: req.userId,
        status: 'PLANNED',
        date: { lt: now }
      },
      data: { status: 'MISSED' }
    });

    res.json({ success: true, data: { missedCount: result.count } });
  } catch (error) {
    next(error);
  }
});

export default router;
