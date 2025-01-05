import { WithId } from 'mongodb';
import { RobotGameMatch } from '@lems/types';
import { TableRow, TableCell, IconButton } from '@mui/material';

interface ActionRowProps {
  fromMatch: WithId<RobotGameMatch>;
  toMatch: WithId<RobotGameMatch>;
}

const ActionRow: React.FC<ActionRowProps> = ({ fromMatch, toMatch }) => {
  return (
    <TableRow>
      <TableCell align="center">NO</TableCell>
      <TableCell align="center">WAY</TableCell>
      <TableCell align="center">
        <IconButton></IconButton>
      </TableCell>
    </TableRow>
  );
};

export default ActionRow;
