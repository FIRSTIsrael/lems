'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Autocomplete,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  IconButton
} from '@mui/material';
import { OpenInNew } from '@mui/icons-material';
import { useEvent } from '../../components/event-context';
import { useCategoryDeliberation } from '../deliberation-context';
import { CompareModal } from './compare-modal';
import type { EnrichedTeam } from '../types';

interface CompareTeamsPickerProps {
  teams: EnrichedTeam[];
}

export function CompareTeamsPicker({ teams }: CompareTeamsPickerProps) {
  const t = useTranslations('pages.deliberations.category.compare-teams-picker');
  const router = useRouter();
  const { currentDivision } = useEvent();
  const { division } = useCategoryDeliberation();

  const [selectedTeam1, setSelectedTeam1] = useState<string | null>(null);
  const [selectedTeam2, setSelectedTeam2] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const teamOptions = teams.map(t => ({
    label: `${t.number} - ${t.name}`,
    value: t.id
  }));

  // Memoized calculation of awards and allTeams from division data
  const { awards, allTeamsData } = useMemo(() => {
    return {
      awards: division?.awards ?? [],
      allTeamsData: division?.allTeams ?? []
    };
  }, [division]);

  // Get the selected team objects from the teams array
  const team1 = teams.find(t => t.id === selectedTeam1);
  const team2 = teams.find(t => t.id === selectedTeam2);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleOpenComparePageInNewTab = () => {
    const teamSlugs = [team1?.slug, team2?.slug].filter(Boolean).join(',');
    if (teamSlugs) {
      router.push(`/lems/deliberation/compare?teams=${teamSlugs}`);
    }
  };

  return (
    <Stack
      component={Paper}
      p={2.5}
      width="25%"
      justifyContent="space-between"
      sx={{
        border: theme => `1px solid ${theme.palette.divider}`
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            fontSize: '0.95rem',
            color: 'text.primary',
            letterSpacing: '0.5px'
          }}
        >
          {t('title')}
        </Typography>
        <IconButton
          size="small"
          onClick={handleOpenComparePageInNewTab}
          disabled={!team1 || !team2 || team1.id === team2.id}
          sx={{
            p: 0.5
          }}
        >
          <OpenInNew fontSize="small" />
        </IconButton>
      </Stack>

      <Autocomplete
        options={teamOptions}
        value={teamOptions.find(o => o.value === selectedTeam1) || null}
        onChange={(_, value) => setSelectedTeam1(value?.value || null)}
        renderInput={params => (
          <TextField
            {...params}
            label={t('team-1')}
            size="small"
            variant="outlined"
            slotProps={{
              input: {
                ...params.InputProps,
                sx: {
                  fontSize: '0.875rem'
                }
              }
            }}
          />
        )}
        size="small"
        fullWidth
        noOptionsText={t('no-data-available')}
      />
      <Autocomplete
        options={teamOptions}
        value={teamOptions.find(o => o.value === selectedTeam2) || null}
        onChange={(_, value) => setSelectedTeam2(value?.value || null)}
        renderInput={params => (
          <TextField
            {...params}
            label={t('team-2')}
            size="small"
            variant="outlined"
            slotProps={{
              input: {
                ...params.InputProps,
                sx: {
                  fontSize: '0.875rem'
                }
              }
            }}
          />
        )}
        size="small"
        fullWidth
        noOptionsText={t('no-data-available')}
      />

      <Button
        variant="contained"
        fullWidth
        disabled={!selectedTeam1 || !selectedTeam2 || selectedTeam1 === selectedTeam2}
        size="small"
        onClick={handleOpenModal}
        sx={{
          mt: 1,
          fontWeight: 600,
          fontSize: '0.875rem',
          textTransform: 'none',
          py: 1.25,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover:not(:disabled)': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        {t('compare')}
      </Button>

      <CompareModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        team1={team1}
        team2={team2}
        divisionId={currentDivision.id}
        awards={awards}
        allTeams={allTeamsData as any}
      />
    </Stack>
  );
}
