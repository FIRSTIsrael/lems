import { useState } from 'react';

export function useDragAndDrop() {
  const [draggedTeamId, setDraggedTeamId] = useState<string | null>(null);

  const handleDragStart = (teamId: string) => {
    setDraggedTeamId(teamId);
  };

  const handleDragEnd = () => {
    setDraggedTeamId(null);
  };

  return {
    draggedTeamId,
    handleDragStart,
    handleDragEnd
  };
}
