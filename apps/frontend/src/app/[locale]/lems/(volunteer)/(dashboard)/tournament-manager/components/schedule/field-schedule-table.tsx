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
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { useMatchTranslations } from '@lems/localization';
import type { MatchStatus, TournamentManagerData } from '../../graphql';
import { TeamSlot } from '../team-slot';
import { StatusChip } from '../status-chip';
import type { SlotInfo } from '../types';
import { MATCH_DURATION_SECONDS } from '../constants';
import { useTournamentManager } from '../../context';
import { useSlotOperations } from '../../hooks/useSlotOperations';
import { isSlotDisabled } from '../validation';

interface FieldScheduleTableProps {
  isMobile: boolean;
}

interface RoundOption {
  key: string;
  title: string;
  matches: TournamentManagerData['division']['field']['matches'];
}

function FieldScheduleTableComponent({ isMobile }: FieldScheduleTableProps) {
  const t = useTranslations('pages.tournament-manager');
  const { getStage } = useMatchTranslations();
  const { division, activeTab, selectedSlot, sourceType, secondSlot, dispatch } =
    useTournamentManager();
  const { handleSlotClick: handleSlotClickOperation } = useSlotOperations(division, dispatch);

  const matches = division.field.matches;
  const tables = division.tables ?? [];

  // Group matches by stage and round
  const roundOptions = useMemo(() => {
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
  }, [matches, getStage]);

  const firstRoundKey = roundOptions[0]?.key ?? '';
  const [selectedRound, setSelectedRound] = useState<string>(firstRoundKey);
  const currentRound = useMemo(
    () => roundOptions.find(r => r.key === selectedRound) ?? roundOptions[0],
    [roundOptions, selectedRound]
  );

  useEffect(() => {
    if (currentRound) {
      const matchesInRound = matches.filter(m => currentRound.matches.some(cm => cm.id === m.id));
      dispatch({ type: 'SET_CURRENT_ROUND_MATCHES', payload: matchesInRound });
      dispatch({ type: 'SET_CURRENT_ROUND_TITLE', payload: currentRound.title });
    }
  }, [currentRound, matches, dispatch]);

  const handleRoundToggleChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, newValue: string | null) => {
      if (newValue !== null) {
        setSelectedRound(newValue);
      }
    },
    []
  );

  const handleSlotClick = useCallback(
    (slot: SlotInfo) => {
      handleSlotClickOperation(slot, selectedSlot, sourceType);
    },
    [handleSlotClickOperation, selectedSlot, sourceType]
  );

  useEffect(() => {
    if (activeTab === 0) {
      dispatch({
        type: 'SET_ROUND_SELECTOR',
        payload:
          roundOptions.length > 0 ? (
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
          ) : null
      });
    }
  }, [activeTab, roundOptions, selectedRound, handleRoundToggleChange, dispatch]);

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
              <TableCell width={70} align="center">
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
              <TableCell width={120} align="center">
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
                    <StatusChip type="match" status={match.status as MatchStatus} size="small" />
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

                    const isCurrentSlot = selectedSlot?.participantId === participant?.id;
                    const disabled = isSlotDisabled(
                      slot,
                      selectedSlot,
                      sourceType,
                      secondSlot,
                      division
                    );

                    return (
                      <TableCell key={table.id} align="center">
                        <TeamSlot
                          team={team ?? null}
                          isSelected={isCurrentSlot}
                          isSecondSelected={secondSlot?.participantId === participant?.id}
                          isMobile={isMobile}
                          isDisabled={disabled}
                          onClick={() => handleSlotClick(slot)}
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
