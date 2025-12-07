'use client';

import { useMemo, useState } from 'react';
import { JudgingSessionAdvisor } from '../lead-judge.graphql';


export const useFilter = (sessions: JudgingSessionAdvisor[]) => {
  const [teamFilter, setTeamFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

    const sortedAndFilteredSessions : JudgingSessionAdvisor[]= useMemo(() => {
      let filtered = [...sessions];
  
      if (teamFilter) {
        const lowerFilter = teamFilter.toLowerCase();
        filtered = filtered.filter(
          session =>
            session.team.number.toLowerCase().includes(lowerFilter) ||
            session.team.name.toLowerCase().includes(lowerFilter) ||
            session.team.affiliation.toLowerCase().includes(lowerFilter)
        );
      }
  
      if (statusFilter) {
        filtered = filtered.filter(session => session.status === statusFilter);
      }
  
      return filtered.sort((a, b) => {
        if (a.room.name !== b.room.name) {
          return a.room.name.localeCompare(b.room.name);
        }
        return a.number - b.number;
      });
    }, [sessions, teamFilter, statusFilter]);

    return {
      teamFilter,
      setTeamFilter,
      statusFilter,
      setStatusFilter,
      sortedAndFilteredSessions
    };
};
