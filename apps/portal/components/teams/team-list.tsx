import {
  Table,
  Typography,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TableHead,
  Link
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { PortalTeam } from '@lems/types';

interface TeamListProps {
  eventRouting: string;
  teams: PortalTeam[];
}

const TeamList: React.FC<TeamListProps> = ({ eventRouting, teams }) => {
  const sortedTeams = [...teams].sort((a, b) => a.number - b.number);
  console.log("ever", eventRouting)

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography fontWeight={500}>קבוצה</Typography>
            </TableCell>
            <TableCell>
              <Typography fontWeight={500}>מיקום</Typography>
            </TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedTeams.map(team => (
            <TableRow
              key={team.id}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                },
                '&:active': {
                  backgroundColor: 'rgba(0, 0, 0, 0.08)'
                }
              }}
            >
              <TableCell>
                <Link
                  href={`/events/${eventRouting}/teams/${team.number}`}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block'
                  }}
                >
                  {team.name} #{team.number}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/events/${eventRouting}/teams/${team.number}`}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block'
                  }}
                >
                  {team.affiliation.name}, {team.affiliation.city}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/events/${eventRouting}/teams/${team.number}`}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block'
                  }}
                >
                  <ChevronLeftIcon />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TeamList;
