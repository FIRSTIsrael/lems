import { Queue } from 'bullmq';
import { getRedisClient } from '../redis/redis-client';
import type { ScheduledEvent } from './types';

let queueInstance: Queue<ScheduledEvent, void, string> | null = null;

/**
 * Gets or creates the scheduled events queue
 * Uses a singleton pattern to ensure only one queue instance exists
 */
export function getScheduledEventsQueue(): Queue<ScheduledEvent> {
  if (!queueInstance) {
    const redisConnection = getRedisClient();

    queueInstance = new Queue<ScheduledEvent>('scheduled-events', {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: true,
        removeOnFail: false
      }
    });

    // Log queue events for debugging
    queueInstance.on('error', err => {
      console.error('[ScheduledEventsQueue] Queue error:', err);
    });

    console.log('[ScheduledEventsQueue] Queue initialized');
  }

  return queueInstance;
}

/**
 * Closes the scheduled events queue gracefully
 */
export async function closeScheduledEventsQueue(): Promise<void> {
  if (queueInstance) {
    await queueInstance.close();
    queueInstance = null;
    console.log('[ScheduledEventsQueue] Queue closed');
  }
}

/**
 * Enqueues a scheduled event
 * The job will be executed after the specified delay has passed
 *
 * @param event - The scheduled event to enqueue
 * @param delayMs - Delay in milliseconds before the event should be processed
 * @returns Promise resolving when the job is enqueued
 */
export async function enqueueScheduledEvent(event: ScheduledEvent, delayMs: number): Promise<void> {
  try {
    const queue = getScheduledEventsQueue();

    // Only enqueue if the delay is positive (hasn't already passed)
    if (delayMs > 0) {
      await queue.add('process', event, {
        delay: delayMs,
        jobId: `${event.eventType}-${event.divisionId}-${Date.now()}`
      });

      console.log(
        `[ScheduledEventsQueue] Enqueued ${event.eventType} event ${event.divisionId} ` +
          `to process in ${Math.round(delayMs / 1000)}s`
      );
    } else {
      console.warn(
        `[ScheduledEventsQueue] Event ${event.divisionId} processing time has already passed`
      );
    }
  } catch (error) {
    console.error('[ScheduledEventsQueue] Failed to enqueue event:', error);
    throw error;
  }
}

/**
 * Dequeues scheduled events by finding and removing jobs that match the criteria
 * Searches for jobs with matching eventType, divisionId, and metadata
 *
 * @param eventType - The type of event to dequeue
 * @param divisionId - The division ID
 * @param metadataMatchers - Object containing key-value pairs to match in metadata
 * @returns Promise resolving when matching jobs are removed
 */
export async function dequeueScheduledEvent(
  eventType: string,
  divisionId: string,
  metadataMatchers: Record<string, unknown>
): Promise<void> {
  try {
    const queue = getScheduledEventsQueue();
    const jobs = await queue.getJobs(['waiting', 'delayed']);

    for (const job of jobs) {
      const data = job.data as ScheduledEvent;
      if (data.eventType === eventType && data.divisionId === divisionId) {
        // Check if all metadata matchers are satisfied
        const metadataMatches = Object.entries(metadataMatchers).every(
          ([key, value]) => data.metadata?.[key] === value
        );

        if (metadataMatches) {
          await job.remove();
          console.log(
            `[ScheduledEventsQueue] Removed ${eventType} event in division ${divisionId} ` +
              `matching metadata: ${JSON.stringify(metadataMatchers)}`
          );
        }
      }
    }
  } catch (error) {
    console.error('[ScheduledEventsQueue] Failed to dequeue event:', error);
    throw error;
  }
}
