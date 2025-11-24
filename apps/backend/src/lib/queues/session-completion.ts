import { enqueueScheduledEvent } from './session-completion-queue';
import type { ScheduledEvent } from './worker-manager';

/**
 * Convenience function to enqueue a session completion event
 * Wraps the generic enqueueScheduledEvent with session-specific logic
 */
export async function enqueueSessionCompletion(
  sessionId: string,
  divisionId: string,
  startTime: Date,
  scheduledDurationSeconds: number,
  sessionType: 'judging' | 'match' = 'judging'
): Promise<void> {
  // Calculate when the session should complete
  const completionTime = new Date(startTime.getTime() + scheduledDurationSeconds * 1000);
  const delayMs = completionTime.getTime() - Date.now();

  const event: ScheduledEvent = {
    eventType: 'session-completion',
    eventId: sessionId,
    divisionId,
    metadata: {
      startTime: startTime.toISOString(),
      scheduledDurationSeconds,
      sessionType
    }
  };

  return enqueueScheduledEvent(event, delayMs);
}
