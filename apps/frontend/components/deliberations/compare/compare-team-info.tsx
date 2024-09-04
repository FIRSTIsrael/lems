import { useContext } from 'react';
import { ObjectId } from 'mongodb';
import { Avatar, Stack, Typography } from '@mui/material';
import { CompareContext } from './compare-view';

interface CompareTeamInfoProps {
  teamId: ObjectId;
}

const CompareTeamInfo: React.FC<CompareTeamInfoProps> = ({ teamId }) => {
  const { teams } = useContext(CompareContext);
  const team = teams.find(t => t._id === teamId);

  if (!team) {
    return;
  }

  return (
    <Stack direction="row">
      <Typography>{team.number}</Typography>
      <Avatar alt="HG" />
    </Stack>
  );
};

export default CompareTeamInfo;
