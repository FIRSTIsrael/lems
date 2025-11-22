import { ObjectId } from 'mongodb';
import { TableRow, TableCell, Typography, Stack, Tooltip } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { JudgingCategoryTypes, DeliberationAnomaly } from '@lems/types';
import AnomalyIcon from '../anomaly-icon';
import { DeliberationTeam } from '../../../../hooks/use-deliberation-teams';

interface CoreAwardsDeliberationGridExtraCellProps {
  teamId: ObjectId;
  index: number;
  teams: Array<DeliberationTeam>;
  anomalies: Array<DeliberationAnomaly>;
  isSuggested?: boolean;
}

const CoreAwardsDeliberationGridExtraCell: React.FC<CoreAwardsDeliberationGridExtraCellProps> = ({
  teamId,
  index,
  teams,
  anomalies,
  isSuggested
}) => {
  const team = teams.find(t => t._id === teamId)!;
  return (
    team && (
      <TableRow
        key={'added-' + index}
        sx={{ backgroundColor: isSuggested ? '#f5f5f5' : 'inherit' }}
      >
        <TableCell>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
            {isSuggested ? (
              <Tooltip title="קבוצה זו לא ברשימה בגלל חריגה, ניתן להוסיף אותה ידנית" arrow>
                <WarningAmberRoundedIcon sx={{ color: '#666', fontSize: '1.25rem' }} />
              </Tooltip>
            ) : null}
            <Typography align="center">{team.number}</Typography>
          </Stack>
        </TableCell>
        {JudgingCategoryTypes.map(category => (
          <TableCell key={'addedscore-' + category}>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
              <Typography>{team.ranks[category] ?? '-'}</Typography>
              <Typography fontSize="0.8rem">({team.scores[category]})</Typography>
              {anomalies
                .filter(a => a.teamId === team._id && a.category === category)
                .map((a, index) => (
                  <AnomalyIcon anomaly={a} key={index} />
                ))}
            </Stack>
          </TableCell>
        ))}
      </TableRow>
    )
  );
};

export default CoreAwardsDeliberationGridExtraCell;
