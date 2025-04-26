import { useCallback } from 'react';
import dayjs from 'dayjs';
import { ScheduleBreak, ScheduleGenerationSettings } from '@lems/types';
import { CalendarEvent, DEFAULT_BREAK_DURATION_MINUTES } from './common';

const createScheduleBreak = (
  event: CalendarEvent,
  durationSeconds: number,
  matchesPerRound: number,
  practiceRounds: number
): ScheduleBreak | null => {
  let eventType: 'judging' | 'match';
  let matchType: 'practice' | 'ranking' | undefined;

  // Determine event type based on column and event type
  if (event.column === 'judging') {
    eventType = 'judging';
  } else if (event.column === 'field') {
    eventType = 'match';
    matchType = event.type === 'practice' ? 'practice' : 'ranking';
  } else {
    console.error('Invalid event type for break:', event.type);
    return null;
  }

  // For judging, after is just the event number
  // For matches, we need to multiply by matchesPerRound since event number is round number
  let after = eventType === 'judging' ? event.number : event.number * matchesPerRound;
  if (matchType === 'ranking') after += practiceRounds * matchesPerRound;

  return {
    eventType,
    matchType,
    after,
    durationSeconds
  };
};

interface BreakPosition {
  top: CalendarEvent;
  bottom: CalendarEvent;
}

interface UseBreaksProps {
  events: CalendarEvent[];
  settings: ScheduleGenerationSettings;
  matchesPerRound: number;
  updateSettings: (settings: ScheduleGenerationSettings) => void;
  setEvents: (events: CalendarEvent[]) => void;
}

export const useBreaks = ({
  events,
  settings,
  matchesPerRound,
  updateSettings,
  setEvents
}: UseBreaksProps) => {
  const calculateBreakPositions = useCallback((columnEvents: CalendarEvent[]): BreakPosition[] => {
    const positions: { top: CalendarEvent; bottom: CalendarEvent }[] = [];

    const sortedEvents = columnEvents
      .filter(e => e.type !== 'break')
      .sort((a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf());

    for (let i = 0; i < sortedEvents.length - 1; i++) {
      const currentEvent = sortedEvents[i];
      const nextEvent = sortedEvents[i + 1];

      const hasBreakBetween = columnEvents.some(
        e =>
          e.type === 'break' &&
          !dayjs(e.startTime).isBefore(dayjs(currentEvent.endTime)) &&
          !dayjs(e.endTime).isAfter(dayjs(nextEvent.startTime))
      );

      if (!hasBreakBetween) {
        positions.push({
          top: currentEvent,
          bottom: nextEvent
        });
      }
    }

    return positions;
  }, []);

  const addBreak = useCallback(
    (column: 'judging' | 'field', startTime: dayjs.Dayjs) => {
      // Calculate adjusted duration to make end time divisible by 5
      const defaultEndTime = startTime.add(DEFAULT_BREAK_DURATION_MINUTES, 'minutes');
      const minutesFromStart = defaultEndTime.minute();
      const extraMinutes = minutesFromStart % 5 === 0 ? 0 : 5 - (minutesFromStart % 5);
      const adjustedDuration = DEFAULT_BREAK_DURATION_MINUTES + extraMinutes;

      const newBreak: CalendarEvent = {
        id: `break-${column}-${startTime.valueOf()}`,
        type: 'break',
        startTime: startTime.toDate(),
        endTime: startTime.add(adjustedDuration, 'minutes').toDate(),
        number: events.filter(e => e.type === 'break').length + 1,
        column
      };

      // Find the event the break was added after
      const precedingEvent = events.find(
        e =>
          e.column === column &&
          e.type !== 'break' &&
          dayjs(e.startTime).isBefore(startTime) &&
          dayjs(e.endTime).isSame(startTime)
      );
      if (!precedingEvent) return;

      const tempBreak = createScheduleBreak(
        precedingEvent,
        adjustedDuration * 60,
        matchesPerRound,
        settings.practiceRounds
      );
      if (!tempBreak) return;

      const existingBreakIndex = settings.breaks.findIndex(
        b => b.eventType === tempBreak.eventType && b.after === tempBreak.after
      );

      if (existingBreakIndex !== -1) {
        const updatedBreaks = [...settings.breaks];
        updatedBreaks[existingBreakIndex] = {
          ...updatedBreaks[existingBreakIndex],
          durationSeconds: adjustedDuration * 60
        };

        updateSettings({
          ...settings,
          breaks: updatedBreaks
        });
      } else {
        updateSettings({
          ...settings,
          breaks: [...settings.breaks, tempBreak]
        });
      }

      const sortedEvents = [...events].sort(
        (a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf()
      );

      let timeShift = adjustedDuration;
      const updatedEvents = sortedEvents.map(event => {
        if (event.column === column && !dayjs(event.startTime).isBefore(startTime)) {
          const newStartTime = dayjs(event.startTime).add(timeShift, 'minutes');
          let newEndTime = dayjs(event.endTime).add(timeShift, 'minutes');

          // If this is a break, ensure its end time is divisible by 5
          if (event.type === 'break') {
            const endMinutes = newEndTime.minute();
            const extraMins = endMinutes % 5 === 0 ? 0 : 5 - (endMinutes % 5);
            if (extraMins > 0) {
              newEndTime = newEndTime.add(extraMins, 'minutes');
              // Update timeShift for subsequent events
              timeShift += extraMins;
            }
          }

          return {
            ...event,
            startTime: newStartTime.toDate(),
            endTime: newEndTime.toDate()
          };
        }
        return event;
      });

      setEvents([...updatedEvents, newBreak]);
    },
    [events, matchesPerRound, setEvents, updateSettings, settings]
  );

  const removeBreak = useCallback(
    (breakEvent: CalendarEvent) => {
      // Sort events to ensure we process them in chronological order
      const sortedEvents = [...events].sort(
        (a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf()
      );

      const breakDuration = dayjs(breakEvent.endTime).diff(dayjs(breakEvent.startTime), 'minute');
      let timeShift = breakDuration;

      // Find the event the break was added after for settings removal
      const precedingEvent = sortedEvents.find(
        e =>
          e.column === breakEvent.column &&
          e.type !== 'break' &&
          dayjs(e.startTime).isBefore(breakEvent.startTime) &&
          dayjs(e.endTime).isSame(breakEvent.startTime)
      );

      const tempBreak = precedingEvent
        ? createScheduleBreak(
            precedingEvent,
            breakDuration * 60,
            matchesPerRound,
            settings.practiceRounds
          )
        : null;

      updateSettings({
        ...settings,
        breaks: settings.breaks.filter(b => {
          if (!tempBreak) return true;
          return !(b.eventType === tempBreak.eventType && b.after === tempBreak.after);
        })
      });

      const updatedEvents = sortedEvents
        .filter(event => event.id !== breakEvent.id)
        .map(event => {
          if (
            event.column === breakEvent.column &&
            dayjs(event.startTime).isAfter(dayjs(breakEvent.startTime))
          ) {
            const newStartTime = dayjs(event.startTime).subtract(timeShift, 'minutes');
            let newEndTime = dayjs(event.endTime).subtract(timeShift, 'minutes');

            // If this is a break, ensure its end time is divisible by 5
            if (event.type === 'break') {
              const endMinutes = newEndTime.minute();
              const extraMins = endMinutes % 5 === 0 ? 0 : 5 - (endMinutes % 5);
              if (extraMins > 0) {
                newEndTime = newEndTime.add(extraMins, 'minutes');
                // Update timeShift for subsequent events
                timeShift -= extraMins;
              }
            }

            return {
              ...event,
              startTime: newStartTime.toDate(),
              endTime: newEndTime.toDate()
            };
          }
          return event;
        });

      setEvents(updatedEvents);
    },
    [events, matchesPerRound, updateSettings, settings, setEvents]
  );

  const handleBreakResize = useCallback(
    (breakEvent: CalendarEvent, newDuration: number) => {
      // Adjust the new duration to ensure end time is divisible by 5
      const endMinute = dayjs(breakEvent.startTime).add(newDuration, 'minutes').minute();
      const extraMinutes = endMinute % 5 === 0 ? 0 : 5 - (endMinute % 5);
      const adjustedNewDuration = newDuration + extraMinutes;

      const oldDuration = dayjs(breakEvent.endTime).diff(dayjs(breakEvent.startTime), 'minute');
      const durationDiff = adjustedNewDuration - oldDuration;

      const sortedEvents = [...events].sort(
        (a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf()
      );

      const precedingEvent = sortedEvents.find(
        e =>
          e.column === breakEvent.column &&
          e.type !== 'break' &&
          dayjs(e.startTime).isBefore(breakEvent.startTime) &&
          dayjs(e.endTime).isSame(breakEvent.startTime)
      );

      const tempBreak = precedingEvent
        ? createScheduleBreak(
            precedingEvent,
            adjustedNewDuration * 60,
            matchesPerRound,
            settings.practiceRounds
          )
        : null;

      if (tempBreak) {
        updateSettings({
          ...settings,
          breaks: settings.breaks.map(b => {
            if (b.eventType === tempBreak.eventType && b.after === tempBreak.after) {
              return {
                ...b,
                durationSeconds: adjustedNewDuration * 60
              };
            }
            return b;
          })
        });
      }

      const updatedEvents = events.map(event => {
        if (event.id === breakEvent.id) {
          return {
            ...event,
            endTime: dayjs(event.startTime).add(adjustedNewDuration, 'minute').toDate()
          };
        } else if (
          event.column === breakEvent.column &&
          dayjs(event.startTime).isAfter(dayjs(breakEvent.startTime))
        ) {
          return {
            ...event,
            startTime: dayjs(event.startTime).add(durationDiff, 'minute').toDate(),
            endTime: dayjs(event.endTime).add(durationDiff, 'minute').toDate()
          };
        }
        return event;
      });

      setEvents(updatedEvents);
    },
    [events, matchesPerRound, setEvents, updateSettings, settings]
  );

  return {
    calculateBreakPositions,
    addBreak,
    removeBreak,
    handleBreakResize
  };
};
