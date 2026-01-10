'use client';

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTheme, Tooltip, Box, alpha, IconButton } from '@mui/material';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { Stars, Add } from '@mui/icons-material';
import { purple, blue, green, red } from '@mui/material/colors';
import { JudgingCategory } from '@lems/database';
import { useFinalDeliberation } from '../../final-deliberation-context';
import type { EnrichedTeam } from '../../types';

const FIELD_COLUMN_WIDTH = 130;

export function CoreAwardsDataGrid() {
  const theme = useTheme();
  const t = useTranslations('pages.deliberations.final.core-awards');
  const { getCategory } = useJudgingCategoryTranslations();
  const { teams, eligibleTeams, categoryPicklists, deliberation, awards, updateAward } =
    useFinalDeliberation();

  // Get teams from picklists and manually added teams
  const picketListTeamIds = useMemo(
    () => new Set(Object.values(categoryPicklists).flat()),
    [categoryPicklists]
  );

  // Combine picklist and manual teams, filtering to eligible
  const coreAwardsTeamIds = useMemo(() => new Set(eligibleTeams['core-awards']), [eligibleTeams]);

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
      .filter(team => coreAwardsTeamIds.has(team.id))
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
  }, [teams, coreAwardsTeamIds, picketListTeamIds]);

  const columns: GridColDef<EnrichedTeam>[] = useMemo(
    () => [
      {
        field: 'teamDisplay',
        headerName: t('table-team'),
        width: 110,
        sortable: false,
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
        field: 'room',
        headerName: t('table-room'),
        width: 80,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => params.row.room?.name || '-'
      },
      {
        field: 'robotDesignRank',
        headerName: `${getCategory('robot-design')} ${t('table-rank')}`,
        width: FIELD_COLUMN_WIDTH,
        sortable: false,
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
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => params.row.scores['robot-design'].toFixed(1)
      },
      {
        field: 'innovationProjectRank',
        headerName: `${getCategory('innovation-project')} ${t('table-rank')}`,
        width: FIELD_COLUMN_WIDTH,
        sortable: false,
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
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: params => params.row.scores['innovation-project'].toFixed(1)
      },
      {
        field: 'coreValuesRank',
        headerName: `${getCategory('core-values')} ${t('table-rank')}`,
        width: FIELD_COLUMN_WIDTH,
        sortable: false,
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
        sortable: false,
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
            'robot-design': green[400],
            'innovation-project': blue[400],
            'core-values': red[400]
          };

          return (
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', width: '100%' }}>
              {categories.map(category => {
                const isInPicklist = categoryPicklists[category].includes(team.id);
                const canAdd = isInPicklist || isManualTeam;
                const isAlreadyAdded = (awards[category] || []).includes(team.id);

                return (
                  <Tooltip
                    key={category}
                    title={
                      !canAdd
                        ? `Not in ${getCategory(category)} picklist`
                        : isAlreadyAdded
                          ? `Already added to ${getCategory(category)}`
                          : `Add to ${getCategory(category)}`
                    }
                  >
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => handleAddToAward(team.id, category)}
                        disabled={!canAdd || isAlreadyAdded}
                        sx={{
                          p: 0.5,
                          color: isAlreadyAdded
                            ? categoryColors[category]
                            : categoryColors[category],
                          opacity: isAlreadyAdded ? 1 : 0.6,
                          '&:hover:not(:disabled)': {
                            opacity: 1
                          },
                          '&:disabled': {
                            opacity: 0.3
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
      getCategory,
      deliberation.coreAwardsManualEligibility,
      categoryPicklists,
      awards,
      handleAddToAward
    ]
  );

  return (
    <DataGrid
      rows={filteredTeams}
      columns={columns}
      getRowId={row => row.id}
      density="compact"
      disableRowSelectionOnClick
      hideFooterSelectedRowCount
      hideFooter
      sx={{
        width: '100%',
        height: '100%',
        '& .MuiDataGrid-row': {
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.05)
          }
        }
      }}
    />
  );
}
