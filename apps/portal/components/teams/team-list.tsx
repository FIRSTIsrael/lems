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
import { PortalTeam } from '@lems/types';
import ChevronEndIcon from '../icons/chevron-end';
import { useTranslations } from 'next-intl';

interface TeamListProps {
  eventId: string;
  teams: PortalTeam[];
}

const TeamList: React.FC<TeamListProps> = ({ eventId, teams }) => {
  const t = useTranslations('components.teams.team-list');
  const sortedTeams = [...teams].sort((a, b) => a.number - b.number);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography fontWeight={500}>{t('team')}</Typography>
            </TableCell>
            <TableCell>
              <Typography fontWeight={500}>{t('location')}</Typography>
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
                  href={`/events/${eventId}/teams/${team.number}`}
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
                  href={`/events/${eventId}/teams/${team.number}`}
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
                  href={`/events/${eventId}/teams/${team.number}`}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block'
                  }}
                >
                  <ChevronEndIcon />
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
