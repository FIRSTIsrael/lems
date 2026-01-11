'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Table,
  Typography,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TableHead,
  Paper,
  IconButton,
  Box
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { DirectionalIcon } from '@lems/localization';
import { Flag } from '@lems/shared';
import { Team } from '@lems/types/api/portal';
import { useRealtimeData } from '../../../../hooks/use-realtime-data';
import { useDivision } from '../division-data-context';

export const TeamsTab: React.FC = () => {
  const t = useTranslations('pages.event');

  const params = useParams();
  const eventSlug = params.slug as string;

  const division = useDivision();

  const { data: teams } = useRealtimeData<Team[]>(`/portal/divisions/${division.id}/teams`, {
    suspense: true
  });

  if (!teams) {
    return null; // Should be handled by suspense fallback
  }

  const sortedTeams = [...teams].sort((a, b) => a.number - b.number);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h2" gutterBottom>
        {t('teams')}
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography fontWeight={500}>{t('team')}</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={500}>{t('region')}</Typography>
              </TableCell>
              <TableCell>
                <Typography fontWeight={500}>{t('location')}</Typography>
              </TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedTeams.map(team => {
              const href = `/event/${eventSlug}/team/${team.slug}`;

              return (
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
                >
                  <TableCell sx={{ p: 0 }}>
                    <Link
                      href={href}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'block',
                        padding: '16px'
                      }}
                    >
                      {team.name} #{team.number}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ p: 0 }}>
                    <Link
                      href={href}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'block',
                        padding: '16px'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {team.region.toUpperCase()}
                        <Flag region={team.region} size={24} />
                      </Box>
                    </Link>
                  </TableCell>
                  <TableCell sx={{ p: 0 }}>
                    <Link
                      href={href}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'block',
                        padding: '16px'
                      }}
                    >
                      {team.affiliation}, {team.city}
                    </Link>
                  </TableCell>
                  <TableCell sx={{ p: 0 }}>
                    <IconButton
                      component={Link}
                      href={href}
                      sx={{
                        color: 'inherit',
                        width: '100%',
                        height: '100%',
                        borderRadius: 0,
                        padding: '16px',
                        '&:hover': {
                          backgroundColor: 'inherit'
                        }
                      }}
                    >
                      <DirectionalIcon ltr={ChevronRight} rtl={ChevronLeft} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
