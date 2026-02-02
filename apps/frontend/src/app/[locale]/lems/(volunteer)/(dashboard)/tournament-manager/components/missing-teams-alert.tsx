import { Alert, AlertTitle, Chip, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { TournamentManagerData } from '../graphql';

interface MissingTeamsAlertProps {
  missingTeams: TournamentManagerData['division']['teams'];
  currentRoundTitle: string;
  selectedSlotTeamId?: string;
  onTeamClick: (team: TournamentManagerData['division']['teams'][0]) => void;
}

export function MissingTeamsAlert({
  missingTeams,
  currentRoundTitle,
  selectedSlotTeamId,
  onTeamClick
}: MissingTeamsAlertProps) {
  const t = useTranslations('pages.tournament-manager');

  if (missingTeams.length === 0) return null;

  return (
    <Alert severity="warning" sx={{ flex: 1, minWidth: 300, order: 1 }}>
      <AlertTitle sx={{ mb: 0.5 }}>
        {currentRoundTitle
          ? `${t('slots.missing-teams.from-round')}: ${currentRoundTitle}`
          : t('slots.missing-teams.title')}
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
