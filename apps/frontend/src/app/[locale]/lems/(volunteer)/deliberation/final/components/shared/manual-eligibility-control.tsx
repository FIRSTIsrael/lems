'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Button,
  Autocomplete,
  TextField,
  Stack,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useFinalDeliberation } from '../../final-deliberation-context';

interface ManualEligibilityControlProps {
  stage?: 'core-awards' | 'optional-awards';
}

export const ManualEligibilityControl: React.FC<ManualEligibilityControlProps> = ({
  stage = 'core-awards'
}) => {
  const theme = useTheme();
  const t = useTranslations(`pages.deliberations.final.manual-eligibility-control`);
  const { division, teams, deliberation, updateManualEligibility } = useFinalDeliberation();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Get the appropriate manual eligibility list based on stage
  const manualEligibilityKey =
    stage === 'core-awards' ? 'coreAwardsManualEligibility' : 'optionalAwardsManualEligibility';
  const currentManualEligibility = useMemo(
    () => deliberation[manualEligibilityKey] || [],
    [deliberation, manualEligibilityKey]
  );

  const awardedTeamIds = useMemo(() => {
    const ids = new Set<string>();
    division.judging.awards.forEach(award => {
      if (award.winner && 'team' in award.winner) {
        ids.add(award.winner.team.id);
      }
    });
    return ids;
  }, [division.judging.awards]);

  // Get available teams (not in current selections, arrived, not disqualified)
  const availableTeams = useMemo(() => {
    return teams.filter(
      team =>
        !team.eligibility[stage] &&
        !awardedTeamIds.has(team.id) &&
        team.arrived &&
        !team.disqualified
    );
  }, [teams, awardedTeamIds, stage]);

  const handleAddTeam = useCallback(async () => {
    if (!selectedTeamId) return;

    setIsAdding(true);
    try {
      const updatedManualEligibility = [...currentManualEligibility, selectedTeamId];
      await updateManualEligibility(stage, updatedManualEligibility);
      setSelectedTeamId(null);
    } finally {
      setIsAdding(false);
    }
  }, [selectedTeamId, currentManualEligibility, updateManualEligibility, stage]);

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: alpha(theme.palette.warning.main, 0.05),
        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
        borderRadius: 1.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5
      }}
    >
      <Box>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 0.25
          }}
        >
          {t('title')}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontSize: '0.75rem'
          }}
        >
          {t('description')}
        </Typography>
      </Box>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
        <Autocomplete
          options={availableTeams}
          getOptionLabel={option => `${option.number} - ${option.name}`}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={availableTeams.find(t => t.id === selectedTeamId) || null}
          onChange={(_, newValue) => setSelectedTeamId(newValue?.id || null)}
          disabled={availableTeams.length === 0 || isAdding}
          sx={{ flex: 1, minWidth: 0 }}
          renderInput={params => (
            <TextField
              {...params}
              placeholder={t('select-team')}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.875rem'
                }
              }}
            />
          )}
          noOptionsText={t('no-data-available')}
        />
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={handleAddTeam}
          disabled={
            !selectedTeamId ||
            isAdding ||
            availableTeams.length === 0 ||
            deliberation.status !== 'in-progress'
          }
          sx={{
            fontWeight: 600,
            textTransform: 'none',
            whiteSpace: 'nowrap',
            mt: 0.5,
            height: '100%'
          }}
        >
          {t('add-team')}
        </Button>
      </Stack>
    </Box>
  );
};
