import React from 'react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

function SearchBar({ searchTerm, onSearchChange, placeholder = "Pretraži kvizove..." }: SearchBarProps) {
  return (
    <div className="relative flex-1 max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg 
          className="h-5 w-5 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
      </div>
      
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full 
          pl-10 
          pr-4 
          py-2 
          border-2 
          border-gray-200 
          rounded-lg 
          text-base 
          transition-colors 
          duration-200
          focus:border-quiz-primary 
          focus:outline-none
          bg-white
        "
      />
      
      {searchTerm && (
        <button
          onClick={() => onSearchChange('')}
          className="
            absolute 
            inset-y-0 
            right-0 
            pr-3 
            flex 
            items-center
            text-gray-400
            hover:text-gray-600
            transition-colors
            duration-200
          "
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default SearchBar;