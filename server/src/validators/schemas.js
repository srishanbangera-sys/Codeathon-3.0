import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100)
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required').max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').default('#0F4C5C'),
  priority: z.number().int().min(1).max(5).default(3)
});

export const topicSchema = z.object({
  subjectId: z.string().min(1, 'Subject is required'),
  title: z.string().min(1, 'Title is required').max(200),
  difficulty: z.number().int().min(1).max(5).default(3),
  estimatedHours: z.number().positive('Estimated hours must be positive').default(1),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'MISSED']).default('NOT_STARTED'),
  notes: z.string().max(5000).optional().nullable()
});

export const topicUpdateSchema = topicSchema.partial().omit({ subjectId: true });

export const examSchema = z.object({
  subjectId: z.string().min(1, 'Subject is required'),
  title: z.string().min(1, 'Title is required').max(200),
  date: z.string().min(1, 'Date is required')
});

export const assignmentSchema = z.object({
  subjectId: z.string().min(1, 'Subject is required'),
  title: z.string().min(1, 'Title is required').max(200),
  deadline: z.string().min(1, 'Deadline is required'),
  estimatedHours: z.number().positive().default(1),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'MISSED']).default('NOT_STARTED')
});

export const availabilitySchema = z.object({
  weekday: z.number().int().min(0).max(6),
  hours: z.number().min(0).max(24)
});

export const availabilityBulkSchema = z.array(availabilitySchema);

export const availabilityOverrideSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  hours: z.number().min(0).max(24)
});

export const resourceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  url: z.string().url('Invalid URL'),
  type: z.enum(['ARTICLE', 'VIDEO', 'PDF', 'OTHER']).default('OTHER'),
  subjectId: z.string().optional().nullable(),
  topicId: z.string().optional().nullable()
});

export const resourceUpdateSchema = resourceSchema.partial();
