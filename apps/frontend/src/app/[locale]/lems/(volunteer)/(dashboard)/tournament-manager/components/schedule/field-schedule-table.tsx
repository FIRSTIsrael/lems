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
  ToggleButton,
  Chip
} from '@mui/material';
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { useMatchTranslations } from '@lems/localization';
import type { MatchStatus, TournamentManagerData } from '../../graphql';
import { TeamSlot } from '../team-slot';
import type { SlotInfo } from '../types';
import {
  isSlotBlockedForSelection,
  isSlotBlockedAsDestination,
  isSlotInProgress
} from '../validation';
import { MATCH_DURATION_SECONDS } from '../constants';

interface FieldScheduleTableProps {
  matches: TournamentManagerData['division']['field']['matches'];
  tables: { id: string; name: string }[];
  selectedSlot: SlotInfo | null;
  secondSlot: SlotInfo | null;
  isMobile: boolean;
  division?: TournamentManagerData['division'];
  onSlotClick: (slot: SlotInfo) => void;
  onRoundChange?: (
    matches: TournamentManagerData['division']['field']['matches'],
    roundTitle: string
  ) => void;
  renderRoundSelector?: (selector: React.ReactNode) => void;
  getStage: (stage: string) => string;
}

interface RoundOption {
  key: string;
  title: string;
  matches: TournamentManagerData['division']['field']['matches'];
}

const groupMatchesByStageAndRound = (
  matches: TournamentManagerData['division']['field']['matches'],
  getStage: (stage: string) => string
): RoundOption[] => {
  const grouped: Record<string, Record<number, typeof matches>> = {};
  matches.forEach(match => {
    if (match.stage === 'TEST') return;
    if (!grouped[match.stage]) grouped[match.stage] = {};
    if (!grouped[match.stage][match.round]) grouped[match.stage][match.round] = [];
    grouped[match.stage][match.round].push(match);
  });

  const options: RoundOption[] = [];
  Object.entries(grouped).forEach(([stage, rounds]) => {
    Object.entries(rounds).forEach(([round, matchGroup]) => {
      const firstMatch = matchGroup[0];
      options.push({
        key: `${stage}-${round}`,
        title: `${getStage(firstMatch.stage)} ${firstMatch.round}`,
        matches: matchGroup
      });
    });
  });
  return options;
};

function FieldScheduleTableComponent({
  matches,
  tables,
  selectedSlot,
  secondSlot,
  isMobile,
  division,
  onSlotClick,
  onRoundChange,
  renderRoundSelector,
  getStage
}: FieldScheduleTableProps) {
  const t = useTranslations('pages.tournament-manager');
  const { getStatus } = useMatchTranslations();

  const roundOptions = useMemo(
    () => groupMatchesByStageAndRound(matches, getStage),
    [matches, getStage]
  );
  const firstRoundKey = roundOptions[0]?.key ?? '';
  const [selectedRound, setSelectedRound] = useState<string>(firstRoundKey);
  const currentRound = useMemo(
    () => roundOptions.find(r => r.key === selectedRound) ?? roundOptions[0],
    [roundOptions, selectedRound]
  );

  useEffect(() => {
    if (currentRound && onRoundChange) {
      onRoundChange(currentRound.matches, currentRound.title);
    }
  }, [currentRound, onRoundChange]);

  const handleRoundToggleChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, newValue: string | null) => {
      if (newValue !== null) {
        setSelectedRound(newValue);
      }
    },
    []
  );

  useEffect(() => {
    if (renderRoundSelector && roundOptions.length > 0) {
      renderRoundSelector(
        <ToggleButtonGroup
          value={selectedRound}
          exclusive
          onChange={handleRoundToggleChange}
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
              '&:hover': { bgcolor: 'action.hover' },
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderColor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' }
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
  }, [renderRoundSelector, roundOptions, selectedRound, handleRoundToggleChange]);

  if (!roundOptions.length || !currentRound) return null;

  return (
    <Box sx={{ p: 2 }}>
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
                  {t('match-schedule.columns.match-number')}
                </Typography>
              </TableCell>
              <TableCell width={80} align="center">
                <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                  {t('match-schedule.columns.start-time')}
                </Typography>
              </TableCell>
              <TableCell width={80} align="center">
                <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                  {t('match-schedule.columns.end-time')}
                </Typography>
              </TableCell>
              <TableCell width={100} align="center">
                <Typography fontWeight={600} fontSize={isMobile ? '0.75rem' : '1rem'}>
                  {t('match-schedule.columns.status')}
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
              const endTime = matchTime.add(MATCH_DURATION_SECONDS, 'seconds');
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
                  <TableCell align="center">
                    <Chip
                      label={getStatus(match.status as MatchStatus)}
                      size="small"
                      color={
                        match.status === 'not-started'
                          ? 'default'
                          : match.status === 'in-progress'
                            ? 'primary'
                            : 'success'
                      }
                      variant="filled"
                    />
                  </TableCell>
                  {tables.map(table => {
                    const participant = tableParticipants.get(table.id);
                    const team = participant?.team;
                    const slot: SlotInfo = {
                      type: 'match',
                      matchId: match.id,
                      participantId: participant?.id,
                      team: team ?? null,
                      tableName: table.name,
                      time: matchTime.format('HH:mm')
                    };
                    const isDisabled =
                      (team !== null && division
                        ? isSlotBlockedForSelection(slot, division) ||
                          (secondSlot ? isSlotBlockedAsDestination(slot, division) : false)
                        : false) ||
                      (division ? isSlotInProgress({ ...slot, type: 'match' }, division) : false);

                    return (
                      <TableCell key={table.id} align="center">
                        <TeamSlot
                          team={team ?? null}
                          isSelected={selectedSlot?.participantId === participant?.id}
                          isSecondSelected={secondSlot?.participantId === participant?.id}
                          isMobile={isMobile}
                          isDisabled={isDisabled}
                          onClick={() => onSlotClick(slot)}
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
    </Box>
  );
}

export const FieldScheduleTable = memo(FieldScheduleTableComponent);
