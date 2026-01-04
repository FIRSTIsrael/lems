'use client';

import { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import { DISQUALIFY_TEAM } from '../graphql/mutations/disqualify-team';
import { useEvent } from '../../../components/event-context';
import { useJudgeAdvisor } from './judge-advisor-context';

export function DisqualificationSection() {
  const t = useTranslations('pages.judge-advisor');
  const { currentDivision } = useEvent();
  const { sessions, disqualifiedTeams, loading } = useJudgeAdvisor();
  const [searchValue, setSearchValue] = useState('');

  const [disqualifyTeam] = useMutation(DISQUALIFY_TEAM);

  // Get all teams from sessions
  const allTeams = useMemo(() => {
    return sessions.map(session => session.team);
  }, [sessions]);

  // Filter teams by search (number, name, affiliation, city)
  const filteredTeams = useMemo(() => {
    if (!searchValue.trim()) return allTeams;

    const searchLower = searchValue.toLowerCase();
    return allTeams.filter(team => {
      const numberMatch = team.number.toString().includes(searchLower);
      const nameMatch = team.name.toLowerCase().includes(searchLower);
      const affiliationMatch = team.affiliation.toLowerCase().includes(searchLower);
      const cityMatch = team.city.toLowerCase().includes(searchLower);

      return numberMatch || nameMatch || affiliationMatch || cityMatch;
    });
  }, [allTeams, searchValue]);

  // Get disqualified teams
  const disqualifiedTeamsData = useMemo(() => {
    return allTeams.filter(team => disqualifiedTeams.has(team.id));
  }, [allTeams, disqualifiedTeams]);

  const handleDisqualify = useCallback(
    async (teamId: string) => {
      try {
        await disqualifyTeam({
          variables: {
            teamId,
            divisionId: currentDivision.id
          }
        });
      } catch (error) {
        console.error('Error disqualifying team:', error);
      }
    },
    [disqualifyTeam, currentDivision.id]
  );

  return (
    <Stack spacing={3}>
      {/* Search and Disqualify Section */}
      <Card>
        <CardHeader title={t('awards.disqualification.search-title')} />
        <CardContent>
          <Stack spacing={2}>
            <TextField
              fullWidth
              placeholder={t('awards.disqualification.search-placeholder')}
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              size="small"
              disabled={loading}
            />

            {filteredTeams.length > 0 ? (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'action.hover' }}>
                    <TableCell>#</TableCell>
                    <TableCell>{t('awards.disqualification.team-name')}</TableCell>
                    <TableCell>{t('awards.disqualification.affiliation')}</TableCell>
                    <TableCell>{t('awards.disqualification.city')}</TableCell>
                    <TableCell align="right">{t('awards.disqualification.action')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTeams.map(team => (
                    <TableRow key={team.id}>
                      <TableCell>{team.number}</TableCell>
                      <TableCell>{team.name}</TableCell>
                      <TableCell>{team.affiliation}</TableCell>
                      <TableCell>{team.city}</TableCell>
                      <TableCell align="right">
                        {disqualifiedTeams.has(team.id) ? (
                          <Chip
                            label={t('awards.disqualification.disqualified')}
                            color="error"
                            variant="outlined"
                            size="small"
                          />
                        ) : (
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => handleDisqualify(team.id)}
                            disabled={loading}
                          >
                            {t('awards.disqualification.disqualify')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('awards.disqualification.no-teams')}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Disqualified Teams List */}
      {disqualifiedTeamsData.length > 0 && (
        <Card>
          <CardHeader title={t('awards.disqualification.disqualified-teams-title')} />
          <CardContent>
            <Stack spacing={1}>
              {disqualifiedTeamsData.map(team => (
                <Box
                  key={team.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    backgroundColor: 'error.50',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'error.200'
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2">
                      #{team.number} - {team.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {team.affiliation}, {team.city}
                    </Typography>
                  </Box>
                  <Chip
                    label={t('awards.disqualification.disqualified')}
                    color="error"
                    size="small"
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
