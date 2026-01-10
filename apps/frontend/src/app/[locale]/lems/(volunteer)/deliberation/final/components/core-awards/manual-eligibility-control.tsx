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
  useTheme,
  Chip
} from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import { useFinalDeliberation } from '../../final-deliberation-context';

export const ManualEligibilityControl: React.FC = () => {
  const theme = useTheme();
  const t = useTranslations('pages.deliberations.final.core-awards');
  const { teams, categoryPicklists, deliberation, updateManualEligibility } =
    useFinalDeliberation();

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Get teams in any picklist
  const picketListTeamIds = useMemo(
    () => new Set(Object.values(categoryPicklists).flat()),
    [categoryPicklists]
  );

  // Get available teams (not in picklist, arrived, not disqualified)
  const availableTeams = useMemo(() => {
    return teams.filter(
      team =>
        !picketListTeamIds.has(team.id) &&
        !deliberation.coreAwardsManualEligibility.includes(team.id) &&
        team.arrived &&
        !team.disqualified
    );
  }, [teams, picketListTeamIds, deliberation.coreAwardsManualEligibility]);
  // Get manually added team objects
  const manualTeams = useMemo(() => {
    return teams.filter(team => deliberation.coreAwardsManualEligibility.includes(team.id));
  }, [teams, deliberation.coreAwardsManualEligibility]);
  const handleAddTeam = useCallback(async () => {
    if (!selectedTeamId) return;

    setIsAdding(true);
    try {
      const updatedManualEligibility = [
        ...deliberation.coreAwardsManualEligibility,
        selectedTeamId
      ];
      await updateManualEligibility('core-awards', updatedManualEligibility);
      setSelectedTeamId(null);
    } finally {
      setIsAdding(false);
    }
  }, [selectedTeamId, deliberation.coreAwardsManualEligibility, updateManualEligibility]);

  const handleRemoveTeam = useCallback(
    async (teamId: string) => {
      setIsAdding(true);
      try {
        const updatedManualEligibility = deliberation.coreAwardsManualEligibility.filter(
          id => id !== teamId
        );
        await updateManualEligibility('core-awards', updatedManualEligibility);
      } finally {
        setIsAdding(false);
      }
    },
    [deliberation.coreAwardsManualEligibility, updateManualEligibility]
  );

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
          {t('manual-eligibility-title')}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontSize: '0.75rem'
          }}
        >
          {t('manual-eligibility-description')}
        </Typography>
      </Box>

      <Stack spacing={1}>
        {/* Add Team Section */}
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
            componentsProps={{
              paper: {
                sx: {
                  '& .MuiAutocomplete-option': {
                    fontSize: '0.875rem !important'
                  }
                }
              }
            }}
            noOptionsText="No available teams"
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={handleAddTeam}
            disabled={!selectedTeamId || isAdding || availableTeams.length === 0}
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              whiteSpace: 'nowrap',
              mt: 0.5
            }}
          >
            {t('add-team')}
          </Button>
        </Stack>

        {/* Manually Added Teams */}
        {manualTeams.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {manualTeams.map(team => (
              <Chip
                key={team.id}
                label={`${team.number}`}
                onDelete={() => handleRemoveTeam(team.id)}
                deleteIcon={<Close />}
                size="small"
                variant="outlined"
                icon={undefined}
                sx={{
                  fontWeight: 600,
                  borderColor: alpha(theme.palette.warning.main, 0.6),
                  color: theme.palette.warning.dark,
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  '& .MuiChip-deleteIcon': {
                    color: theme.palette.warning.dark,
                    '&:hover': {
                      color: theme.palette.error.main
                    }
                  }
                }}
                title={team.name}
              />
            ))}
          </Box>
        )}
      </Stack>
    </Box>
  );
};
