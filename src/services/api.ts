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
    if (res.status !== 401) {
      console.error(`API Error (${res.status}):`, data.error || data.message || data);
    }
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
  async register(fullName: string, phoneNumber: string, coursePassword: string): Promise<{ user: User }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ fullName, phoneNumber, coursePassword })
    });
    const data = await handleResponse<{ user: User }>(res);
    if (data.user) {
      localStorage.setItem('hsc_user', JSON.stringify(data.user));
    }
    return data;
  },

  async login(fullName: string, phoneNumber: string): Promise<{ user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ fullName, phoneNumber })
    });
    const data = await handleResponse<{ user: User }>(res);
    if (data.user) {
      localStorage.setItem('hsc_user', JSON.stringify(data.user));
    }
    return data;
  },

  async logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    localStorage.removeItem('hsc_user');
  },

  async getMe(): Promise<{ user: User | null }> {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (res.status === 401) {
      localStorage.removeItem('hsc_user');
      return { user: null };
    }
    const data = await handleResponse<{ user: User | null }>(res);
    if (data.user) {
      localStorage.setItem('hsc_user', JSON.stringify(data.user));
    }
    return data;
  },

  // COURSES & LESSONS
  async getCategories(): Promise<{ categories: CourseCategory[] }> {
    const res = await fetch('/api/courses/categories', { credentials: 'include' });
    return handleResponse<{ categories: CourseCategory[] }>(res);
  },

  async getLessons(categoryId: string): Promise<{ lessons: Lesson[] }> {
    const res = await fetch(`/api/courses/lessons/${categoryId}`, { credentials: 'include' });
    return handleResponse<{ lessons: Lesson[] }>(res);
  },

  async updateProgress(lessonId: string, completed: boolean, completedActivities?: boolean[]): Promise<void> {
    const res = await fetch('/api/courses/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ lessonId, completed, completedActivities })
    });
    await handleResponse(res);
  },

  // VIDEO
  async authorizeVideo(lessonId: string): Promise<VideoAuthResponse> {
    const res = await fetch(`/api/lessons/${lessonId}/play`, {
      credentials: 'include'
    });
    return handleResponse<VideoAuthResponse>(res);
  },

  // ADMIN
  async generateCode(courseId = 'home-spoken-english', customCode?: string, count = 1): Promise<{ codes: { code: string; id: string }[] }> {
    const res = await fetch('/api/admin/codes/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ courseId, code: customCode, count })
    });
    return handleResponse<{ codes: { code: string; id: string }[] }>(res);
  },

  async listCodes(): Promise<{ codes: CourseAccessCode[] }> {
    const res = await fetch('/api/admin/codes', { credentials: 'include' });
    return handleResponse<{ codes: CourseAccessCode[] }>(res);
  },

  async revokeCode(codeId: string): Promise<void> {
    const res = await fetch('/api/admin/codes/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ codeId })
    });
    await handleResponse(res);
  },

  async importVideoMappings(csvContent: string): Promise<{ message: string; successCount: number; errors: string[] }> {
    const res = await fetch('/api/admin/video-mappings/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ csvContent })
    });
    return handleResponse<{ message: string; successCount: number; errors: string[] }>(res);
  }
};
