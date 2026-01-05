'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Box, Typography, Chip, Avatar } from '@mui/material';
import type { Team, RubricFieldValue } from '../graphql/types';

interface TeamInfoProps {
  team: Team;
}

export function TeamInfo({ team }: TeamInfoProps) {
  const t = useTranslations('layouts.deliberation.compare');

  const averageScore = useMemo(() => {
    const rubrics = Object.values(team.rubrics).filter(Boolean);
    if (rubrics.length === 0) return 0;

    let totalScore = 0;
    let totalFields = 0;

    rubrics.forEach(rubric => {
      if (rubric?.data?.fields) {
        Object.values(rubric.data.fields).forEach((fieldValue: unknown) => {
          const typedField = fieldValue as RubricFieldValue;
          if (typedField && typedField.value) {
            totalScore += typedField.value;
            totalFields++;
          }
        });
      }
    });

    return totalFields > 0 ? totalScore / totalFields : 0;
  }, [team.rubrics]);

  return (
    <Box sx={{ flexShrink: 0, textAlign: 'left', order: 1 }}>
      <Typography variant="h6" fontWeight={600}>
        {team.name} - #{team.number}
      </Typography>
      <Typography variant="h6" color="text.secondary">
        {team.affiliation}
      </Typography>
      {team.judgingSession?.room && (
        <Typography variant="h6" color="text.secondary">
          {t('judging-room')}: {team.judgingSession.room.name}
        </Typography>
      )}
      <Chip
        label={`${t('average')}: ${averageScore.toFixed(2)}`}
        color={team.arrived ? 'success' : 'default'}
        sx={{
          mt: 1,
          fontSize: '2rem',
          height: 40,
          '& .MuiChip-label': {
            fontSize: '1.2rem',
            fontWeight: 600
          }
        }}
      />
    </Box>
  );
}

export function TeamLogo({ team }: { team: Team }) {
  return (
    <Avatar
      src={team.logoUrl ?? '/assets/default-avatar.svg'}
      alt={`${team.name} logo`}
      sx={{
        width: 75,
        height: 75,
        objectFit: 'cover',
        flexShrink: 0,
        order: 3
      }}
    />
  );
}
