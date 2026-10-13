import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  coursePassword: z.string().min(4, 'Course password access code is required')
});

export const loginSchema = z.object({
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  password: z.string().min(1, 'Password is required'),
  deviceLabel: z.string().optional().default('Web Browser')
});

export const takeoverSchema = z.object({
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  password: z.string().min(1, 'Password is required'),
  deviceLabel: z.string().optional().default('Web Browser')
});

export const generateCodeSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  code: z.string().min(4, 'Code must be at least 4 characters').optional(),
  count: z.number().int().min(1).max(50).optional().default(1)
});

export const updateProgressSchema = z.object({
  lessonId: z.string().min(1, 'Lesson ID is required'),
  completed: z.boolean(),
  completedActivities: z.array(z.boolean()).optional()
});

export const videoAuthSchema = z.object({
  lessonId: z.string().min(1, 'Lesson ID is required')
});
