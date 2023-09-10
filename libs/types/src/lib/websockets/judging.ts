export interface JudgingServerEmittedEvents {
  sessionStarted: (sessionId: string) => void;
  sessionCompleted: (sessionId: string) => void;
  sessionAborted: (sessionId: string) => void;
}

export interface JudgingClientEmittedEvents {
  startSession: (
    eventId: string,
    roomId: string,
    sessionId: string,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;
  abortSession: (
    eventId: string,
    roomId: string,
    sessionId: string,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface JudgingInterServerEvents {
  // ...
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface JudgingSocketData {
  // ...
}
