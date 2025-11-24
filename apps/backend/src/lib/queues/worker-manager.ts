import { Worker, Job } from 'bullmq';
import { getRedisClient } from '../redis/redis-client';

/**
 * Represents a scheduled event that needs processing
 * Extensible for any type of scheduled event (sessions, matches, etc.)
 */
export interface ScheduledEvent {
  eventType: 'session-completion' | 'match-completion'; // Extensible enum
  eventId: string;
  divisionId: string;
  metadata: Record<string, unknown>;
}

/**
 * WorkerManager: Unified queue worker management for all scheduled events
 * Handles initialization, event processing, and graceful shutdown
 *
 * This singleton manager:
 * - Creates one Worker instance that handles all event types
 * - Routes events to appropriate handlers based on eventType
 * - Manages worker lifecycle (start/stop)
 * - Provides monitoring and error handling
 */
export class WorkerManager {
  private static instance: WorkerManager | null = null;
  private worker: Worker<ScheduledEvent> | null = null;
  private handlers: Map<string, (job: Job<ScheduledEvent>) => Promise<void>> = new Map();
  private isShuttingDown = false;

  private constructor() {}

  /**
   * Get or create singleton instance
   */
  static getInstance(): WorkerManager {
    if (!WorkerManager.instance) {
      WorkerManager.instance = new WorkerManager();
    }
    return WorkerManager.instance;
  }

  /**
   * Register an event handler for a specific event type
   * Handlers are called when a job of that type is processed
   */
  registerHandler(
    eventType: string,
    handler: (job: Job<ScheduledEvent>) => Promise<void>
  ): void {
    if (this.handlers.has(eventType)) {
      console.warn(`[WorkerManager] Handler for ${eventType} already registered, overwriting`);
    }
    this.handlers.set(eventType, handler);
    console.log(`[WorkerManager] Handler registered for event type: ${eventType}`);
  }

  /**
   * Start the unified worker
   * Should be called once during application initialization
   */
  async start(): Promise<void> {
    if (this.worker) {
      console.warn('[WorkerManager] Worker already running');
      return;
    }

    if (this.handlers.size === 0) {
      throw new Error('[WorkerManager] No event handlers registered before starting worker');
    }

    try {
      const redisConnection = getRedisClient();

      this.worker = new Worker<ScheduledEvent>(
        'scheduled-events',
        async (job: Job<ScheduledEvent>) => {
          await this.processJob(job);
        },
        {
          connection: redisConnection,
          concurrency: 1 // Process one job at a time
        }
      );

      // Event listeners
      this.worker.on('active', (job) => {
        console.log(`[WorkerManager] Processing job ${job.id} (type: ${job.data.eventType})`);
      });

      this.worker.on('completed', (job) => {
        console.log(`[WorkerManager] Completed job ${job.id}`);
      });

      this.worker.on('failed', (job, err) => {
        console.error(`[WorkerManager] Failed job ${job?.id}:`, err);
      });

      this.worker.on('error', (err) => {
        console.error('[WorkerManager] Worker error:', err);
      });

      this.worker.on('stalled', (jobId) => {
        console.warn(`[WorkerManager] Job ${jobId} stalled`);
      });

      console.log('[WorkerManager] Worker started with handlers for:', Array.from(this.handlers.keys()).join(', '));
    } catch (error) {
      console.error('[WorkerManager] Failed to start worker:', error);
      throw error;
    }
  }

  /**
   * Process a job by routing it to the appropriate handler
   */
  private async processJob(job: Job<ScheduledEvent>): Promise<void> {
    const { eventType, eventId } = job.data;

    try {
      const handler = this.handlers.get(eventType);

      if (!handler) {
        throw new Error(`No handler registered for event type: ${eventType}`);
      }

      console.log(`[WorkerManager] Routing ${eventType} job for ${eventId}`);
      await handler(job);
    } catch (error) {
      console.error(`[WorkerManager] Error processing ${job.data.eventType} job ${job.id}:`, error);
      throw error; // Re-throw to trigger retry
    }
  }

  /**
   * Stop the worker gracefully
   * Waits for in-progress jobs to complete
   */
  async stop(): Promise<void> {
    if (!this.worker || this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;

    try {
      console.log('[WorkerManager] Shutting down worker gracefully');
      await this.worker.close();
      this.worker = null;
      console.log('[WorkerManager] Worker stopped');
    } catch (error) {
      console.error('[WorkerManager] Error during worker shutdown:', error);
      throw error;
    } finally {
      this.isShuttingDown = false;
    }
  }

  /**
   * Check if worker is running
   */
  isRunning(): boolean {
    return this.worker !== null && !this.isShuttingDown;
  }

  /**
   * Get registered event types
   */
  getRegisteredEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}

// Export singleton getter for convenience
export function getWorkerManager(): WorkerManager {
  return WorkerManager.getInstance();
}
