import React from 'react';
import { WithId } from 'mongodb';
import { RobotGameMatch } from '@lems/types';
import { Paper, Typography } from '@mui/material';

interface MatchPreviewProps {
  match?: WithId<RobotGameMatch>;
}

const MatchPreview: React.FC<MatchPreviewProps> = ({ match }) => {
  return (
    <Paper>
      <Typography>Wifi pls</Typography>
    </Paper>
  );
};

export default MatchPreview;
