'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Box, Stack, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useSchedule } from '../schedule-context';
import { createScheduleBlock, renumberRounds } from './calendar-utils';
import { useCalendar } from './calendar-context';

export const CalendarHeader: React.FC = () => {
  const t = useTranslations('pages.events.schedule.calendar');

  const {
    teamsCount,
    tablesCount,
    practiceRounds,
    rankingRounds,
    staggerMatches,
    practiceCycleTime,
    rankingCycleTime,
    addPracticeRound,
    addRankingRound
  } = useSchedule();
  const { blocks, setBlocks } = useCalendar();

  const onAddPracticeRound = useCallback(() => {
    // Find the first ranking round to insert a practice round before it
    const firstRanking = blocks.find(b => b.type === 'ranking-round' && b.roundNumber === 1);
    if (!firstRanking) return;

    // Calculate the duration for a practice round
    const matchesPerRound = Math.ceil(teamsCount / tablesCount) * (staggerMatches ? 0.5 : 1);
    const practiceRoundDuration =
      (practiceCycleTime.minute() * 60 + practiceCycleTime.second()) * matchesPerRound;

    // The insertion time is where the first ranking round currently starts
    const insertionTime = firstRanking.startTime;
    const newPracticeStart = insertionTime;
    const newPracticeEnd = insertionTime.add(practiceRoundDuration, 'second');

    setBlocks(prev => {
      // Create the new practice round
      const newPracticeRound = createScheduleBlock(
        'practice-round',
        'field',
        newPracticeStart,
        newPracticeEnd,
        practiceRounds + 1 // This will be renumbered correctly
      );

      // Shift all field blocks that start at or after the insertion time forward by the practice round duration
      const updatedBlocks = prev.map(block => {
        if (
          block.column === 'field' &&
          (block.startTime.isSame(insertionTime) || block.startTime.isAfter(insertionTime))
        ) {
          return {
            ...block,
            startTime: block.startTime.add(practiceRoundDuration, 'second'),
            endTime: block.endTime.add(practiceRoundDuration, 'second')
          };
        }
        return block;
      });

      // Add the new practice round to the shifted blocks
      let finalBlocks = [...updatedBlocks, newPracticeRound];

      // Renumber all rounds to ensure correct sequential numbering
      finalBlocks = renumberRounds(finalBlocks);

      return finalBlocks;
    });

    addPracticeRound();
  }, [
    blocks,
    teamsCount,
    tablesCount,
    staggerMatches,
    practiceCycleTime,
    setBlocks,
    practiceRounds,
    addPracticeRound
  ]);

  const onAddRankingRound = useCallback(() => {
    const fieldBlocks = blocks.filter(b => b.column === 'field');
    const lastFieldBlock = fieldBlocks[fieldBlocks.length - 1];
    const newRankingStart = lastFieldBlock.endTime;
    const matchesPerRound = Math.ceil(teamsCount / tablesCount) * (staggerMatches ? 0.5 : 1);
    const newRankingEnd = newRankingStart.add(
      (rankingCycleTime.minute() * 60 + rankingCycleTime.second()) * matchesPerRound,
      'second'
    );

    setBlocks(prev => {
      let updatedBlocks = [
        ...prev,
        createScheduleBlock(
          'ranking-round',
          'field',
          newRankingStart,
          newRankingEnd,
          rankingRounds + 1
        )
      ];

      updatedBlocks = renumberRounds(updatedBlocks);

      return updatedBlocks;
    });

    addRankingRound();
  }, [
    addRankingRound,
    blocks,
    rankingCycleTime,
    rankingRounds,
    setBlocks,
    staggerMatches,
    tablesCount,
    teamsCount
  ]);

  return (
    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" spacing={2}>
        <Button size="small" variant="outlined" startIcon={<Add />} onClick={onAddPracticeRound}>
          {t('field.add-practice-round')}
        </Button>
        <Button size="small" variant="outlined" startIcon={<Add />} onClick={onAddRankingRound}>
          {t('field.add-ranking-round')}
        </Button>
      </Stack>
    </Box>
  );
};
