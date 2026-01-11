'use client';

import { Box, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

interface ScoresheetExportProps {
  scoresheet: {
    id: string;
    slug: string;
    stage: string;
    round: number;
    data: {
      missions: Record<string, { points: number; value: number }>;
      signature: string;
      score: number;
    };
  };
  team: {
    id: string;
    number: number;
  };
  divisionName: string;
}

export const ScoresheetExport: React.FC<ScoresheetExportProps> = ({
  scoresheet,
  team,
  divisionName
}) => {
  const t = useTranslations();

  return (
    <Box
      component="section"
      sx={{
        pageBreakInside: 'avoid !important',
        breakInside: 'avoid !important',
        position: 'relative',
        boxSizing: 'border-box',
        mb: 2,
        '@media print': {
          margin: '0',
          padding: '0',
          pageBreakAfter: 'always',
          mb: 0
        }
      }}
    >
      <Stack spacing={2}>
        {/* Scoresheet Header */}
        <Box sx={{ borderBottom: '1px solid #ccc', pb: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {scoresheet.stage} Round {scoresheet.round} - Team #{team.number}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {divisionName}
          </Typography>
        </Box>

        {/* Missions Display */}
        <Box>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
            Missions
          </Typography>
          <Stack spacing={1}>
            {Object.entries(scoresheet.data.missions).map(([missionId, data]) => (
              <Box key={missionId} sx={{ pl: 2 }}>
                <Typography variant="body2">
                  {missionId}: {data.value} points (max: {data.points})
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Total Score */}
        <Box sx={{ borderTop: '1px solid #ccc', pt: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t('export.total-score')}: {scoresheet.data.score}
          </Typography>
        </Box>

        {/* Signature */}
        {scoresheet.data.signature && (
          <Box sx={{ pt: 1 }}>
            <Typography variant="caption" color="textSecondary">
              Signature:
            </Typography>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={scoresheet.data.signature}
              alt="Signature"
              style={{
                maxWidth: '200px',
                height: 'auto',
                border: '1px solid #ccc'
              }}
            />
          </Box>
        )}
      </Stack>
    </Box>
  );
};
