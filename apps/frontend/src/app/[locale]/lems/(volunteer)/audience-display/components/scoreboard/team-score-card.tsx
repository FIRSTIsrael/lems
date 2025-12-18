import { Paper, Stack, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

interface TeamScoreCardProps {
  teamNumber: number;
  teamName: string;
  score: number | null;
  status: string;
  escalated: boolean;
}

export const TeamScoreCard: React.FC<TeamScoreCardProps> = ({
  teamNumber,
  teamName,
  score,
  status,
  escalated
}) => {
  const t = useTranslations('pages.audience-display.scoreboard');

  let statusColor = '#757575'; // grey
  let backgroundColor = 'rgba(117, 117, 117, 0.08)';

  if (status === 'draft' || escalated) {
    statusColor = '#f57f17'; // yellow
    backgroundColor = 'rgba(245, 127, 23, 0.08)';
  } else if (status === 'completed' || status === 'submitted' || status === 'gp') {
    statusColor = '#388e3c'; // green
    backgroundColor = 'rgba(56, 142, 60, 0.08)';
  }

  return (
    <Paper
      sx={{
        p: 1.15,
        bgcolor: backgroundColor,
        border: `2px solid ${statusColor}`,
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        transition: 'all 0.3s ease'
      }}
    >
      <Stack alignItems="flex-start" justifyContent="center" spacing={1}>
        <Typography
          sx={{
            fontSize: { xs: '0.9rem', md: '1rem', lg: '1.15rem' },
            fontWeight: 700,
            color: statusColor,
            textAlign: 'left'
          }}
        >
          #{teamNumber}
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: '0.8rem', md: '0.9rem', lg: '1rem' },
            fontWeight: 600,
            color: 'text.secondary',
            textAlign: 'left',
            lineHeight: 1.1
          }}
        >
          {teamName}
        </Typography>
      </Stack>

      <Typography
        sx={{
          fontSize: { xs: '1.25rem', md: '1.5rem', lg: '1.75rem' },
          fontWeight: 700,
          color: statusColor,
          textAlign: 'center',
          minWidth: '50px'
        }}
      >
        {escalated ? t('previous-match.under-review') : score !== null ? score : '-'}
      </Typography>
    </Paper>
  );
};
