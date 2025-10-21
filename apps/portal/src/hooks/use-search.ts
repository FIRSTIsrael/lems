'use client';
import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { useDebounce } from './use-debounce';

export interface SearchResult {
  type: 'team' | 'event';
  id: string;
  title: string;
  subtitle: string;
  description: string;
  url: string;
  logoUrl?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  type: string;
  status: string;
}

export interface UseSearchOptions {
  minQueryLength?: number;
  debounceMs?: number;
}

export const useSearch = (options: UseSearchOptions = {}) => {
  const { minQueryLength = 2, debounceMs = 300 } = options;
  
  const [query, setQuery] = useState('');
  
  const debouncedQuery = useDebounce(query, debounceMs);

  const searchUrl = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < minQueryLength) {
      return null;
    }

    const params = new URLSearchParams({
      q: debouncedQuery,
      type: 'all',
      limit: '40' // idk about this, should we even have a limit?
    });

    return `/portal/search?${params.toString()}`;
  }, [debouncedQuery, minQueryLength]);

  const { data: searchResponse, error, isLoading } = useSWR<SearchResponse>(
    searchUrl,
    { 
      revalidateOnFocus: false,  
      dedupingInterval: 1000    
    }
  );

  const processedResults = useMemo(() => {
    return searchResponse?.results || [];
  }, [searchResponse]);

  const clearSearch = () => {
    setQuery('');
  };

  return {
    query,
    setQuery,
    searchResults: processedResults,
    isSearching: isLoading,
    clearSearch,
    error: error?.message || null
  };
};
