'use client';

import { useState, useCallback } from 'react';
import { mutate } from 'swr';
import { apiFetch } from '@lems/shared';
import { TeamWithDivision } from '@lems/types/api/admin';

export const useChangeTeamDivision = (eventId: string) => {
  const [selectedTeam, setSelectedTeam] = useState<TeamWithDivision | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleCloseDivisionMenu = useCallback(() => {
    setSelectedTeam(null);
    setAnchorEl(null);
  }, []);

  const handleOpenDivisionMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>, team: TeamWithDivision) => {
      event.stopPropagation();
      setSelectedTeam(team);
      setAnchorEl(event.currentTarget);
    },
    []
  );

  const handleChangeDivision = useCallback(
    async (newDivisionId: string) => {
      if (!selectedTeam || newDivisionId === selectedTeam.division.id) return;

      try {
        const response = await apiFetch(
          `/admin/events/${eventId}/teams/${selectedTeam.id}/division`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ divisionId: newDivisionId })
          }
        );

        if (!response.ok) {
          throw new Error('Failed to change team division');
        }

        handleCloseDivisionMenu();
        mutate(`/admin/events/${eventId}/teams`);
      } catch (error) {
        console.error('Failed to change team division:', error);
      }
    },
    [selectedTeam, eventId, handleCloseDivisionMenu]
  );

  return {
    selectedTeam,
    anchorEl,
    handleOpenDivisionMenu,
    handleCloseDivisionMenu,
    handleChangeDivision
  };
};
