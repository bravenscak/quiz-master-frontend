import React from 'react';
import { Category } from '../services/categoryService';

interface CategoryFilterProps {
  selectedCategoryId: number | null;  
  onCategoryChange: (categoryId: number | null) => void;  
  categories: Category[];  
  loading?: boolean;  
}

function CategoryFilter({ 
  selectedCategoryId, 
  onCategoryChange, 
  categories, 
  loading = false 
}: CategoryFilterProps) {
  return (
    <div className="relative">
      <select
        value={selectedCategoryId || ''}
        onChange={(e) => {
          const value = e.target.value;
          onCategoryChange(value ? parseInt(value) : null);
        }}
        disabled={loading}
        className="
          appearance-none
          bg-white 
          border-2 
          border-gray-200 
          rounded-lg 
          px-4 
          py-2 
          pr-8
          text-base 
          transition-colors 
          duration-200
          focus:border-quiz-primary 
          focus:outline-none
          cursor-pointer
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        <option value="">
          {loading ? 'Učitavanje...' : 'Sve kategorije'}
        </option>
        {categories.map(category => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

export default CategoryFilter;