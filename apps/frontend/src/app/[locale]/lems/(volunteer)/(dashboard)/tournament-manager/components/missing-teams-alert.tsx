import { Alert, AlertTitle, Chip, Stack } from '@mui/material';
import type { TournamentManagerData } from '../graphql';

interface MissingTeamsAlertProps {
  missingTeams: TournamentManagerData['division']['teams'];
  currentRoundTitle: string;
  selectedSlotTeamId?: string;
  draggedTeamId: string | null;
  onTeamClick: (team: TournamentManagerData['division']['teams'][0]) => void;
  onDragStart: (teamId: string) => void;
  onDragEnd: () => void;
  onClose: () => void;
  t: (key: string) => string;
}

export function MissingTeamsAlert({
  missingTeams,
  currentRoundTitle,
  selectedSlotTeamId,
  draggedTeamId,
  onTeamClick,
  onDragStart,
  onDragEnd,
  onClose,
  t
}: MissingTeamsAlertProps) {
  if (missingTeams.length === 0) return null;

  return (
    <Alert severity="warning" sx={{ flex: 1, minWidth: 300, order: 1 }} onClose={onClose}>
      <AlertTitle sx={{ mb: 0.5 }}>
        {currentRoundTitle
          ? `${t('missing-teams-from-round')}: ${currentRoundTitle}`
          : t('missing-teams-title')}
      </AlertTitle>
      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
        {missingTeams.map(team => (
          <Chip
            key={team.id}
            label={`#${team.number} ${team.name}`}
            size="small"
            color={selectedSlotTeamId === team.id ? 'primary' : 'default'}
            onClick={() => onTeamClick(team)}
            draggable
            onDragStart={() => onDragStart(team.id)}
            onDragEnd={onDragEnd}
            sx={{
              cursor: draggedTeamId === team.id ? 'grabbing' : 'grab',
              opacity: draggedTeamId === team.id ? 0.5 : 1,
              '&:hover': { bgcolor: 'action.hover' }
            }}
          />
        ))}
      </Stack>
    </Alert>
  );
}
