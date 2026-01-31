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
import { useState, useEffect, useMemo } from 'react';
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
  onSlotDrop?: (slot: SlotInfo) => void;
  onRoundChange?: (
    matches: TournamentManagerData['division']['field']['matches'],
    roundTitle: string
  ) => void;
  renderRoundSelector?: (selector: React.ReactNode) => void;
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
  onSlotDrop,
  onRoundChange,
  renderRoundSelector,
  getStage,
  t
}: FieldScheduleTableProps) {
  // Group matches by stage and round, filtering out TEST matches
  const groupedMatches = useMemo(() => {
    const grouped: Record<string, Record<number, typeof matches>> = {};
    matches.forEach(match => {
      if (match.stage === 'TEST') return; // Filter out test matches
      if (!grouped[match.stage]) {
        grouped[match.stage] = {};
      }
      if (!grouped[match.stage][match.round]) {
        grouped[match.stage][match.round] = [];
      }
      grouped[match.stage][match.round].push(match);
    });
    return grouped;
  }, [matches]);

  // Build toggle button options
  const roundOptions = useMemo(() => {
    const options: Array<{ key: string; title: string; matches: typeof matches }> = [];
    Object.entries(groupedMatches).forEach(([stage, rounds]) => {
      Object.entries(rounds).forEach(([round, matchGroup]) => {
        const firstMatch = matchGroup[0];
        const roundTitle = `${getStage(firstMatch.stage)} ${firstMatch.round}`;
        const key = `${stage}-${round}`;
        options.push({ key, title: roundTitle, matches: matchGroup });
      });
    });
    return options;
  }, [groupedMatches, getStage]);

  // Get first round key as default
  const firstRoundKey =
    Object.keys(groupedMatches).length > 0
      ? `${Object.keys(groupedMatches)[0]}-${Object.keys(groupedMatches[Object.keys(groupedMatches)[0]])[0]}`
      : '';
  const [selectedRound, setSelectedRound] = useState<string>(firstRoundKey);

  const currentRound = roundOptions.find(r => r.key === selectedRound) || roundOptions[0];

  // Notify parent of current round matches and title
  useEffect(() => {
    if (currentRound && onRoundChange) {
      onRoundChange(currentRound.matches, currentRound.title);
    }
  }, [currentRound, onRoundChange]);

  // Provide round selector to parent
  useEffect(() => {
    if (renderRoundSelector && roundOptions.length > 0) {
      renderRoundSelector(
        <ToggleButtonGroup
          value={selectedRound}
          exclusive
          onChange={(_, newValue) => {
            if (newValue !== null) {
              setSelectedRound(newValue);
            }
          }}
          size="small"
          sx={{
            flexWrap: 'wrap',
            gap: 0.5,
            '& .MuiToggleButton-root': {
              px: 2,
              py: 0.75,
              fontWeight: 600,
              fontSize: '0.875rem',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'action.hover'
              },
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderColor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark'
                }
              }
            }
          }}
        >
          {roundOptions.map(option => (
            <ToggleButton key={option.key} value={option.key}>
              {option.title}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      );
    }
  }, [renderRoundSelector, roundOptions, selectedRound]);

  return (
    <Box sx={{ p: 2 }}>
      {roundOptions.length > 0 && currentRound && (
        <>
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
                              onDrop={
                                onSlotDrop
                                  ? () => {
                                      const slot = {
                                        type: 'match' as const,
                                        matchId: match.id,
                                        participantId: participant?.id,
                                        team: team || null,
                                        tableName: table.name,
                                        time: matchTime.format('HH:mm')
                                      };
                                      onSlotDrop(slot);
                                    }
                                  : undefined
                              }
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
        </>
      )}
    </Box>
  );
}
