// src/components/Common/SearchBar.jsx
import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { debounce } from '../../utils/helpers';

const SearchBar = ({
  placeholder = 'Search...',
  onSearch,
  delay = 300,
  className = '',
  autoFocus = false,
  initialValue = '',
  ...props
}) => {
  const [query, setQuery] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  // Debounced search function
  const debouncedSearch = React.useMemo(
    () => debounce((searchQuery) => {
      onSearch?.(searchQuery);
    }, delay),
    [onSearch, delay]
  );

  useEffect(() => {
    if (query !== initialValue) {
      debouncedSearch(query);
    }
  }, [query, debouncedSearch, initialValue]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch?.('');
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`
        flex items-center px-3 py-2 border rounded-lg transition-all duration-200
        ${isFocused 
          ? 'border-blood-red ring-2 ring-blood-red ring-opacity-20' 
          : 'border-gray-300 hover:border-gray-400'
        }
      `}>
        <Search className="w-5 h-5 text-gray-400 mr-2" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="flex-1 bg-transparent border-none outline-none text-sm placeholder-gray-400"
          {...props}
        />
        {query && (
          <button
            onClick={handleClear}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;