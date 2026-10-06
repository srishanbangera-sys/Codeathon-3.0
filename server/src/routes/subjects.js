import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { subjectSchema } from '../validators/schemas.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// List subjects (with optional topics include)
router.get('/', async (req, res, next) => {
  try {
    const includeTopic = req.query.include === 'topics';
    const subjects = await prisma.subject.findMany({
      where: { userId: req.userId },
      include: {
        topics: includeTopic,
        exams: true,
        _count: { select: { topics: true, resources: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: subjects });
  } catch (error) {
    next(error);
  }
});

// Get single subject
router.get('/:id', async (req, res, next) => {
  try {
    const subject = await prisma.subject.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: {
        topics: { orderBy: { createdAt: 'desc' } },
        exams: { orderBy: { date: 'asc' } },
        assignments: { orderBy: { deadline: 'asc' } },
        resources: { orderBy: { createdAt: 'desc' } },
        _count: { select: { topics: true, resources: true } }
      }
    });
    if (!subject) {
      return res.status(404).json({ success: false, error: { message: 'Subject not found' } });
    }
    res.json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
});

// Create subject
router.post('/', async (req, res, next) => {
  try {
    const data = subjectSchema.parse(req.body);
    const subject = await prisma.subject.create({
      data: { ...data, userId: req.userId },
      include: { _count: { select: { topics: true, resources: true } } }
    });
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
});

// Update subject
router.patch('/:id', async (req, res, next) => {
  try {
    const data = subjectSchema.partial().parse(req.body);
    const subject = await prisma.subject.updateMany({
      where: { id: req.params.id, userId: req.userId },
      data
    });
    if (subject.count === 0) {
      return res.status(404).json({ success: false, error: { message: 'Subject not found' } });
    }
    const updated = await prisma.subject.findFirst({
      where: { id: req.params.id },
      include: { topics: true, _count: { select: { topics: true, resources: true } } }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// Delete subject
router.delete('/:id', async (req, res, next) => {
  try {
    const subject = await prisma.subject.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!subject) {
      return res.status(404).json({ success: false, error: { message: 'Subject not found' } });
    }
    await prisma.subject.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Subject deleted' } });
  } catch (error) {
    next(error);
  }
});

export default router;
