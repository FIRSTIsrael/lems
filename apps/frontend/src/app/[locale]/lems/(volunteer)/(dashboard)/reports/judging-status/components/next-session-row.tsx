'use client';

import { Box, Stack, TableCell, Typography } from '@mui/material';
import { JudgingSession } from '../graphql';
import { TeamInfo } from '../../../components/team-info';

interface NextSessionRowProps {
  session: JudgingSession | undefined;
}

export const NextSessionRow: React.FC<NextSessionRowProps> = ({ session }) => {
  const team = session?.team;

  return (
    <TableCell align="center" sx={{ verticalAlign: 'top', py: 2 }}>
      {session && team ? (
        <Stack spacing={1} alignItems="center">
          <Box sx={{ minWidth: 180 }}>
            <TeamInfo team={team} size="sm" textAlign="center" />
          </Box>
        </Stack>
      ) : (
        <Typography variant="body2" color="text.disabled">
          —
        </Typography>
      )}
    </TableCell>
  );
};
