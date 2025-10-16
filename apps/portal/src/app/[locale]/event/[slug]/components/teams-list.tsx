'use client';

import { useTranslations } from 'next-intl';
import {
  Table,
  Typography,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TableHead,
  Link,
  Paper,
  IconButton
} from '@mui/material';
import { ChevronEndIcon } from '@lems/localization';

interface Team {
  id: string;
  number: number;
  name: string;
  affiliation: {
    name: string;
    city: string;
  };
  division?: {
    id: string;
    name: string;
    color: string;
  };
}

interface TeamsListProps {
  teams: Team[];
  divisionName: string;
}

const TeamsList: React.FC<TeamsListProps> = ({ teams, divisionName }) => {
  const t = useTranslations('pages.event');
  const sortedTeams = [...teams].sort((a, b) => a.number - b.number);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h2" gutterBottom>
        {t('division-teams', { divisionName })}
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography fontWeight={500}>{t('teams')}</Typography>
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
                  {/* Links are added seperatly as <tr> cannot be a child of <a> */}
                  <Link
                    href={`/team/${team.number}`}
                    sx={{
                      textDecoration: 'none',
                      color: 'inherit',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {team.name} #{team.number}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/team/${team.number}`}
                    sx={{
                      textDecoration: 'none',
                      color: 'inherit',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {team.affiliation.name}, {team.affiliation.city}
                  </Link>
                </TableCell>
                <TableCell>
                  <IconButton href={`/team/${team.number}`}>
                    <ChevronEndIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default TeamsList;
