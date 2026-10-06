import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { resourceSchema, resourceUpdateSchema } from '../validators/schemas.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// List resources (filter by subjectId or topicId)
router.get('/', async (req, res, next) => {
  try {
    const where = { userId: req.userId };
    if (req.query.subjectId) where.subjectId = req.query.subjectId;
    if (req.query.topicId) where.topicId = req.query.topicId;
    
    const resources = await prisma.resource.findMany({
      where,
      include: { subject: true, topic: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: resources });
  } catch (error) {
    next(error);
  }
});

// Create resource
router.post('/', async (req, res, next) => {
  try {
    const data = resourceSchema.parse(req.body);
    const resource = await prisma.resource.create({
      data: { ...data, userId: req.userId },
      include: { subject: true, topic: true }
    });
    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    next(error);
  }
});

// Update resource
router.patch('/:id', async (req, res, next) => {
  try {
    const data = resourceUpdateSchema.parse(req.body);
    const resource = await prisma.resource.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!resource) {
      return res.status(404).json({ success: false, error: { message: 'Resource not found' } });
    }
    const updated = await prisma.resource.update({
      where: { id: req.params.id },
      data,
      include: { subject: true, topic: true }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// Delete resource
router.delete('/:id', async (req, res, next) => {
  try {
    const resource = await prisma.resource.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!resource) {
      return res.status(404).json({ success: false, error: { message: 'Resource not found' } });
    }
    await prisma.resource.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Resource deleted' } });
  } catch (error) {
    next(error);
  }
});

export default router;
