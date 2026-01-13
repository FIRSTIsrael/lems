'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  useTheme,
  Tooltip,
  Box,
  alpha,
  IconButton,
  Popover,
  Stack,
  Typography,
  Chip,
  Button
} from '@mui/material';
import { Stars, Add, CompareArrows } from '@mui/icons-material';
import { purple } from '@mui/material/colors';
import { OPTIONAL_AWARDS, Award } from '@lems/shared';
import { useAwardTranslations } from '@lems/localization';
import { useFinalDeliberation } from '../../final-deliberation-context';
import type { EnrichedTeam } from '../../types';
import { TeamComparisonDialog } from '../../../components/team-comparison-dialog';

const FIELD_COLUMN_WIDTH = 60;

export function OptionalAwardsDataGrid() {
  const theme = useTheme();
  const t = useTranslations('pages.deliberations.final.optional-awards');
  const tTable = useTranslations('pages.deliberations.category.table');
  const { teams, eligibleTeams, deliberation, awards, updateAward, awardCounts } =
    useFinalDeliberation();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [selectedTeamForAward, setSelectedTeamForAward] = useState<string | null>(null);
  const { getName } = useAwardTranslations();

  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);

  const handleRowSelectionChange = (newSelection: string[]) => {
    if (newSelection.length <= 2) {
      setSelectedTeams(newSelection);
    }
  };

  const handleCompare = () => {
    if (selectedTeams.length === 2) {
      setCompareDialogOpen(true);
    }
  };

  const selectedTeamSlugs = useMemo(() => {
    return teams.filter(t => selectedTeams.includes(t.id)).map(t => t.slug) as [string, string];
  }, [selectedTeams, teams]);

  // Get teams eligible for optional awards
  const optionalAwardsEligibleTeamIds = useMemo<Set<string>>(
    () => new Set(eligibleTeams['optional-awards']),
    [eligibleTeams]
  );

  // Get teams that have been selected for any optional award
  const selectedTeamIds = useMemo<Set<string>>(() => {
    const set = new Set<string>();
    OPTIONAL_AWARDS.filter(award => award !== 'excellence-in-engineering').forEach(award => {
      const awardArray = awards[award] as string[];
      if (!awardArray) return;
      awardArray.forEach(teamId => set.add(teamId));
    });
    return set;
  }, [awards]);

  const handleOpenPopover = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, teamId: string) => {
      setAnchorEl(event.currentTarget);
      setSelectedTeamForAward(teamId);
    },
    []
  );

  const handleClosePopover = useCallback(() => {
    setAnchorEl(null);
    setSelectedTeamForAward(null);
  }, []);

  const handleAddToAward = useCallback(
    async (award: Award) => {
      if (!selectedTeamForAward) return;

      const currentAwards = (awards[award] ?? []) as string[];
      if (!currentAwards.includes(selectedTeamForAward)) {
        const updated = [...currentAwards, selectedTeamForAward];
        await updateAward(award, updated);
      }
      handleClosePopover();
    },
    [awards, updateAward, selectedTeamForAward, handleClosePopover]
  );

  const filteredTeams = useMemo(() => {
    return teams
      .filter(team => optionalAwardsEligibleTeamIds.has(team.id) || selectedTeamIds.has(team.id))
      .sort((a, b) => {
        // Sort by core-values score descending
        return b.scores['core-values'] - a.scores['core-values'];
      });
  }, [teams, optionalAwardsEligibleTeamIds, selectedTeamIds]);

  const open = Boolean(anchorEl);
  const popoverId = open ? 'award-selection-popover' : undefined;

  // Get all available awards that can be assigned
  const availableAwards: Award[] = useMemo(
    () =>
      OPTIONAL_AWARDS.filter(
        award => award !== 'excellence-in-engineering' && (awardCounts[award] ?? 0) > 0
      ) as Award[],
    [awardCounts]
  );

  return (
    <>
      {selectedTeams.length === 2 && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CompareArrows />}
            onClick={handleCompare}
            sx={{ textTransform: 'none' }}
          >
            {tTable('compare-teams')}
          </Button>
        </Box>
      )}

      <DataGrid
        rows={filteredTeams}
        getRowId={row => row.id}
        density="compact"
        checkboxSelection
        rowSelectionModel={selectedTeams}
        onRowSelectionModelChange={newSelection =>
          handleRowSelectionChange(newSelection as string[])
        }
        isRowSelectable={params =>
          selectedTeams.length < 2 || selectedTeams.includes(params.id as string)
        }
        disableRowSelectionOnClick
        hideFooterSelectedRowCount
        hideFooter
        sx={{
          width: '100%',
          height: '100%',
          '& .MuiDataGrid-row': {
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.05)
            },
            '&.selected-award-row': {
              backgroundColor: alpha(purple[400], 0.1),
              '&:hover': {
                backgroundColor: alpha(purple[400], 0.15)
              }
            }
          }
        }}
        getRowClassName={params => {
          const team = params.row as EnrichedTeam;
          return selectedTeamIds.has(team.id) ? 'selected-award-row' : '';
        }}
      />

      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >
        <Box sx={{ p: 1.5, minWidth: 250 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, fontSize: '0.875rem' }}>
            {t('select-award')}
          </Typography>
          <Stack spacing={0.5}>
            {availableAwards.map(award => {
              const awardTeams = awards[award] as string[];
              const maxCount = awardCounts[award] ?? 0;
              const isFull = awardTeams?.length >= maxCount;
              const isTeamAlreadyAdded = awardTeams?.includes(selectedTeamForAward || '');

              return (
                <Box key={award}>
                  <Box
                    onClick={() => !isFull && !isTeamAlreadyAdded && handleAddToAward(award)}
                    sx={{
                      p: '0.5rem 0.75rem',
                      borderRadius: 0.75,
                      cursor: isFull || isTeamAlreadyAdded ? 'not-allowed' : 'pointer',
                      opacity: isFull || isTeamAlreadyAdded ? 0.5 : 1,
                      transition: 'all 0.2s ease',
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                      '&:hover': {
                        bgcolor:
                          isFull || isTeamAlreadyAdded
                            ? undefined
                            : alpha(theme.palette.primary.main, 0.1),
                        borderColor:
                          isFull || isTeamAlreadyAdded ? undefined : theme.palette.primary.main
                      }
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      {t(`award.${award}`)}
                    </Typography>
                  </Box>
                  {isTeamAlreadyAdded && (
                    <Typography
                      variant="caption"
                      sx={{ color: 'success.main', mt: 0.25, display: 'block' }}
                    >
                      {t('team-already-added')}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Popover>

      {selectedTeams.length === 2 && (
        <TeamComparisonDialog
          open={compareDialogOpen}
          onClose={() => setCompareDialogOpen(false)}
          teamSlugs={selectedTeamSlugs}
        />
      )}
    </>
  );
}
