import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { CategoryPage } from '../pages/CategoryPage';
import { LessonPage } from '../pages/LessonPage';
import { AdminPage } from '../pages/AdminPage';
import { LoginModal } from '../components/auth/LoginModal';
import { SignupModal } from '../components/auth/SignupModal';
import { SessionConflictModal } from '../components/auth/SessionConflictModal';

export const AppRoutes: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        <Route path="/lesson/:lessonId" element={<LessonPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating Auth & Session Modals */}
      <LoginModal />
      <SignupModal />
      <SessionConflictModal />
    </>
  );
};
