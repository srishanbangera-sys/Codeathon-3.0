import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/auth.js';
import subjectRoutes from './routes/subjects.js';
import topicRoutes from './routes/topics.js';
import examRoutes from './routes/exams.js';
import assignmentRoutes from './routes/assignments.js';
import availabilityRoutes from './routes/availability.js';
import scheduleRoutes from './routes/schedule.js';
import resourceRoutes from './routes/resources.js';
import summaryRoutes from './routes/summary.js';
import dashboardRoutes from './routes/dashboard.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const prisma = new PrismaClient();

// Make prisma available to routes
app.set('prisma', prisma);

// Security
app.use(helmet({ crossOriginResourcePolicy: false }));

// CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Check if origin matches any allowed origin (including extension prefixes)
    const isAllowed = allowedOrigins.some(allowed => {
      const trimmed = allowed.trim();
      return origin === trimmed || origin.startsWith(trimmed);
    });
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true); // Be permissive in dev
    }
  },
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: { message: 'Too many requests, try again later' } }
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`StudyPilot server running on port ${PORT}`);
});

export { app, prisma };
