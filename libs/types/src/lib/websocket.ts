import { JudgingCategory, TicketType } from './constants';
import { Rubric } from './schemas/rubric';
import { Ticket } from './schemas/ticket';

export type WSRoomName = 'judging' | 'field' | 'pit-admin';

interface EventsMap {
  [event: string]: any;
}

type EventNames<Map extends EventsMap> = keyof Map & (string | symbol);

export interface WSServerEmittedEvents {
  judgingSessionStarted: (sessionId: string) => void;

  judgingSessionCompleted: (sessionId: string) => void;

  judgingSessionAborted: (sessionId: string) => void;

  rubricUpdated: (teamId: string, rubricId: string) => void;

  rubricStatusChanged: (rubricId: string) => void;

  teamRegistered: (teamId: string) => void;

  ticketCreated: (ticketId: string) => void;

  ticketUpdated: (ticketId: string) => void;

  matchStarted: (matchId: string) => void;

  matchCompleted: (matchId: string) => void;

  matchAborted: (matchId: string) => void;

  scoresheetUpdated: (teamId: string, scoresheetId: string) => void;

  scoresheetStatusChanged: (scoresheetId: string) => void;

  matchStatusChanged: (matchId: string) => void;
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

  updateRubric: (
    eventId: string,
    teamId: string,
    rubricId: string,
    rubricData: Partial<Rubric<JudgingCategory>>,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  joinRoom: (
    room: WSRoomName | Array<WSRoomName>,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  createTicket: (
    eventId: string,
    teamId: string,
    content: string,
    type: TicketType,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  updateTicket: (
    eventId: string,
    teamId: string,
    ticketId: string,
    ticketData: Partial<Ticket>,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  startMatch: (
    eventId: string,
    tableId: string,
    matchId: string,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  abortMatch: (
    eventId: string,
    tableId: string,
    matchId: string,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  updateScoresheet: (
    eventId: string,
    teamId: string,
    scoresheetId: string,
    scoresheetData: Partial<Rubric<JudgingCategory>>,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  changeMatchStatus: (
    matchId: string,
    ready: boolean,
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
