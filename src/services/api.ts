import { User, CourseCategory, Lesson, SessionConflict, VideoAuthResponse, CourseAccessCode } from '../types';

export class ApiError extends Error {
  code?: string;
  status?: number;
  existingSession?: SessionConflict;

  constructor(message: string, status?: number, code?: string, existingSession?: SessionConflict) {
    super(message);
    this.status = status;
    this.code = code;
    this.existingSession = existingSession;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      data.error || data.message || 'An error occurred',
      res.status,
      data.code || data.status,
      data.existingSession
    );
  }

  return data as T;
}

export const api = {
  // AUTH
  async register(fullName: string, phoneNumber: string, password: string, coursePassword: string): Promise<{ user: User }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, phoneNumber, password, coursePassword })
    });
    return handleResponse<{ user: User }>(res);
  },

  async login(phoneNumber: string, password: string, deviceLabel = 'Web Browser'): Promise<{ user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, password, deviceLabel })
    });
    return handleResponse<{ user: User }>(res);
  },

  async takeoverSession(phoneNumber: string, password: string, deviceLabel = 'Web Browser'): Promise<{ user: User }> {
    const res = await fetch('/api/auth/takeover-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, password, deviceLabel })
    });
    return handleResponse<{ user: User }>(res);
  },

  async logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' });
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch('/api/auth/me');
    return handleResponse<{ user: User }>(res);
  },

  // COURSES & LESSONS
  async getCategories(): Promise<{ categories: CourseCategory[] }> {
    const res = await fetch('/api/courses/categories');
    return handleResponse<{ categories: CourseCategory[] }>(res);
  },

  async getLessons(categoryId: string): Promise<{ lessons: Lesson[] }> {
    const res = await fetch(`/api/courses/lessons/${categoryId}`);
    return handleResponse<{ lessons: Lesson[] }>(res);
  },

  async updateProgress(lessonId: string, completed: boolean, completedActivities?: boolean[]): Promise<void> {
    const res = await fetch('/api/courses/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, completed, completedActivities })
    });
    await handleResponse(res);
  },

  // VIDEO
  async authorizeVideo(lessonId: string): Promise<VideoAuthResponse> {
    const res = await fetch('/api/video/authorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId })
    });
    return handleResponse<VideoAuthResponse>(res);
  },

  // ADMIN
  async generateCode(courseId = 'home-spoken-english', customCode?: string, count = 1): Promise<{ codes: { code: string; id: string }[] }> {
    const res = await fetch('/api/admin/codes/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, code: customCode, count })
    });
    return handleResponse<{ codes: { code: string; id: string }[] }>(res);
  },

  async listCodes(): Promise<{ codes: CourseAccessCode[] }> {
    const res = await fetch('/api/admin/codes');
    return handleResponse<{ codes: CourseAccessCode[] }>(res);
  },

  async revokeCode(codeId: string): Promise<void> {
    const res = await fetch('/api/admin/codes/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codeId })
    });
    await handleResponse(res);
  },

  async importVideoMappings(csvContent: string): Promise<{ message: string; successCount: number; errors: string[] }> {
    const res = await fetch('/api/admin/video-mappings/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvContent })
    });
    return handleResponse<{ message: string; successCount: number; errors: string[] }>(res);
  }
};
