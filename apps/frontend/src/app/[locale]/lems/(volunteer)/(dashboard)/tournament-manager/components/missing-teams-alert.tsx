import { Alert, AlertTitle, Chip, Stack } from '@mui/material';
import type { TournamentManagerData } from '../graphql';

interface MissingTeamsAlertProps {
  missingTeams: TournamentManagerData['division']['teams'];
  currentRoundTitle: string;
  selectedSlotTeamId?: string;
  onTeamClick: (team: TournamentManagerData['division']['teams'][0]) => void;
  t: (key: string) => string;
}

export function MissingTeamsAlert({
  missingTeams,
  currentRoundTitle,
  selectedSlotTeamId,
  onTeamClick,
  t
}: MissingTeamsAlertProps) {
  if (missingTeams.length === 0) return null;

  return (
    <Alert severity="warning" sx={{ flex: 1, minWidth: 300, order: 1 }}>
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
            sx={{
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          />
        ))}
      </Stack>
    </Alert>
  );
}
