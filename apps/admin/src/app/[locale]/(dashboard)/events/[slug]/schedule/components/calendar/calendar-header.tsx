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
    practiceRounds,
    rankingRounds,
    practiceCycleTime,
    rankingCycleTime,
    matchesPerRound,
    addPracticeRound,
    addRankingRound
  } = useSchedule();
  const { blocks, setBlocks } = useCalendar();

  const onAddPracticeRound = useCallback(() => {
    // Find the first ranking round to insert a practice round before it
    const firstRanking = blocks.find(b => b.type === 'ranking-round' && b.roundNumber === 1);
    if (!firstRanking) return;

    const practiceMatchDuration =
      (practiceCycleTime.hour() * 3600 +
        practiceCycleTime.minute() * 60 +
        practiceCycleTime.second()) *
      matchesPerRound;

    // The insertion time is where the first ranking round currently starts
    const insertionTime = firstRanking.startTime;
    const newPracticeStart = insertionTime;
    const newPracticeEnd = insertionTime.add(practiceMatchDuration, 'second');

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
            startTime: block.startTime.add(practiceMatchDuration, 'second'),
            endTime: block.endTime.add(practiceMatchDuration, 'second')
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
  }, [blocks, practiceCycleTime, matchesPerRound, setBlocks, addPracticeRound, practiceRounds]);

  const onAddRankingRound = useCallback(() => {
    const fieldBlocks = blocks.filter(b => b.column === 'field');
    const lastFieldBlock = fieldBlocks[fieldBlocks.length - 1];
    const newRankingStart = lastFieldBlock.endTime;
    const rankingRoundDuration =
      (rankingCycleTime.hour() * 3600 +
        rankingCycleTime.minute() * 60 +
        rankingCycleTime.second()) *
      matchesPerRound;

    const newRankingEnd = newRankingStart.add(rankingRoundDuration, 'second');

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
  }, [addRankingRound, blocks, matchesPerRound, rankingCycleTime, rankingRounds, setBlocks]);

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
