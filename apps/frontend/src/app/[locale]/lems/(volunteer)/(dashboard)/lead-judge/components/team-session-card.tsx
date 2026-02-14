'use client';

import { useTranslations } from 'next-intl';
import { JudgingCategory } from '@lems/types/judging';
import { useJudgingCategoryTranslations } from '@lems/localization';
import { getRubricColor } from '@lems/shared/rubrics/rubric-utils';
import { Box, Typography, useTheme, Chip, Stack, Card, CardContent } from '@mui/material';
import { hyphensToUnderscores } from '@lems/shared/utils';
import { JudgingSession } from '../graphql';
import { TeamInfoCell } from './team-info-cell';
import { RubricStatusButton } from './rubric-status-button';

interface TeamSessionCardProps {
  session: JudgingSession;
  category: JudgingCategory;
  loading?: boolean;
}

export const TeamSessionCard: React.FC<TeamSessionCardProps> = ({
  session,
  category,
  loading = false
}) => {
  const t = useTranslations('pages.lead-judge.list');
  const { getCategory } = useJudgingCategoryTranslations();
  const theme = useTheme();
  const rubricColor = getRubricColor(category);

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress':
        return '#2196f3';
      case 'completed':
        return '#4caf50';
      case 'not-started':
        return '#9e9e9e';
      default:
        return '#757575';
    }
  };

  const getSessionStatusLabel = (status: string) => {
    return t(`session-status.${status}`) || status;
  };

  const isRubricApproved = () => {
    return session.rubrics[hyphensToUnderscores(category)]?.status === 'approved';
  };

  if (loading) {
    return (
      <Box>
        <Box sx={{ height: 40, bgcolor: 'action.disabledBackground', borderRadius: 1, mb: 2 }} />
        <Stack spacing={2}>
          {[1, 2, 3].map(i => (
            <Box
              key={i}
              sx={{ height: 120, bgcolor: 'action.disabledBackground', borderRadius: 1 }}
            />
          ))}
        </Stack>
      </Box>
    );
  }

  const rubricApproved = isRubricApproved();
  const isTeamArrived = session.team.arrived;

  return (
    <Card
      sx={{
        backgroundColor: rubricApproved
          ? theme.palette.mode === 'dark'
            ? 'rgba(76, 175, 80, 0.1)'
            : 'rgba(76, 175, 80, 0.05)'
          : theme.palette.mode === 'dark'
            ? '#1e1e1e'
            : '#fafafa',
        borderLeft: `4px solid ${rubricColor}`,
        opacity: isTeamArrived ? 1 : 0.5,
        '&:hover': {
          backgroundColor: rubricApproved
            ? theme.palette.mode === 'dark'
              ? 'rgba(76, 175, 80, 0.15)'
              : 'rgba(76, 175, 80, 0.1)'
            : undefined
        }
      }}
    >
      <CardContent sx={{ pb: 1, '&:last-child': { pb: 1 } }}>
        <Stack direction="row" justifyContent="space-between">
          <Stack
            direction="row"
            spacing={3}
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {t('session')} #{session.number}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {t('room')} - {session.room.name}
              </Typography>
            </Box>

            <Chip
              label={getSessionStatusLabel(session.status)}
              size="small"
              sx={{
                backgroundColor: getSessionStatusColor(session.status),
                color: 'white',
                fontWeight: 600,
                height: 24
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              <TeamInfoCell team={session.team} />
            </Box>
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            <RubricStatusButton
              category={category}
              status={session.rubrics[hyphensToUnderscores(category)]?.status || 'empty'}
              label={getCategory(category)}
              teamSlug={session.team.slug}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};
