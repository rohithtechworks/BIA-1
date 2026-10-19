import React from 'react';
import { CourseCategory } from '../../types';

interface CategoryCardProps {
  category: CourseCategory;
  onClick: () => void;
}

const PersonSvg: React.FC = () => (
  <svg className="person" viewBox="0 0 80 80" fill="none" aria-hidden="true">
    <circle cx="40" cy="23" r="17" stroke="white" strokeWidth="6" />
    <path d="M8 69c3-17 16-27 32-27s29 10 32 27c.5 3-2 5-5 5H13c-3 0-5.5-2-5-5Z" stroke="white" strokeWidth="6" strokeLinejoin="round" />
  </svg>
);

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  const completed = category.completedCount || 0;
  const total = category.totalLessons || 10;

  return (
    <button
      type="button"
      className="category"
      style={{ background: category.color }}
      onClick={onClick}
    >
      <PersonSvg />
      <span className="card-copy">
        <span className="card-title" style={{ display: 'block', fontWeight: 800, fontSize: 'clamp(30px, 6.8vw, 60px)' }}>
          {category.name}
        </span>
        <span className="progress" style={{ display: 'block', fontWeight: 700 }}>
          Progress: {completed}/{total}
        </span>
      </span>
    </button>
  );
};
