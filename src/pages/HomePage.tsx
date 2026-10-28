import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingScreen } from '../components/courses/LandingScreen';
import { CategoryCard } from '../components/courses/CategoryCard';
import { Navbar } from '../components/layout/Navbar';
import { AcademyHeader } from '../components/layout/AcademyHeader';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { CourseCategory } from '../types';

export const DEFAULT_CATEGORIES: CourseCategory[] = [
  { id: 'relative', courseId: 'home-spoken-english', name: 'Relative Circle', description: 'Everyday conversations, relationships, and family situations.', color: '#103665', displayOrder: 1, totalLessons: 13 },
  { id: 'personal', courseId: 'home-spoken-english', name: 'Personal Circle', description: 'Talk about yourself, family, interests, routines, and experiences.', color: '#b71945', displayOrder: 2, totalLessons: 10 },
  { id: 'official', courseId: 'home-spoken-english', name: 'Official Circle', description: 'Polite and professional English for formal communication.', color: '#ff741b', displayOrder: 3, totalLessons: 7 },
  { id: 'public', courseId: 'home-spoken-english', name: 'Public Circle', description: 'Speaking in public, asking questions, giving opinions, and sharing ideas.', color: '#5915e9', displayOrder: 4, totalLessons: 10 },
  { id: 'business', courseId: 'home-spoken-english', name: 'Business Circle', description: 'Workplace conversations, meetings, customers, and business communication.', color: '#05bd68', displayOrder: 5, totalLessons: 8 },
  { id: 'fluency', courseId: 'home-spoken-english', name: 'Fluency Practice', description: 'Short speaking tasks, repetition, and practical fluency exercises.', color: '#079bb0', displayOrder: 6, totalLessons: 8 },
  { id: 'question', courseId: 'home-spoken-english', name: 'Question Practice', description: 'Master asking targeted questions in English.', color: '#ff3034', displayOrder: 7, totalLessons: 5 },
  { id: 'answer', courseId: 'home-spoken-english', name: 'Answer Practice', description: 'Master answering questions confidently in English.', color: '#901bb0', displayOrder: 8, totalLessons: 5 },
  { id: 'grammar', courseId: 'home-spoken-english', name: 'Grammar & Tenses', description: 'Core English grammar rules, tenses, and sentence structures.', color: '#092fd1', displayOrder: 9, totalLessons: 4 },
  { id: 'keywords', courseId: 'home-spoken-english', name: 'Spoken Keywords', description: 'Essential keywords and vocabulary for everyday spoken English.', color: '#6920ad', displayOrder: 10, totalLessons: 5 },
  { id: 'pronunciation', courseId: 'home-spoken-english', name: 'Pronunciation', description: 'Clear pronunciation guides, phonetics, and speech audio practice.', color: '#ff19a7', displayOrder: 11, totalLessons: 3 }
];

export const HomePage: React.FC = () => {
  const { user, openLoginModal } = useAuth();
  const navigate = useNavigate();

  const [showLanding, setShowLanding] = useState<boolean>(() => {
    if (!user) return true;
    try {
      return sessionStorage.getItem('hsc_landing_opened') !== 'true';
    } catch {
      return true;
    }
  });

  const [categories, setCategories] = useState<CourseCategory[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    if (!user) {
      setShowLanding(true);
    } else {
      setShowLanding(false);
      try {
        sessionStorage.setItem('hsc_landing_opened', 'true');
      } catch {
        // Ignore
      }
      loadCategoriesProgress();
    }
  }, [user]);

  const loadCategoriesProgress = async () => {
    try {
      const data = await api.getCategories();
      if (data.categories && data.categories.length > 0) {
        setCategories(prev =>
          prev.map(cat => {
            const fetched = data.categories.find(c => c.id === cat.id);
            return fetched ? { ...cat, completedCount: fetched.completedCount } : cat;
          })
        );
      }
    } catch {
      // Ignore unauthenticated error
    }
  };

  const handleOpenCourse = () => {
    setShowLanding(false);
    try {
      sessionStorage.setItem('hsc_landing_opened', 'true');
    } catch {
      // Ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryClick = (categoryId: string) => {
    if (!user) {
      openLoginModal();
    } else {
      navigate(`/category/${categoryId}`);
    }
  };

  return (
    <main className="shell">
      <Navbar
        showBack={!showLanding}
        onBack={() => {
          setShowLanding(true);
          try {
            sessionStorage.removeItem('hsc_landing_opened');
          } catch {
            // Ignore
          }
        }}
      />

      {showLanding ? (
        <LandingScreen onOpenCourse={handleOpenCourse} />
      ) : (
        <>
          <AcademyHeader />
          <div style={{ border: '10px solid #F00505', padding: '10px' }}>
            <h1
              style={{
                fontSize: 'clamp(26px, 4.8vw, 42px)',
                fontWeight: 900,
                fontFamily: 'Georgia, "Times New Roman", serif',
                textAlign: 'center',
                margin: '16px 0 20px 0',
                color: '#000',
                letterSpacing: '0.04em'
              }}
            >
              Interactive Course
            </h1>
            <nav className="menu" aria-label="Learning categories">
              {categories.map(cat => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  onClick={() => handleCategoryClick(cat.id)}
                />
              ))}
            </nav>
          </div>
        </>
      )}
    </main>
  );
};
