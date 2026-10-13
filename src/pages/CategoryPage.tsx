import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MemberButton } from '../components/courses/MemberButton';
import { Navbar } from '../components/layout/Navbar';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { Lesson } from '../types';
import { DEFAULT_CATEGORIES } from './HomePage';

export const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, openLoginModal } = useAuth();
  const navigate = useNavigate();

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

  const loadLessons = async () => {
    if (!categoryId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getLessons(categoryId);
      setLessons(data.lessons || []);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to load category lessons.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="shell">
      <Navbar />

      <button type="button" className="back" onClick={() => navigate('/')}>
        ← Back to Index
      </button>

      <h1 className="circle-menu-title">{category.name}</h1>

      <section className="panel" style={{ marginBottom: '24px' }}>
        <h2>{category.name} Practice</h2>
        <p>{category.description}</p>
      </section>

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
        <section className="circle-menu-wrap">
          <div className="family-grid">
            {lessons.map(lesson => (
              <MemberButton
                key={lesson.id}
                title={lesson.title}
                color={category.color}
                completed={lesson.completed}
                onClick={() => navigate(`/lesson/${lesson.id}`)}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
};
