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
  Link as MuiLink
} from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import Link from 'next/link';

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
  divisionColor?: string;
}

const TeamsList: React.FC<TeamsListProps> = ({ teams }) => {
  const t = useTranslations('pages.event');
  const sortedTeams = [...teams].sort((a, b) => a.number - b.number);
  const showDivisions = teams.some(team => team.division);

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
            {showDivisions && (
              <TableCell>
                <Typography fontWeight={500}>{t('division')}</Typography>
              </TableCell>
            )}
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
                <MuiLink
                  component={Link}
                  href={`/teams/${team.number}`}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {team.name} #{team.number}
                </MuiLink>
              </TableCell>
              <TableCell>
                <MuiLink
                  component={Link}
                  href={`/teams/${team.number}`}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {team.affiliation.name}, {team.affiliation.city}
                </MuiLink>
              </TableCell>
              {showDivisions && (
                <TableCell>
                  {team.division && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: team.division.color,
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: team.division.color,
                          display: 'inline-block'
                        }}
                      />
                      {team.division.name}
                    </Typography>
                  )}
                </TableCell>
              )}
              <TableCell>
                <MuiLink
                  component={Link}
                  href={`/teams/${team.number}`}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block'
                  }}
                >
                  <ChevronRight />
                </MuiLink>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TeamsList;
