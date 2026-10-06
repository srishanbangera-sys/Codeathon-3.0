import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { assignmentSchema } from '../validators/schemas.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// List assignments
router.get('/', async (req, res, next) => {
  try {
    const where = { userId: req.userId };
    if (req.query.subjectId) where.subjectId = req.query.subjectId;
    if (req.query.status) where.status = req.query.status;
    
    const assignments = await prisma.assignment.findMany({
      where,
      include: { subject: true },
      orderBy: { deadline: 'asc' }
    });
    res.json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
});

// Get single assignment
router.get('/:id', async (req, res, next) => {
  try {
    const assignment = await prisma.assignment.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { subject: true }
    });
    if (!assignment) {
      return res.status(404).json({ success: false, error: { message: 'Assignment not found' } });
    }
    res.json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
});

// Create assignment
router.post('/', async (req, res, next) => {
  try {
    const data = assignmentSchema.parse(req.body);
    const subject = await prisma.subject.findFirst({
      where: { id: data.subjectId, userId: req.userId }
    });
    if (!subject) {
      return res.status(404).json({ success: false, error: { message: 'Subject not found' } });
    }
    const assignment = await prisma.assignment.create({
      data: { ...data, deadline: new Date(data.deadline), userId: req.userId },
      include: { subject: true }
    });
    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
});

// Update assignment (including status)
router.patch('/:id', async (req, res, next) => {
  try {
    const data = assignmentSchema.partial().parse(req.body);
    const assignment = await prisma.assignment.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!assignment) {
      return res.status(404).json({ success: false, error: { message: 'Assignment not found' } });
    }
    if (data.deadline) data.deadline = new Date(data.deadline);
    if (data.status === 'COMPLETED' && assignment.status !== 'COMPLETED') {
      data.completedAt = new Date();
    }
    if (data.status && data.status !== 'COMPLETED') {
      data.completedAt = null;
    }
    const updated = await prisma.assignment.update({
      where: { id: req.params.id },
      data,
      include: { subject: true }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// Delete assignment
router.delete('/:id', async (req, res, next) => {
  try {
    const assignment = await prisma.assignment.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!assignment) {
      return res.status(404).json({ success: false, error: { message: 'Assignment not found' } });
    }
    await prisma.assignment.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Assignment deleted' } });
  } catch (error) {
    next(error);
  }
});

export default router;
