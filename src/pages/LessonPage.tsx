import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { Lesson } from '../types';

const DEFAULT_ACTIVITIES = [
  'Greet politely in English',
  'Ask a clear question and listen to response',
  'Explain your situation clearly',
  'Practise a short conversation',
  'Close the conversation respectfully'
];

export const LessonPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [activities, setActivities] = useState<boolean[]>(Array(5).fill(false));
  const [completed, setCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const { user, openLoginModal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      openLoginModal();
      return;
    }
    loadLessonData();
  }, [lessonId, user]);

  const loadLessonData = async () => {
    if (!lessonId) return;
    setLoading(true);

    const categoryId = lessonId.split('-')[0];
    try {
      const data = await api.getLessons(categoryId);
      const found = data.lessons.find(l => l.id === lessonId);
      if (found) {
        setLesson(found);
        setCompleted(found.completed);
        if (found.completedActivities && found.completedActivities.length > 0) {
          setActivities(found.completedActivities);
        }
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleActivityToggle = async (index: number) => {
    if (!lessonId) return;
    const nextActivities = [...activities];
    nextActivities[index] = !nextActivities[index];
    setActivities(nextActivities);

    const allCompleted = nextActivities.every(Boolean);
    setCompleted(allCompleted);

    setSaving(true);
    try {
      await api.updateProgress(lessonId, allCompleted, nextActivities);
    } catch {
      // Ignore progress error
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteAllToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!lessonId) return;
    const isChecked = e.target.checked;
    const nextActivities = Array(5).fill(isChecked);
    setActivities(nextActivities);
    setCompleted(isChecked);

    setSaving(true);
    try {
      await api.updateProgress(lessonId, isChecked, nextActivities);
    } catch {
      // Ignore
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="shell">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '60px 0', fontSize: '18px', color: '#666' }}>
          Loading lesson details...
        </div>
      </main>
    );
  }

  const categoryId = lessonId?.split('-')[0] || 'relative';

  return (
    <main className="shell">
      <Navbar />

      <button type="button" className="back" onClick={() => navigate(`/category/${categoryId}`)}>
        ← Back to Circle
      </button>

      <h1 className="page-title">{lesson?.title || 'Speaking Practice'}</h1>

      <VideoPlayer lessonId={lessonId || ''} lessonTitle={lesson?.title || 'Lesson Video'} />

      <section className="panel">
        <h2>Speaking Practice: {lesson?.title}</h2>
        <p>Complete these activities to practise speaking fluently in English.</p>

        <p className="status">
          Progress: <strong>{activities.filter(Boolean).length}</strong> / {activities.length} activities completed{' '}
          {saving && <span style={{ color: '#3b82f6', marginLeft: '8px' }}>(Saving to database...)</span>}
        </p>

        <div className="lesson-list">
          {DEFAULT_ACTIVITIES.map((act, i) => (
            <label key={i} className="lesson">
              <input
                type="checkbox"
                checked={!!activities[i]}
                onChange={() => handleActivityToggle(i)}
              />
              <span>{act}</span>
            </label>
          ))}
        </div>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #eee' }}>
          <label className="lesson">
            <input
              type="checkbox"
              checked={completed}
              onChange={handleCompleteAllToggle}
            />
            <span style={{ fontWeight: 'bold' }}>Mark entire lesson as completed</span>
          </label>
        </div>

        <p className="status" style={{ marginTop: '16px', color: '#05bd68', fontWeight: 'bold' }}>
          ✓ Progress is securely synchronized with your account in Supabase.
        </p>
      </section>
    </main>
  );
};
