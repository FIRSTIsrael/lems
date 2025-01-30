import { useRouter } from 'next/router';
import {
  Table,
  Typography,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TableHead
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { PortalTeam } from '@lems/types';

interface TeamListProps {
  eventId: string;
  teams: PortalTeam[];
}

const TeamList: React.FC<TeamListProps> = ({ eventId, teams }) => {
  const router = useRouter();

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
          {teams.map(team => (
            <TableRow
              key={team.id}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                },
                '&:active': {
                  backgroundColor: 'rgba(0, 0, 0, 0.08)'
                }
              }}
              onClick={() => router.push(`/events/${eventId}/teams/${team.number}`)}
            >
              <TableCell>
                {team.name} #{team.number}
              </TableCell>
              <TableCell>
                {team.affiliation.name}, {team.affiliation.city}
              </TableCell>
              <TableCell>
                <ChevronLeftIcon />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TeamList;
