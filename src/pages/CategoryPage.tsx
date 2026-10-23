import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MemberButton } from '../components/courses/MemberButton';
import { Navbar } from '../components/layout/Navbar';
import { VideoModal } from '../components/video/VideoModal';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { Lesson } from '../types';
import { DEFAULT_CATEGORIES } from './HomePage';

const DRIVE_LINKS: Record<string, string> = {
  'keywords-0': 'https://drive.google.com/file/d/1V8VaAyQlid5MeuosV9V91kTmH-1i_W-n/view?usp=drivesdk',
  'keywords-1': 'https://drive.google.com/file/d/1dJGAFqKpadBkUTis70SwWz6yCHN5rtTr/view?usp=drivesdk',
  'keywords-2': 'https://drive.google.com/file/d/1xBmdNjiyrqX-Eo9FBKkzTqeQezOKxw_H/view?usp=drivesdk',
  'keywords-3': 'https://drive.google.com/file/d/1hmmNcb5-V-twln-EMLqg0d59oFv5UZTN/view?usp=drivesdk',
  'keywords-4': 'https://drive.google.com/file/d/1gCfnEwcyPnJyb3ILlCwaq3pNjx52LBrb/view?usp=drivesdk'
};

const FALLBACK_LESSONS: Record<string, { id: string; title: string }[]> = {
  relative: [
    { id: 'relative-mother', title: 'Mother' },
    { id: 'relative-father', title: 'Father' },
    { id: 'relative-elder-brother', title: 'Elder Brother' },
    { id: 'relative-younger-brother', title: 'Younger Brother' },
    { id: 'relative-elder-sister', title: 'Elder Sister' },
    { id: 'relative-younger-sister', title: 'Younger Sister' },
    { id: 'relative-grandpa', title: 'Grandpa' },
    { id: 'relative-grandma', title: 'Grandma' },
    { id: 'relative-uncle', title: 'Uncle' },
    { id: 'relative-auntie', title: 'Auntie' },
    { id: 'relative-paternal-uncle', title: 'Paternal Uncle' },
    { id: 'relative-cousin', title: 'Cousin' },
    { id: 'relative-niece', title: 'Niece' }
  ],
  personal: [
    { id: 'personal-friend', title: 'Friend' },
    { id: 'personal-classmate', title: 'Classmate' },
    { id: 'personal-girlfriend', title: 'Girlfriend' },
    { id: 'personal-close-friend', title: 'Close Friend' },
    { id: 'personal-birthday-girl', title: 'Birthday Girl' },
    { id: 'personal-college-mate', title: 'College Mate' },
    { id: 'personal-cricket-captain', title: 'Cricket Captain' },
    { id: 'personal-class-leader', title: 'Class Leader' },
    { id: 'personal-neighbor', title: 'Neighbor' },
    { id: 'personal-co-passenger', title: 'Co-passenger' }
  ],
  official: [
    { id: 'official-class-teacher', title: 'Class Teacher' },
    { id: 'official-tuition-master', title: 'Tuition Master' },
    { id: 'official-headmaster', title: 'Headmaster' },
    { id: 'official-professor', title: 'Professor' },
    { id: 'official-principal', title: 'Principal' },
    { id: 'official-librarian', title: 'Librarian' },
    { id: 'official-interviewer', title: 'Interviewer' }
  ],
  public: [
    { id: 'public-bank-manager', title: 'Bank Manager' },
    { id: 'public-postmaster', title: 'Postmaster' },
    { id: 'public-railway-clerk', title: 'Railway Clerk' },
    { id: 'public-tte', title: 'TTE' },
    { id: 'public-receptionist', title: 'Receptionist' },
    { id: 'public-doctor', title: 'Doctor' },
    { id: 'public-inspector', title: 'Inspector' },
    { id: 'public-mla', title: 'MLA' },
    { id: 'public-junior-engineer', title: 'Junior Engineer' },
    { id: 'public-general-manager', title: 'General Manager' }
  ],
  business: [
    { id: 'business-buyer', title: 'Buyer' },
    { id: 'business-vendor', title: 'Vendor' },
    { id: 'business-shopkeeper', title: 'Shopkeeper' },
    { id: 'business-supplier', title: 'Supplier' },
    { id: 'business-salesgirl', title: 'Salesgirl' },
    { id: 'business-salesman', title: 'Salesman' },
    { id: 'business-courier-manager', title: 'Courier Manager' },
    { id: 'business-centre-in-charge', title: 'Centre In-charge' }
  ],
  fluency: [
    { id: 'fluency-friend', title: 'Friend' },
    { id: 'fluency-missed-call-friend', title: 'Missed Call Friend' },
    { id: 'fluency-heroine', title: 'Heroine' },
    { id: 'fluency-travel-friend', title: 'Travel Friend' },
    { id: 'fluency-business', title: 'Business' },
    { id: 'fluency-hero', title: 'Hero' },
    { id: 'fluency-politician', title: 'Politician' },
    { id: 'fluency-interviewer', title: 'Interviewer' }
  ],
  question: [
    { id: 'question-0', title: 'WH - Questions' },
    { id: 'question-1', title: 'BE - Form' },
    { id: 'question-2', title: 'Do - Form' },
    { id: 'question-3', title: 'Have - Form' },
    { id: 'question-4', title: 'Modals' }
  ],
  answer: [
    { id: 'answer-0', title: 'WH - Questions' },
    { id: 'answer-1', title: 'BE - Form' },
    { id: 'answer-2', title: 'Do - Form' },
    { id: 'answer-3', title: 'Have - Form' },
    { id: 'answer-4', title: 'Modals' }
  ],
  grammar: [
    { id: 'grammar-0', title: 'Grammar Starters' },
    { id: 'grammar-1', title: 'Parts of Speech' },
    { id: 'grammar-2', title: 'Tenses' },
    { id: 'grammar-3', title: 'Transformation' }
  ],
  keywords: [
    { id: 'keywords-0', title: 'Noun Words' },
    { id: 'keywords-1', title: 'Correlation Words' },
    { id: 'keywords-2', title: 'Action Words' },
    { id: 'keywords-3', title: 'Verb-Forms' },
    { id: 'keywords-4', title: 'Grammar & Tenses' }
  ],
  pronunciation: [
    { id: 'pronunciation-0', title: 'Pronunciation A - L' },
    { id: 'pronunciation-1', title: 'Pronunciation M - Z' },
    { id: 'pronunciation-2', title: 'Explanation' }
  ]
};

export const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeVideoLesson, setActiveVideoLesson] = useState<{ id: string; title: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, openLoginModal } = useAuth();

  const category = DEFAULT_CATEGORIES.find(c => c.id === categoryId) || {
    id: categoryId || 'relative',
    courseId: 'home-spoken-english',
    name: 'Course Circle',
    description: 'Speaking practice lessons',
    color: '#103665',
    displayOrder: 1
  };

  useEffect(() => {
    if (!user) {
      openLoginModal();
      return;
    }
    loadLessons();
  }, [categoryId, user]);

  const isLocalCompleted = (lessonId: string): boolean => {
    if (!user?.id) return false;
    try {
      return localStorage.getItem(`hsc_progress_${user.id}_${lessonId}`) === 'true';
    } catch {
      return false;
    }
  };

  const loadLessons = async () => {
    if (!categoryId) return;
    setLoading(true);
    setError(null);

    const fallbacks = FALLBACK_LESSONS[categoryId] || [];

    try {
      const data = await api.getLessons(categoryId);
      if (data.lessons && data.lessons.length > 0) {
        setLessons(
          data.lessons.map(l => ({
            ...l,
            completed: l.completed || isLocalCompleted(l.id)
          }))
        );
      } else {
        setLessons(
          fallbacks.map(f => ({
            id: f.id,
            categoryId,
            title: f.title,
            videoStatus: 'available',
            completed: isLocalCompleted(f.id),
            completedActivities: [true, true, true, true, true]
          }))
        );
      }
    } catch {
      setLessons(
        fallbacks.map(f => ({
          id: f.id,
          categoryId,
          title: f.title,
          videoStatus: 'available',
          completed: isLocalCompleted(f.id),
          completedActivities: [true, true, true, true, true]
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  const getDriveUrl = (lesson: Lesson): string | null => {
    if (DRIVE_LINKS[lesson.id]) return DRIVE_LINKS[lesson.id];
    const titleLower = (lesson.title || '').toLowerCase();
    if (categoryId === 'keywords' || lesson.id.startsWith('keywords')) {
      if (titleLower.includes('noun')) return DRIVE_LINKS['keywords-0'];
      if (titleLower.includes('correlation')) return DRIVE_LINKS['keywords-1'];
      if (titleLower.includes('action')) return DRIVE_LINKS['keywords-2'];
      if (titleLower.includes('verb')) return DRIVE_LINKS['keywords-3'];
      if (titleLower.includes('grammar') || titleLower.includes('tenses')) return DRIVE_LINKS['keywords-4'];
    }
    return null;
  };

  const markLessonComplete = async (lessonId: string) => {
    setLessons(prev =>
      prev.map(l => (l.id === lessonId ? { ...l, completed: true } : l))
    );

    if (user?.id) {
      try {
        localStorage.setItem(`hsc_progress_${user.id}_${lessonId}`, 'true');
      } catch {
        // Ignore
      }
    }

    try {
      await api.updateProgress(lessonId, true);
    } catch {
      // Ignore
    }
  };

  const handleCardClick = (lesson: Lesson) => {
    markLessonComplete(lesson.id);
    const driveUrl = getDriveUrl(lesson);
    if (driveUrl) {
      window.location.href = driveUrl;
      return;
    }
    setActiveVideoLesson({ id: lesson.id, title: lesson.title });
  };

  const handleVideoClose = () => {
    if (activeVideoLesson) {
      markLessonComplete(activeVideoLesson.id);
    }
    setActiveVideoLesson(null);
  };

  return (
    <main className="shell">
      <Navbar />

      <h1 className="circle-menu-title">{category.name}</h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', fontSize: '18px', color: '#666' }}>
          Loading lessons...
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : lessons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', fontSize: '18px', color: '#666' }}>
          No lessons found in this category.
        </div>
      ) : (
        <section className="circle-menu-wrap" style={{ marginTop: '16px' }}>
          <div className="family-grid">
            {lessons.map(lesson => (
              <MemberButton
                key={lesson.id}
                title={lesson.title}
                color={category.color}
                completed={lesson.completed}
                onClick={() => handleCardClick(lesson)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Direct Instant Video Player Modal Overlay */}
      {activeVideoLesson && (
        <VideoModal
          lessonId={activeVideoLesson.id}
          lessonTitle={activeVideoLesson.title}
          onClose={handleVideoClose}
        />
      )}
    </main>
  );
};
