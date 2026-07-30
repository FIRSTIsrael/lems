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
    <TableCell align="center" sx={{ py: 2, height: '100%' }}>
      {session && team ? (
        <Stack
          spacing={1}
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            minHeight: 150
          }}
        >
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
        <Typography
          variant="body2"
          sx={{
            color: 'text.disabled'
          }}
        >
          —
        </Typography>
      )}
    </TableCell>
  );
};
