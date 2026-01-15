'use client';

import { useState } from 'react';
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
import { CompareArrows } from '@mui/icons-material';
import { JudgingCategory } from '@lems/types/judging';
import { TeamComparisonDialog } from './team-comparison-dialog';

interface CompareTeamsPickerProps {
  teams: { id: string; number: string; name: string; slug: string }[];
  category?: JudgingCategory;
  onCompare?: (team1Id: string, team2Id: string) => void;
}

export function CompareTeamsPicker({ teams, category, onCompare }: CompareTeamsPickerProps) {
  const t = useTranslations('pages.deliberations.compare');
  const router = useRouter();
  const [selectedTeam1, setSelectedTeam1] = useState<string | null>(null);
  const [selectedTeam2, setSelectedTeam2] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const teamOptions = teams.map(t => ({
    label: `${t.number} - ${t.name}`,
    value: t.id,
    slug: t.slug
  }));

  const handleCompare = () => {
    if (selectedTeam1 && selectedTeam2) {
      setDialogOpen(true);
      onCompare?.(selectedTeam1, selectedTeam2);
    }
  };

  const handleNavigateToComparePage = () => {
    const params = new URLSearchParams();

    if (category) {
      params.set('category', category);
    }

    const validTeamSlugs = selectedTeamSlugs.filter(slug => slug && slug.trim() !== '');
    if (validTeamSlugs.length > 0) {
      params.set('teams', validTeamSlugs.join(','));
    }

    const queryString = params.toString();
    router.push(`/lems/deliberation/compare${queryString ? `?${queryString}` : ''}`);
  };

  const selectedTeamSlugs: [string, string] = [
    teamOptions.find(t => t.value === selectedTeam1)?.slug || '',
    teamOptions.find(t => t.value === selectedTeam2)?.slug || ''
  ];

  return (
    <Stack
      component={Paper}
      p={2.5}
      justifyContent="space-between"
      sx={{
        flex: 1,
        border: theme => `1px solid ${theme.palette.divider}`,
        borderRadius: 1.5
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
        <IconButton size="small" onClick={handleNavigateToComparePage} sx={{ p: 0.5 }}>
          <CompareArrows />
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
        color="primary"
        fullWidth
        disabled={!selectedTeam1 || !selectedTeam2 || selectedTeam1 === selectedTeam2}
        onClick={handleCompare}
        sx={{
          fontWeight: 600,
          textTransform: 'none',
          py: 1
        }}
      >
        {t('compare')}
      </Button>

      {selectedTeam1 && selectedTeam2 && selectedTeamSlugs[0] && selectedTeamSlugs[1] && (
        <TeamComparisonDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          teamSlugs={selectedTeamSlugs}
          category={category}
        />
      )}
    </Stack>
  );
}
