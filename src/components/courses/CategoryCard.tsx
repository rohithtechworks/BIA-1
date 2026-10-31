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
  return (
    <button
      type="button"
      className="category"
      style={{ background: category.color }}
      onClick={onClick}
    >
      <PersonSvg />
      <span className="card-copy">
        <span
          className="card-title"
          style={{
            display: 'block',
            fontWeight: 400,
            fontSize: 'clamp(16px, 4.3vw, 49px)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.15,
            textAlign: 'left',
            width: '100%'
          }}
        >
          {category.name}
        </span>
      </span>
    </button>
  );
};
