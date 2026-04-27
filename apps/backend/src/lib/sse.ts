import { Response } from 'express';
import type { SseEvent } from '@lems/shared';

export interface SseEmitter {
  sendStart(): void;
  sendProgress(percent: number, message?: string): void;
  sendSuccess<T>(data?: T): void;
  sendFailure(message: string): void;
}

export function createSseEmitter(res: Response): SseEmitter {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let closed = false;

  res.on('close', () => {
    closed = true;
  });

  const write = (payload: SseEvent) => {
    if (closed || res.writableEnded || res.destroyed) {
      return;
    }

    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  const end = () => {
    if (closed || res.writableEnded || res.destroyed) {
      return;
    }

    res.end();
  };

  return {
    sendStart() {
      write({ type: 'start' });
    },
    sendProgress(percent, message) {
      write({ type: 'progress', percent, message });
    },
    sendSuccess(data) {
      write({ type: 'success', data });
      end();
    },
    sendFailure(message) {
      write({ type: 'failure', message });
      end();
    }
  };
}
