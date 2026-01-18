'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Box, FormControl, FormHelperText, MenuItem, Select, useTheme, alpha } from '@mui/material';
import { useMatchTranslations } from '@lems/localization';
import { RoleAuthorizer } from '../../../../../../../components/role-authorizer';
import { useUser } from '../../../../../../../components/user-context';

interface ScoresheetSwitcherProps {
  scoresheets: Array<{
    id: string;
    slug: string;
    stage: string;
    round: number;
    status: string;
    escalated?: boolean;
  }>;
}

export const ScoresheetSwitcher: React.FC<ScoresheetSwitcherProps> = ({ scoresheets }) => {
  const t = useTranslations('pages.scoresheet');
  const { getStage } = useMatchTranslations();
  const theme = useTheme();

  const user = useUser();
  const { scoresheetSlug, teamSlug } = useParams();
  const router = useRouter();

  const sortedScoresheets = useMemo(() => {
    return scoresheets.sort((a, b) => {
      // Sort by stage (PRACTICE first, then RANKING)
      const stageOrder = { PRACTICE: 0, RANKING: 1 };
      const stageCompare =
        (stageOrder[a.stage as keyof typeof stageOrder] || 0) -
        (stageOrder[b.stage as keyof typeof stageOrder] || 0);
      if (stageCompare !== 0) return stageCompare;
      // Then by round
      return a.round - b.round;
    });
  }, [scoresheets]);

  const handleChange = (newSlug: string) => {
    router.push(`/lems/referee/team/${teamSlug}/scoresheet/${newSlug}`);
  };

  if (sortedScoresheets.length <= 1) {
    return null;
  }

  return (
    <RoleAuthorizer user={user} allowedRoles="head-referee">
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
                  {getStage(scoresheet.stage)} {t('round')} {scoresheet.round}
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
                      textTransform: 'uppercase'
                    }}
                  >
                    {scoresheet.status === 'submitted' && '✓'}
                    {scoresheet.escalated && '⚠'}
                  </Box>
                )}
              </Box>
            </MenuItem>
          ))}
        </Select>
        <FormHelperText sx={{ fontSize: '0.75rem' }}>{t('selectScoresheet')}</FormHelperText>
      </FormControl>
    </RoleAuthorizer>
  );
};
