import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { topicSchema, topicUpdateSchema } from '../validators/schemas.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// List topics (optionally filter by subjectId)
router.get('/', async (req, res, next) => {
  try {
    const where = { subject: { userId: req.userId } };
    if (req.query.subjectId) where.subjectId = req.query.subjectId;
    if (req.query.status) where.status = req.query.status;
    
    const topics = await prisma.topic.findMany({
      where,
      include: { subject: true, _count: { select: { resources: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: topics });
  } catch (error) {
    next(error);
  }
});

// Get single topic
router.get('/:id', async (req, res, next) => {
  try {
    const topic = await prisma.topic.findFirst({
      where: { id: req.params.id, subject: { userId: req.userId } },
      include: {
        subject: true,
        resources: { orderBy: { createdAt: 'desc' } },
        _count: { select: { resources: true } }
      }
    });
    if (!topic) {
      return res.status(404).json({ success: false, error: { message: 'Topic not found' } });
    }
    res.json({ success: true, data: topic });
  } catch (error) {
    next(error);
  }
});

// Create topic
router.post('/', async (req, res, next) => {
  try {
    const data = topicSchema.parse(req.body);
    // Verify subject belongs to user
    const subject = await prisma.subject.findFirst({
      where: { id: data.subjectId, userId: req.userId }
    });
    if (!subject) {
      return res.status(404).json({ success: false, error: { message: 'Subject not found' } });
    }
    const topic = await prisma.topic.create({
      data,
      include: { subject: true, _count: { select: { resources: true } } }
    });
    res.status(201).json({ success: true, data: topic });
  } catch (error) {
    next(error);
  }
});

// Update topic
router.patch('/:id', async (req, res, next) => {
  try {
    const data = topicUpdateSchema.parse(req.body);
    const topic = await prisma.topic.findFirst({
      where: { id: req.params.id, subject: { userId: req.userId } }
    });
    if (!topic) {
      return res.status(404).json({ success: false, error: { message: 'Topic not found' } });
    }

    // If marking completed, set completedAt
    if (data.status === 'COMPLETED' && topic.status !== 'COMPLETED') {
      data.completedAt = new Date();
    }
    if (data.status && data.status !== 'COMPLETED') {
      data.completedAt = null;
    }

    const updated = await prisma.topic.update({
      where: { id: req.params.id },
      data,
      include: { subject: true, _count: { select: { resources: true } } }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// Delete topic
router.delete('/:id', async (req, res, next) => {
  try {
    const topic = await prisma.topic.findFirst({
      where: { id: req.params.id, subject: { userId: req.userId } }
    });
    if (!topic) {
      return res.status(404).json({ success: false, error: { message: 'Topic not found' } });
    }
    await prisma.topic.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Topic deleted' } });
  } catch (error) {
    next(error);
  }
});

export default router;
