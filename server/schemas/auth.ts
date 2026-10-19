import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  coursePassword: z.string().min(4, 'Course password access code is required')
});

export const loginSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Phone number is required')
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
