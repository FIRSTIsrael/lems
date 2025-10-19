'use client';
//
import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { EventSummary, TeamSummary } from '@lems/types/api/portal';

export interface SearchResult {
  type: 'team' | 'event';
  id: string;
  data: TeamSummary | EventSummary;
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
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const searchUrl = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < minQueryLength) {
      return null;
    }

    const params = new URLSearchParams({
      q: debouncedQuery,
      type: 'all',
      limit: '50'
    });

    return `/portal/search?${params.toString()}`;
  }, [debouncedQuery, minQueryLength]);

  const { data: searchResponse, error, isLoading } = useSWR<SearchResponse>(
    searchUrl,
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 1000
    }
  );

  const processedResults = useMemo(() => {
    if (!searchResponse?.results) return [];

    return searchResponse.results.map(result => ({
      ...result,
      title: result.type === 'team' 
        ? `${(result.data as TeamSummary).name} #${(result.data as TeamSummary).number}`
        : (result.data as EventSummary).name,
      subtitle: result.type === 'team'
        ? ` ${(result.data as TeamSummary).city}`
        : (result.data as EventSummary).location,
      description: result.type === 'team'
        ? (result.data as TeamSummary).affiliation
        : `${(result.data as EventSummary).teamsRegistered} teams registered • ${(result.data as EventSummary).status}`,
      url: result.type === 'team'
        ? `/teams/${(result.data as TeamSummary).number}`
        : `/events/${(result.data as EventSummary).slug}`
    }));
  }, [searchResponse]);

  // Get search statistics
  const searchStats = useMemo(() => {
    if (!processedResults.length) {
      return { total: 0, teams: 0, events: 0 };
    }

    const teamResults = processedResults.filter(r => r.type === 'team').length;
    const eventResults = processedResults.filter(r => r.type === 'event').length;
    
    return {
      total: processedResults.length,
      teams: teamResults,
      events: eventResults
    };
  }, [processedResults]);

  const clearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
  };

  return {
    query,
    setQuery,
    debouncedQuery,
    searchResults: processedResults,
    searchStats,
    isSearching: isLoading,
    hasQuery: debouncedQuery.length >= minQueryLength,
    isEmpty: processedResults.length === 0 && debouncedQuery.length >= minQueryLength && !isLoading,
    clearSearch,
    error: error?.message || null
  };
};
