import React from 'react';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

function CategoryFilter({ selectedCategory, onCategoryChange, categories }: CategoryFilterProps) {
  return (
    <div className="relative">
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
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
        "
      >
        <option value="">Sve kategorije</option>
        {categories.map(category => (
          <option key={category} value={category}>
            {category}
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