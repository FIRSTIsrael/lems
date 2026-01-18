'use client';

import { useTranslations } from 'next-intl';
import { Chip, Stack, TableCell, Typography } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { JudgingSession } from '../graphql';
import { TeamInfo } from '../../../components/team-info';

interface NextSessionRowProps {
  session: JudgingSession | undefined;
}

export const NextSessionRow: React.FC<NextSessionRowProps> = ({ session }) => {
  const t = useTranslations('pages.judging-status');
  const team = session?.team;

  return (
    <TableCell align="center" sx={{ verticalAlign: 'top', py: 2 }}>
      {session && team ? (
        <Stack spacing={1} alignItems="center">
          <TeamInfo team={team} size="sm" textAlign="center" />
          {!team.arrived && (
            <Chip
              icon={<WarningAmberRoundedIcon />}
              label={t('not-arrived')}
              color="warning"
              size="small"
              variant="outlined"
            />
          )}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.disabled">
          —
        </Typography>
      )}
    </TableCell>
  );
};
