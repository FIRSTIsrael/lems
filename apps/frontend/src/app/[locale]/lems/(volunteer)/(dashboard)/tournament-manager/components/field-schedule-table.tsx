import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import type { TournamentManagerData } from '../graphql';
import { TeamSlot } from './team-slot';
import type { SlotInfo } from './types';

interface FieldScheduleTableProps {
  matches: TournamentManagerData['division']['field']['matches'];
  tables: { id: string; name: string }[];
  selectedSlot: SlotInfo | null;
  secondSlot: SlotInfo | null;
  isMobile: boolean;
  onSlotClick: (slot: SlotInfo) => void;
  onRoundChange?: (
    matches: TournamentManagerData['division']['field']['matches'],
    roundTitle: string
  ) => void;
  getStage: (stage: string) => string;
  t: (key: string) => string;
}

export function FieldScheduleTable({
  matches,
  tables,
  selectedSlot,
  secondSlot,
  isMobile,
  onSlotClick,
  onRoundChange,
  getStage,
  t
}: FieldScheduleTableProps) {
  // Group matches by stage and round, filtering out TEST matches
  const groupedMatches: Record<string, Record<number, typeof matches>> = {};
  matches.forEach(match => {
    if (match.stage === 'TEST') return; // Filter out test matches
    if (!groupedMatches[match.stage]) {
      groupedMatches[match.stage] = {};
    }
    if (!groupedMatches[match.stage][match.round]) {
      groupedMatches[match.stage][match.round] = [];
    }
    groupedMatches[match.stage][match.round].push(match);
  });

  // Build toggle button options
  const roundOptions: Array<{ key: string; title: string; matches: typeof matches }> = [];

  // Get first round key as default
  const firstRoundKey =
    Object.keys(groupedMatches).length > 0
      ? `${Object.keys(groupedMatches)[0]}-${Object.keys(groupedMatches[Object.keys(groupedMatches)[0]])[0]}`
      : '';
  const [selectedRound, setSelectedRound] = useState<string>(firstRoundKey);
  Object.entries(groupedMatches).forEach(([stage, rounds]) => {
    Object.entries(rounds).forEach(([round, matchGroup]) => {
      const firstMatch = matchGroup[0];
      const roundTitle = `${getStage(firstMatch.stage)} ${firstMatch.round}`;
      const key = `${stage}-${round}`;
      roundOptions.push({ key, title: roundTitle, matches: matchGroup });
    });
  });

  const currentRound = roundOptions.find(r => r.key === selectedRound) || roundOptions[0];

  // Notify parent of current round matches and title
  useEffect(() => {
    if (currentRound && onRoundChange) {
      onRoundChange(currentRound.matches, currentRound.title);
    }
  }, [currentRound, onRoundChange]);

  return (
    <Box sx={{ p: 2 }}>
      {roundOptions.length > 0 && (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <ToggleButtonGroup
              value={selectedRound}
              exclusive
              onChange={(_, newValue) => {
                if (newValue !== null) {
                  setSelectedRound(newValue);
                }
              }}
              size="small"
              sx={{ flexWrap: 'wrap' }}
            >
              {roundOptions.map(option => (
                <ToggleButton key={option.key} value={option.key}>
                  {option.title}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {currentRound && (
            <TableContainer component={Paper} sx={{ p: 0, bgcolor: 'white', boxShadow: 'none' }}>
              <Table
                size="small"
                sx={{
                  tableLayout: 'fixed',
                  width: '100%',
                  minWidth: Math.max(400, 100 + tables.length * 100)
                }}
              >
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.200' }}>
                    <TableCell width={80} align="center">
                      <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                        {t('match-number')}
                      </Typography>
                    </TableCell>
                    <TableCell width={80} align="center">
                      <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                        {t('start-time')}
                      </Typography>
                    </TableCell>
                    <TableCell width={80} align="center">
                      <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                        {t('end-time')}
                      </Typography>
                    </TableCell>
                    {tables.map(table => (
                      <TableCell key={table.id} align="center">
                        <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                          {table.name}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentRound.matches.map(match => {
                    const matchTime = dayjs(match.scheduledTime);
                    const endTime = matchTime.add(150, 'seconds');

                    const tableParticipants = new Map(match.participants.map(p => [p.table.id, p]));

                    return (
                      <TableRow key={match.id}>
                        <TableCell align="center">
                          <Typography
                            fontFamily="monospace"
                            fontWeight={500}
                            fontSize={isMobile ? '0.75rem' : '1rem'}
                          >
                            {match.number}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            fontFamily="monospace"
                            fontWeight={500}
                            fontSize={isMobile ? '0.75rem' : '1rem'}
                          >
                            {matchTime.format('HH:mm')}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            fontFamily="monospace"
                            fontWeight={500}
                            fontSize={isMobile ? '0.75rem' : '1rem'}
                          >
                            {endTime.format('HH:mm')}
                          </Typography>
                        </TableCell>
                        {tables.map(table => {
                          const participant = tableParticipants.get(table.id);
                          const team = participant?.team;

                          return (
                            <TableCell key={table.id} align="center">
                              <TeamSlot
                                team={team || null}
                                isSelected={selectedSlot?.participantId === participant?.id}
                                isSecondSelected={secondSlot?.participantId === participant?.id}
                                isMobile={isMobile}
                                onClick={() => {
                                  const slot = {
                                    type: 'match' as const,
                                    matchId: match.id,
                                    participantId: participant?.id,
                                    team: team || null,
                                    tableName: table.name,
                                    time: matchTime.format('HH:mm')
                                  };
                                  onSlotClick(slot);
                                }}
                              />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Box>
  );
}
