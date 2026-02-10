'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { useTheme, Tooltip, Box, alpha, IconButton, Button } from '@mui/material';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { Stars, Add, CompareArrows } from '@mui/icons-material';
import { purple, blue, green, red } from '@mui/material/colors';
import { JudgingCategory } from '@lems/database';
import { useFinalDeliberation } from '../../final-deliberation-context';
import type { EnrichedTeam } from '../../types';
import { TeamComparisonDialog } from '../../../components/team-comparison-dialog';

const FIELD_COLUMN_WIDTH = 130;

export function CoreAwardsDataGrid() {
  const theme = useTheme();
  const t = useTranslations('pages.deliberations.final.core-awards');
  const tTable = useTranslations('pages.deliberations.category.table');
  const { getCategory } = useJudgingCategoryTranslations();
  const { teams, eligibleTeams, categoryPicklists, deliberation, awards, updateAward } =
    useFinalDeliberation();

  const [selectedTeams, setSelectedTeams] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set()
  });
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);

  const getSelectedIds = (selection: GridRowSelectionModel): string[] => {
    return Array.from(selection.ids as Set<string>);
  };

  const handleRowSelectionChange = (newSelection: GridRowSelectionModel) => {
    const ids = getSelectedIds(newSelection);
    if (ids.length <= 2) {
      setSelectedTeams(newSelection);
    }
  };

  const handleCompare = () => {
    if (selectedTeams.ids.size === 2) {
      setCompareDialogOpen(true);
    }
  };

  const selectedTeamSlugs = useMemo(() => {
    const selectedIds = getSelectedIds(selectedTeams);
    return teams.filter(t => selectedIds.includes(t.id)).map(t => t.slug) as [string, string];
  }, [selectedTeams, teams]);

  // Get teams from picklists and manually added teams
  const picketListTeamIds = useMemo(
    () => new Set(Object.values(categoryPicklists).flat()),
    [categoryPicklists]
  );

  // Combine picklist and manual teams, filtering to eligible
  const coreAwardsTeamIds = useMemo<Set<string>>(
    () => new Set(eligibleTeams['core-awards']),
    [eligibleTeams]
  );

  // Get teams that have been selected for any core award
  const selectedTeamIds = useMemo<Set<string>>(
    () =>
      new Set([
        ...(awards['robot-design'] || []),
        ...(awards['innovation-project'] || []),
        ...(awards['core-values'] || [])
      ]),
    [awards]
  );

  const handleAddToAward = useCallback(
    async (teamId: string, category: JudgingCategory) => {
      const currentAwards = awards[category] || [];
      if (!currentAwards.includes(teamId)) {
        const updated = [...currentAwards, teamId];
        await updateAward(category, updated);
      }
    },
    [awards, updateAward]
  );

  const filteredTeams = useMemo(() => {
    return teams
      .filter(team => coreAwardsTeamIds.has(team.id) || selectedTeamIds.has(team.id))
      .sort((a, b) => {
        // Picklist teams first (sorted by rank in their categories)
        const aInPicklist = picketListTeamIds.has(a.id);
        const bInPicklist = picketListTeamIds.has(b.id);

        if (aInPicklist && !bInPicklist) return -1;
        if (!aInPicklist && bInPicklist) return 1;

        // Both in picklist or both manual: sort by average rank across categories
        const getAvgRank = (team: EnrichedTeam) => {
          const ranks = [
            team.ranks['robot-design'] || Infinity,
            team.ranks['innovation-project'] || Infinity,
            team.ranks['core-values'] || Infinity
          ];
          return ranks.reduce((sum, r) => sum + r, 0) / ranks.length;
        };

        return getAvgRank(a) - getAvgRank(b);
      });
  }, [teams, coreAwardsTeamIds, selectedTeamIds, picketListTeamIds]);

  const columns: GridColDef<EnrichedTeam>[] = useMemo(
    () => [
      {
        field: 'room',
        headerName: t('table-room'),
        width: 80,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => params.row.room?.name || '-'
      },
      {
        field: 'teamDisplay',
        headerName: t('table-team'),
        width: 110,
        filterable: false,
        renderCell: params => {
          const team = params.row as EnrichedTeam;
          const isManual = deliberation.coreAwardsManualEligibility.includes(team.id);

          return (
            <Tooltip title={team.name}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
                <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {team.number}
                </Box>
                {isManual && (
                  <Tooltip title={t('manual-team-indicator')}>
                    <Stars fontSize="small" sx={{ color: purple[400] }} />
                  </Tooltip>
                )}
              </Box>
            </Tooltip>
          );
        }
      },
      {
        field: 'robotDesignRank',
        headerName: `${getCategory('robot-design')} ${t('table-rank')}`,
        width: FIELD_COLUMN_WIDTH,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => {
          const rank = (params.row as EnrichedTeam).ranks['robot-design'];
          return rank ? `#${rank}` : '-';
        }
      },
      {
        field: 'robotDesignScore',
        headerName: getCategory('robot-design'),
        width: FIELD_COLUMN_WIDTH,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => params.row.scores['robot-design'].toFixed(1)
      },
      {
        field: 'innovationProjectRank',
        headerName: `${getCategory('innovation-project')} ${t('table-rank')}`,
        width: FIELD_COLUMN_WIDTH,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => {
          const rank = (params.row as EnrichedTeam).ranks['innovation-project'];
          return rank ? `#${rank}` : '-';
        }
      },
      {
        field: 'innovationProjectScore',
        headerName: getCategory('innovation-project'),
        width: FIELD_COLUMN_WIDTH,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => params.row.scores['innovation-project'].toFixed(1)
      },
      {
        field: 'coreValuesRank',
        headerName: `${getCategory('core-values')} ${t('table-rank')}`,
        width: FIELD_COLUMN_WIDTH,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => {
          const rank = (params.row as EnrichedTeam).ranks['core-values'];
          return rank ? `#${rank}` : '-';
        }
      },
      {
        field: 'coreValuesScore',
        headerName: getCategory('core-values'),
        width: FIELD_COLUMN_WIDTH,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => params.row.scores['core-values'].toFixed(1)
      },
      {
        field: 'actions',
        headerName: `${t('table-actions')}`,
        width: 200,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => {
          const team = params.row as EnrichedTeam;
          const isManualTeam = deliberation.coreAwardsManualEligibility.includes(team.id);
          const categories: JudgingCategory[] = [
            'robot-design',
            'innovation-project',
            'core-values'
          ];

          const categoryColors: Record<JudgingCategory, string> = {
            'robot-design': green[300],
            'innovation-project': blue[300],
            'core-values': red[300]
          };

          const categoryDarkColors: Record<JudgingCategory, string> = {
            'robot-design': green[400],
            'innovation-project': blue[400],
            'core-values': red[400]
          };

          return (
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', width: '100%' }}>
              {categories.map(category => {
                const isInPicklist = categoryPicklists[category].includes(team.id);
                const canAdd = isInPicklist || isManualTeam;
                const isAlreadyAdded = Object.values(awards).flat().includes(team.id);

                return (
                  <Tooltip
                    key={category}
                    title={
                      !canAdd
                        ? t('team-not-eligible-for-category', { category: getCategory(category) })
                        : isAlreadyAdded
                          ? t('team-already-added-to-category')
                          : t('add-team-to-category', { category: getCategory(category) })
                    }
                  >
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => handleAddToAward(team.id, category)}
                        disabled={
                          !canAdd || isAlreadyAdded || deliberation.status !== 'in-progress'
                        }
                        sx={{
                          bgcolor: categoryColors[category],
                          color: 'white',
                          width: 28,
                          height: 28,
                          opacity: isAlreadyAdded ? 0.5 : 1,
                          '&:hover:not(:disabled)': {
                            bgcolor: categoryDarkColors[category],
                            opacity: isAlreadyAdded ? 0.5 : 1
                          },
                          '&:disabled': {
                            bgcolor: theme.palette.action.disabledBackground,
                            color: theme.palette.action.disabled,
                            opacity: 1
                          }
                        }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                );
              })}
            </Box>
          );
        }
      }
    ],
    [
      t,
      theme,
      getCategory,
      deliberation.coreAwardsManualEligibility,
      deliberation.status,
      categoryPicklists,
      awards,
      handleAddToAward
    ]
  );

  return (
    <>
      {selectedTeams.ids.size === 2 && (
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
        columns={columns}
        getRowId={row => row.id}
        density="compact"
        checkboxSelection
        rowSelectionModel={selectedTeams}
        onRowSelectionModelChange={handleRowSelectionChange}
        isRowSelectable={params => {
          const selectedIds = getSelectedIds(selectedTeams);
          return selectedIds.length < 2 || selectedIds.includes(params.id as string);
        }}
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

      {selectedTeams.ids.size === 2 && (
        <TeamComparisonDialog
          open={compareDialogOpen}
          onClose={() => setCompareDialogOpen(false)}
          teamSlugs={selectedTeamSlugs}
        />
      )}
    </>
  );
}
