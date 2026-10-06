import { Router } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { registerSchema, loginSchema } from '../validators/schemas.js';
import { authenticate, generateToken } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Register
router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { message: 'Email already registered' }
      });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash
      },
      select: { id: true, name: true, email: true, createdAt: true }
    });

    const token = generateToken(user.id);
    res.status(201).json({
      success: true,
      data: { user, token }
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password' }
      });
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid email or password' }
      });
    }

    const token = generateToken(user.id);
    res.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

//get current data

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, createdAt: true }
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// Regenerate token (for extension)
router.post('/regenerate-token', authenticate, async (req, res, next) => {
  try {
    const token = generateToken(req.userId);
    res.json({ success: true, data: { token } });
  } catch (error) {
    next(error);
  }
});

export default router;
