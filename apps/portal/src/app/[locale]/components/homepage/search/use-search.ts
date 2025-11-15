'use client';

import useSWR from 'swr';
import { useState, useMemo, useDeferredValue } from 'react';
import { SearchResult } from './utils';

export interface SearchResponse {
  results: SearchResult[];
  total: number;
}

export const useSearch = (
  options: {
    minQueryLength?: number;
    debounceMs?: number;
  } = {}
) => {
  const { minQueryLength = 2 } = options;

  const [query, setQuery] = useState('');
  const debouncedQuery = useDeferredValue(query);

  const searchUrl = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < minQueryLength) {
      return null;
    }

    const params = new URLSearchParams({
      q: debouncedQuery,
      type: 'all',
      limit: '12'
    });

    return `/portal/search?${params.toString()}`;
  }, [debouncedQuery, minQueryLength]);

  const {
    data = { results: [] },
    error,
    isLoading
  } = useSWR<SearchResponse>(searchUrl, {
    revalidateOnFocus: false,
    dedupingInterval: 1000
  });

  const { results } = data;

  const clearSearch = () => {
    setQuery('');
  };

  return {
    query,
    setQuery,
    searchResults: results,
    isValid: !!debouncedQuery && debouncedQuery.length >= minQueryLength,
    isSearching: isLoading,
    clearSearch,
    error: error?.message || null
  };
};
