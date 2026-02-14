'use client';

import { useMemo } from 'react';
import { JudgingSession } from '../graphql';

export function useFilteredSessions(
  sessions: JudgingSession[],
  options: {
    teamFilter?: string;
    statusFilter?: string | string[];
    roomFilter?: string[];
    sessionNumberFilter?: number[];
    sortBy?: 'room' | 'session';
  }
): JudgingSession[] {
  return useMemo(() => {
    let filtered = [...sessions];

    if (options.teamFilter) {
      const lowerFilter = options.teamFilter.toLowerCase();
      filtered = filtered.filter(
        session =>
          session.team.number.toLowerCase().includes(lowerFilter) ||
          session.team.name.toLowerCase().includes(lowerFilter) ||
          session.team.affiliation.toLowerCase().includes(lowerFilter) ||
          session.team.city.toLowerCase().includes(lowerFilter)
      );
    }

    if (options.statusFilter) {
      if (Array.isArray(options.statusFilter) && options.statusFilter.length > 0) {
        filtered = filtered.filter(session =>
          (options.statusFilter as string[]).includes(session.status)
        );
      } else if (typeof options.statusFilter === 'string' && options.statusFilter !== '') {
        filtered = filtered.filter(session => session.status === options.statusFilter);
      }
    }

    if (options.roomFilter && options.roomFilter.length > 0) {
      filtered = filtered.filter(session => options.roomFilter!.includes(session.room.name));
    }

    if (options.sessionNumberFilter && options.sessionNumberFilter.length > 0) {
      filtered = filtered.filter(session => options.sessionNumberFilter!.includes(session.number));
    }

    if (options.sortBy === 'session') {
      return filtered.sort((a, b) => a.number - b.number);
    } else {
      return filtered.sort((a, b) => {
        if (a.room.name !== b.room.name) {
          return a.room.name.localeCompare(b.room.name);
        }
        return a.number - b.number;
      });
    }
  }, [sessions, options]);
}
