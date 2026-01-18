'use client';

import { useMemo } from 'react';
import { compareScoreArrays } from '@lems/shared/utils/arrays';
import {
  Avatar,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  alpha
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useScoreboard } from './scoreboard-context';

export const ScoresTable = () => {
  const t = useTranslations('pages.audience-display.scoreboard.scores-table');
  const { matches, scoresheets, currentStage } = useScoreboard();

  const rounds = useMemo(() => {
    const roundsSet = new Set<string>();
    scoresheets
      .filter(s => s.stage === currentStage)
      .forEach(s => {
        roundsSet.add(`${s.stage}-${s.round}`);
      });
    return Array.from(roundsSet)
      .map(key => {
        const [stage, roundStr] = key.split('-');
        return { stage, round: parseInt(roundStr, 10) };
      })
      .filter(value => value.stage === currentStage)
      .sort((a, b) => (a.stage === b.stage ? a.round - b.round : 0));
  }, [scoresheets, currentStage]);

  const teamScores = useMemo(() => {
    const teamsMap = new Map<
      string,
      {
        teamId: string;
        number: number;
        name: string;
        affiliation?: string;
        city?: string;
        logoUrl?: string;
        scores: (number | undefined)[];
        maxScore: number;
      }
    >();

    scoresheets
      .filter(s => s.stage === currentStage)
      .forEach(scoresheet => {
        const matchParticipant = matches
          .flatMap(m => m.participants)
          .find(p => p.team?.id === scoresheet.team.id);

        if (!matchParticipant?.team) return;

        const teamId = matchParticipant.team.id;
        if (!teamsMap.has(teamId)) {
          teamsMap.set(teamId, {
            teamId,
            number: matchParticipant.team.number,
            name: matchParticipant.team.name,
            affiliation: matchParticipant.team.affiliation,
            city: matchParticipant.team.city,
            logoUrl: matchParticipant.team.logoUrl,
            scores: [],
            maxScore: 0
          });
        }

        const team = teamsMap.get(teamId)!;
        if (
          scoresheet.status === 'completed' ||
          scoresheet.status === 'submitted' ||
          scoresheet.status === 'gp'
        ) {
          team.scores.push(scoresheet.data?.score);
          team.maxScore = Math.max(team.maxScore, scoresheet.data?.score || 0);
        } else {
          team.scores.push(undefined);
        }
      });

    return Array.from(teamsMap.values())
      .sort((a, b) => compareScoreArrays(a.scores, b.scores))
      .map((team, index) => ({ ...team, rank: index + 1 }));
  }, [scoresheets, matches, currentStage]);

  const renderScoreCell = (score: number | undefined) => {
    if (score === undefined) {
      return <Typography sx={{ color: 'text.secondary', fontStyle: 'italic' }}>—</Typography>;
    }
    return <Typography>{score}</Typography>;
  };

  const tableContent = teamScores.map((team, index) => (
    <TableRow
      key={team.teamId}
      sx={{
        bgcolor:
          index % 2 === 0 ? 'background.paper' : theme => alpha(theme.palette.primary.main, 0.02),
        '&:hover': {
          bgcolor: theme => alpha(theme.palette.primary.main, 0.05)
        },
        transition: 'background-color 0.2s'
      }}
    >
      <TableCell align="center" sx={{ fontWeight: 600, py: 1.25, fontSize: '0.95rem' }}>
        {team.rank}
      </TableCell>
      <TableCell sx={{ py: 1.25 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={team.logoUrl ?? '/assets/default-avatar.svg'}
            sx={{
              width: 36,
              height: 36,
              color: 'white',
              objectFit: 'cover',
              flexShrink: 0
            }}
          />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
              #{team.number} | {team.name}
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
              {team.affiliation}, {team.city}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      {team.scores.map((score, scoreIndex) => (
        <TableCell
          key={`score-${team.teamId}-${scoreIndex}`}
          align="center"
          sx={{ py: 1.25, fontSize: '1rem', fontWeight: 500 }}
        >
          {renderScoreCell(score)}
        </TableCell>
      ))}
      <TableCell
        align="center"
        sx={{ fontWeight: 700, py: 1.25, color: 'primary.main', fontSize: '1.1rem' }}
      >
        {team.maxScore}
      </TableCell>
    </TableRow>
  ));

  return (
    <Paper
      sx={{
        bgcolor: theme => alpha(theme.palette.background.paper, 0.95),
        borderRadius: 1.5,
        overflow: 'hidden',
        height: '100%',
        width: '100%'
      }}
    >
      <TableContainer>
        <Table stickyHeader>
          <TableHead sx={{ bgcolor: theme => alpha(theme.palette.primary.main, 0.08) }}>
            <TableRow sx={{ bgcolor: theme => alpha(theme.palette.primary.main, 0.08) }}>
              <TableCell align="center" sx={{ fontWeight: 700, py: 1.5, fontSize: '0.95rem' }}>
                {t('rank')}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, py: 1.5, fontSize: '0.95rem' }} width="35%">
                {t('team')}
              </TableCell>
              {rounds.map(round => (
                <TableCell
                  key={`round-${round.stage}-${round.round}`}
                  align="center"
                  sx={{ fontWeight: 700, py: 1.5, fontSize: '0.95rem' }}
                >
                  {round.stage === 'PRACTICE' ? 'P' : 'R'}
                  {round.round}
                </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 700, py: 1.5, fontSize: '0.95rem' }}>
                {t('highest-score')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody sx={{ animation: 'scroll-up 45s linear infinite' }}>
            {tableContent}
            {tableContent}
          </TableBody>
        </Table>
      </TableContainer>

      <style>{`
          @keyframes scroll-up {
            0% {
              transform: translateY(0);
            }
            100% {
              transform: translateY(-50%);
            }
          }
        `}</style>
    </Paper>
  );
};
