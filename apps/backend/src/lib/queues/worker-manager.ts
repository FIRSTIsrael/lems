import { Worker, Job, RedisClient } from 'bullmq';
import { getRedisClient } from '../redis/redis-client';
import { logger } from '../logger';
import { ScheduledEvent } from './types';

export class WorkerManager {
  private static instance: WorkerManager | null = null;
  private worker: Worker<ScheduledEvent> | null = null;
  private handlers: Map<string, (job: Job<ScheduledEvent>) => Promise<void>> = new Map();
  private isShuttingDown = false;

  private constructor() {}

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
  registerHandler(eventType: string, handler: (job: Job<ScheduledEvent>) => Promise<void>): void {
    if (this.handlers.has(eventType)) {
      console.warn(`[WorkerManager] Handler for ${eventType} already registered, overwriting`);
    }
    this.handlers.set(eventType, handler);
    console.log(`[WorkerManager] Handler registered for event type: ${eventType}`);
  }

  /**
   * Start the worker manager.
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
          connection: redisConnection as RedisClient,
          concurrency: 1
        }
      );

      this.worker.on('active', job => {
        console.log(`[WorkerManager] Processing job ${job.id} (type: ${job.data.eventType})`);
      });

      this.worker.on('completed', job => {
        console.log(`[WorkerManager] Completed job ${job.id}`);
      });

      this.worker.on('failed', (job, err) => {
        console.error(`[WorkerManager] Failed job ${job?.id}:`, err);
      });

      this.worker.on('error', err => {
        console.error('[WorkerManager] Worker error:', err);
      });

      this.worker.on('stalled', jobId => {
        console.warn(`[WorkerManager] Job ${jobId} stalled`);
      });

      console.log(
        '[WorkerManager] Worker started with handlers for:',
        Array.from(this.handlers.keys()).join(', ')
      );
    } catch (error) {
      console.error('[WorkerManager] Failed to start worker:', error);
      throw error;
    }
  }

  private async processJob(job: Job<ScheduledEvent>): Promise<void> {
    const { eventType, divisionId } = job.data;

    try {
      const handler = this.handlers.get(eventType);

      if (!handler) {
        throw new Error(`No handler registered for event type: ${eventType}`);
      }

      logger.info({ component: 'worker-manager', action: 'process-job', eventType, divisionId, jobId: job.id }, 'Routing job');
      await handler(job);
    } catch (error) {
      logger.error({ component: 'worker-manager', action: 'process-job', eventType: job.data.eventType, jobId: job.id, error: error instanceof Error ? error.message : String(error) }, 'Error processing job');
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
      logger.info({ component: 'worker-manager', action: 'shutdown' }, 'Shutting down worker gracefully');
      await this.worker.close();
      this.worker = null;
      logger.info({ component: 'worker-manager', action: 'shutdown' }, 'Worker stopped');
    } catch (error) {
      logger.error({ component: 'worker-manager', action: 'shutdown', error: error instanceof Error ? error.message : String(error) }, 'Error during worker shutdown');
      throw error;
    } finally {
      this.isShuttingDown = false;
    }
  }

  isRunning(): boolean {
    return this.worker !== null && !this.isShuttingDown;
  }

  getRegisteredEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}

export function getWorkerManager(): WorkerManager {
  return WorkerManager.getInstance();
}
