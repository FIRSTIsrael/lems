declare module 'timesync' {
  type TimeSync = {
    destroy();
    now(): number;
    on(event: 'change', callback: (offset: number) => void);
    on(event: 'error', callback: (err: unknown) => void);
    on(event: 'sync', callback: (value: 'start' | 'end') => void);
    off(event: 'change' | 'error' | 'sync', callback?: () => void);
    sync();

    send(to: string, data: object, timeout: number): Promise<void>;
    receive(from: string, data: object);
  };

  type TimeSyncCreateOptions = {
    interval?: number | null;
    timeout?: number;
    delay?: number;
    repeat?: number;
    peers?: string | string[];
    server?: string;
    now?: () => number;
  };

  function create(options: TimeSyncCreateOptions): TimeSync;
}
