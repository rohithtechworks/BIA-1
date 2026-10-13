export interface User {
  id: string;
  fullName: string;
  phoneNumber: string;
  role: 'student' | 'admin';
}

export interface CourseCategory {
  id: string;
  courseId: string;
  name: string;
  description: string;
  color: string;
  displayOrder: number;
  completedCount?: number;
  totalLessons?: number;
}

export interface Lesson {
  id: string;
  categoryId: string;
  title: string;
  description?: string;
  videoStatus: 'available' | 'unavailable' | 'processing';
  completed: boolean;
  completedActivities: boolean[];
}

export interface SessionConflict {
  deviceLabel: string;
  lastActivityAt: string;
}

export interface VideoAuthResponse {
  lessonId: string;
  title: string;
  signedUrl?: string;
  streamToken?: string;
  watermarkText: string;
}

export interface CourseAccessCode {
  id: string;
  course_id: string;
  status: 'active' | 'claimed' | 'revoked' | 'expired';
  created_at: string;
  claimed_at?: string;
  expires_at?: string;
  profiles?: {
    full_name: string;
    phone_number: string;
  };
}
