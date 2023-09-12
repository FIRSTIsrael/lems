export type WSRoomName = 'judging' | 'field' | 'pit-admin';

interface EventsMap {
  [event: string]: any;
}

type EventNames<Map extends EventsMap> = keyof Map & (string | symbol);

export interface WSServerEmittedEvents {
  judgingSessionStarted: (sessionId: string) => void;

  judgingSessionCompleted: (sessionId: string) => void;

  judgingSessionAborted: (sessionId: string) => void;

  teamRegistered: (teamId: string) => void;
}

export interface WSClientEmittedEvents {
  startJudgingSession: (
    eventId: string,
    roomId: string,
    sessionId: string,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  abortJudgingSession: (
    eventId: string,
    roomId: string,
    sessionId: string,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  registerTeam: (
    eventId: string,
    teamId: string,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  joinRoom: (
    room: WSRoomName,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface WSInterServerEvents {
  // ...
}

export interface WSSocketData {
  rooms: Array<WSRoomName>;
}

export interface WSEventListener {
  //TODO: make the function accept the correct args according to the name?
  //this is extremely difficult and not neccesarily possible
  //https://github.com/socketio/socket.io/blob/main/lib/typed-events.ts#L35

  name: EventNames<WSServerEmittedEvents> | EventNames<WSClientEmittedEvents>;
  handler: (...args: any[]) => void | Promise<void>;
}
