'use client';

import { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { FieldData, Scoresheet, ScoresheetStatus } from '../graphql/types';
import {
  groupByRound,
  filterScoresheets,
  filterMatchesByScoresheets,
  getEscalatedScoresheets,
  findScoresheetForTeam,
  type RoundGroup,
  type FilterOptions
} from './utils';

interface HeadRefereeContextType {
  data: FieldData;
  roundGroups: RoundGroup[];
  escalatedScoresheets: Scoresheet[];
  filterOptions: FilterOptions;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (statuses: ScoresheetStatus[]) => void;
  setShowEscalatedOnly: (show: boolean) => void;
  findScoresheetForTeam: (teamId: string, stage: string, round: number) => Scoresheet | undefined;
}

const HeadRefereeContext = createContext<HeadRefereeContextType | null>(null);

interface HeadRefereeProviderProps {
  data: FieldData;
  children?: ReactNode;
}

export function HeadRefereeProvider({ data, children }: HeadRefereeProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [searchQuery, setSearchQueryState] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilterState] = useState<ScoresheetStatus[]>(() => {
    const param = searchParams.get('status');
    return param ? (param.split(',') as ScoresheetStatus[]) : [];
  });
  const [showEscalatedOnly, setShowEscalatedOnlyState] = useState(
    searchParams.get('escalated') === 'true'
  );

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let hasChanges = false;

    // Handle search query
    const currentSearch = params.get('search') || '';
    if (searchQuery !== currentSearch) {
      if (searchQuery) {
        params.set('search', searchQuery);
      } else {
        params.delete('search');
      }
      hasChanges = true;
    }

    // Handle status filter
    const currentStatus = params.get('status');
    const newStatus = statusFilter.length > 0 ? statusFilter.join(',') : null;
    if (newStatus !== currentStatus) {
      if (newStatus) {
        params.set('status', newStatus);
      } else {
        params.delete('status');
      }
      hasChanges = true;
    }

    // Handle escalated filter
    const currentEscalated = params.get('escalated') === 'true';
    if (showEscalatedOnly !== currentEscalated) {
      if (showEscalatedOnly) {
        params.set('escalated', 'true');
      } else {
        params.delete('escalated');
      }
      hasChanges = true;
    }

    if (hasChanges) {
      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [searchQuery, statusFilter, showEscalatedOnly, pathname, router, searchParams]);

  const value = useMemo<HeadRefereeContextType>(() => {
    const filterOptions: FilterOptions = {
      searchQuery,
      statusFilter,
      showEscalatedOnly
    };

    // Get all escalated scoresheets (unfiltered, for panel)
    const escalatedScoresheets = getEscalatedScoresheets(data.scoresheets);

    // Apply filters
    const filteredScoresheets = filterScoresheets(data.scoresheets, filterOptions);
    const filteredMatches = filterMatchesByScoresheets(data.matches, filteredScoresheets);

    // Group by round
    const roundGroups = groupByRound(filteredMatches, filteredScoresheets);

    return {
      data,
      roundGroups,
      escalatedScoresheets,
      filterOptions,
      setSearchQuery: setSearchQueryState,
      setStatusFilter: setStatusFilterState,
      setShowEscalatedOnly: setShowEscalatedOnlyState,
      findScoresheetForTeam: (teamId: string, stage: string, round: number) =>
        findScoresheetForTeam(data.scoresheets, teamId, stage, round)
    };
  }, [data, searchQuery, statusFilter, showEscalatedOnly]);

  return <HeadRefereeContext.Provider value={value}>{children}</HeadRefereeContext.Provider>;
}

export function useHeadRefereeData(): HeadRefereeContextType {
  const context = useContext(HeadRefereeContext);
  if (!context) {
    throw new Error('useHeadRefereeData must be used within a HeadRefereeProvider');
  }
  return context;
}
