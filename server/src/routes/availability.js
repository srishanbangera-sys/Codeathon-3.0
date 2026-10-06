import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { availabilitySchema, availabilityBulkSchema, availabilityOverrideSchema } from '../validators/schemas.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Get availability
router.get('/', async (req, res, next) => {
  try {
    const availability = await prisma.availability.findMany({
      where: { userId: req.userId },
      orderBy: { weekday: 'asc' }
    });
    const overrides = await prisma.availabilityOverride.findMany({
      where: { userId: req.userId, date: { gte: new Date() } },
      orderBy: { date: 'asc' }
    });
    res.json({ success: true, data: { availability, overrides } });
  } catch (error) {
    next(error);
  }
});

// Set availability (bulk upsert for all weekdays)
router.put('/', async (req, res, next) => {
  try {
    const data = availabilityBulkSchema.parse(req.body);
    
    // Upsert each weekday
    const results = await Promise.all(
      data.map(item =>
        prisma.availability.upsert({
          where: { userId_weekday: { userId: req.userId, weekday: item.weekday } },
          update: { hours: item.hours },
          create: { userId: req.userId, weekday: item.weekday, hours: item.hours }
        })
      )
    );
    
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
});

// Add date override
router.post('/overrides', async (req, res, next) => {
  try {
    const data = availabilityOverrideSchema.parse(req.body);
    const override = await prisma.availabilityOverride.upsert({
      where: { userId_date: { userId: req.userId, date: new Date(data.date) } },
      update: { hours: data.hours },
      create: { userId: req.userId, date: new Date(data.date), hours: data.hours }
    });
    res.json({ success: true, data: override });
  } catch (error) {
    next(error);
  }
});

// Delete date override
router.delete('/overrides/:id', async (req, res, next) => {
  try {
    const override = await prisma.availabilityOverride.findFirst({
      where: { id: req.params.id, userId: req.userId }
    });
    if (!override) {
      return res.status(404).json({ success: false, error: { message: 'Override not found' } });
    }
    await prisma.availabilityOverride.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Override deleted' } });
  } catch (error) {
    next(error);
  }
});

export default router;
