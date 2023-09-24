import { RobotGameMatch } from '@lems/types';
import { Paper, Typography } from '@mui/material';
import { WithId } from 'mongodb';
import { useMemo } from 'react';

interface ActiveMatchProps {
  title: React.ReactNode;
  teams: WithId<RobotGameMatch>[];
}

const ActiveMatch: React.FC<ActiveMatchProps> = ({ title, teams }) => {
  const matchName = useMemo(() => (teams[0] ? `מקצה #${teams[0].number}` : null), [teams]);

  return (
    <Paper sx={{ p: 2, flex: 1 }}>
      <Typography component="h2" fontSize="1.125rem" fontWeight={500}>
        {title}
      </Typography>
      <Typography fontSize="1.75rem" fontWeight={700}>
        {matchName || '-'}
      </Typography>
    </Paper>
  );
};

export default ActiveMatch;
