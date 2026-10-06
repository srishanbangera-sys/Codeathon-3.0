import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { examSchema } from '../validators/schemas.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// List exams
router.get('/', async (req, res, next) => {
  try {
    const where = { userId: req.userId };
    if (req.query.subjectId) where.subjectId = req.query.subjectId;
    if (req.query.upcoming === 'true') {
      where.date = { gte: new Date() };
    }
    
    const exams = await prisma.exam.findMany({
      where,
      include: { subject: true },
      orderBy: { date: 'asc' }
    });
    res.json({ success: true, data: exams });
  } catch (error) {
    next(error);
  }
});

// Get single exam
router.get('/:id', async (req, res, next) => {
  try {
    const exam = await prisma.exam.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { subject: true }
    });
    if (!exam) {
      return res.status(404).json({ success: false, error: { message: 'Exam not found' } });
    }
    res.json({ success: true, data: exam });
  } catch (error) {
    next(error);
  }
});

// Create exam
router.post('/', async (req, res, next) => {
  try {
    const data = examSchema.parse(req.body);
    const subject = await prisma.subject.findFirst({
      where: { id: data.subjectId, userId: req.userId }
    });
    if (!subject) {
      return res.status(404).json({ success: false, error: { message: 'Subject not found' } });
    }
    const exam = await prisma.exam.create({
      data: { ...data, date: new Date(data.date), userId: req.userId },
      include: { subject: true }
    });
    res.status(201).json({ success: true, data: exam });
  } catch (error) {
    next(error);
  }
});

// Update exam
router.patch('/:id', async (req, res, next) => {
  try {
    const data = examSchema.partial().parse(req.body);
    const exam = await prisma.exam.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!exam) {
      return res.status(404).json({ success: false, error: { message: 'Exam not found' } });
    }
    if (data.date) data.date = new Date(data.date);
    const updated = await prisma.exam.update({
      where: { id: req.params.id },
      data,
      include: { subject: true }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// Delete exam
router.delete('/:id', async (req, res, next) => {
  try {
    const exam = await prisma.exam.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!exam) {
      return res.status(404).json({ success: false, error: { message: 'Exam not found' } });
    }
    await prisma.exam.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Exam deleted' } });
  } catch (error) {
    next(error);
  }
});

export default router;
