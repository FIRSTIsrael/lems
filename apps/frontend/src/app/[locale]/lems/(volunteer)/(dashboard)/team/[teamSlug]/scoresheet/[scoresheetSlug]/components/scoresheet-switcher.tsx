'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Box, FormControl, MenuItem, Select, useTheme, alpha } from '@mui/material';
import { Check as CheckIcon, Warning as WarningIcon } from '@mui/icons-material';
import { useQuery } from '@apollo/client/react';
import { useMatchTranslations } from '@lems/localization';
import { useEvent } from '../../../../../../components/event-context';
import { useTeam } from '../../../components/team-context';
import { GET_TEAM_SCORESHEETS_QUERY } from '../graphql/query';

export const ScoresheetSwitcher: React.FC = () => {
  const t = useTranslations('pages.scoresheet');
  const { getStage } = useMatchTranslations();
  const theme = useTheme();

  const team = useTeam();
  const { currentDivision } = useEvent();
  const { scoresheetSlug, teamSlug } = useParams();
  const router = useRouter();

  const { data, loading } = useQuery(GET_TEAM_SCORESHEETS_QUERY, {
    variables: {
      divisionId: currentDivision.id,
      teamId: team.id
    }
  });

  const sortedScoresheets = useMemo(() => {
    const scoresheets = data?.division?.field?.scoresheets ?? [];
    return [...scoresheets].sort((a, b) => {
      // Sort by stage (PRACTICE first, then RANKING)
      const stageOrder = { PRACTICE: 0, RANKING: 1 };
      const stageCompare =
        (stageOrder[a.stage as keyof typeof stageOrder] || 0) -
        (stageOrder[b.stage as keyof typeof stageOrder] || 0);
      if (stageCompare !== 0) return stageCompare;
      // Then by round
      return a.round - b.round;
    });
  }, [data]);

  const handleChange = (newSlug: string) => {
    router.push(`/lems/team/${teamSlug}/scoresheet/${newSlug}`);
  };

  if (loading || sortedScoresheets.length <= 1) {
    return null;
  }

  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <Select
        value={scoresheetSlug as string}
        onChange={e => handleChange(e.target.value)}
        sx={{
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.12)
          },
          '&.Mui-focused': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            borderColor: theme.palette.primary.main
          },
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'none'
        }}
      >
        {sortedScoresheets.map(scoresheet => (
          <MenuItem key={scoresheet.id} value={scoresheet.slug}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <span>
                {getStage(scoresheet.stage)} {t('selectScoresheet.round')} {scoresheet.round}
              </span>
              {scoresheet.status && (
                <Box
                  sx={{
                    ml: 'auto',
                    px: 1,
                    py: 0.25,
                    borderRadius: 0.5,
                    backgroundColor:
                      scoresheet.status === 'submitted'
                        ? alpha(theme.palette.success.main, 0.1)
                        : scoresheet.escalated
                          ? alpha(theme.palette.warning.main, 0.1)
                          : 'transparent',
                    color:
                      scoresheet.status === 'submitted'
                        ? theme.palette.success.dark
                        : scoresheet.escalated
                          ? theme.palette.warning.dark
                          : 'inherit',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {scoresheet.status === 'submitted' && <CheckIcon sx={{ fontSize: '1rem' }} />}
                  {scoresheet.escalated && <WarningIcon sx={{ fontSize: '1rem' }} />}
                </Box>
              )}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
