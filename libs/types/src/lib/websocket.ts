import { WithId } from 'mongodb';
import { JudgingCategory, TicketType } from './constants';
import { RobotGameMatch, RobotGameMatchParticipant } from './schemas/robot-game-match';
import { Rubric } from './schemas/rubric';
import { Ticket } from './schemas/ticket';
import { Team } from './schemas/team';
import { Scoresheet } from './schemas/scoresheet';
import { EventState } from './schemas/event-state';
import { JudgingSession } from './schemas/judging-session';
import { AudienceDisplayState } from './constants';

export type WSRoomName = 'judging' | 'field' | 'pit-admin';

interface EventsMap {
  [event: string]: any;
}

type EventNames<Map extends EventsMap> = keyof Map & (string | symbol);

export interface WSServerEmittedEvents {
  judgingSessionStarted: (session: JudgingSession, eventState: EventState) => void;

  judgingSessionCompleted: (session: JudgingSession) => void;

  judgingSessionAborted: (session: JudgingSession) => void;

  rubricUpdated: (rubric: Rubric<JudgingCategory>) => void;

  rubricStatusChanged: (rubric: Rubric<JudgingCategory>) => void;

  teamRegistered: (team: WithId<Team>) => void;

  ticketCreated: (ticket: WithId<Ticket>) => void;

  ticketUpdated: (ticket: WithId<Ticket>) => void;

  matchLoaded: (match: RobotGameMatch, eventState: EventState) => void;

  matchStarted: (match: RobotGameMatch, eventState: EventState) => void;

  matchCompleted: (match: RobotGameMatch, eventState: EventState) => void;

  matchAborted: (match: RobotGameMatch, eventState: EventState) => void;

  matchParticipantPrestarted: (match: RobotGameMatch) => void;

  scoresheetUpdated: (scoresheet: Scoresheet) => void;

  scoresheetStatusChanged: (scoresheet: Scoresheet) => void;

  audienceDisplayStateUpdated: (eventState: EventState) => void;
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

  loadMatch: (
    eventId: string,
    matchId: string,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  startMatch: (
    eventId: string,
    matchId: string,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  startTestMatch: (
    eventId: string,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  abortMatch: (
    eventId: string,
    matchId: string,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  prestartMatchParticipant: (
    eventId: string,
    matchId: string,
    data: { teamId: string } & Partial<Pick<RobotGameMatchParticipant, 'present' | 'ready'>>,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  updateScoresheet: (
    eventId: string,
    teamId: string,
    scoresheetId: string,
    scoresheetData: Partial<Scoresheet>,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  updateAudienceDisplayState: (
    eventId: string,
    newDisplayState: AudienceDisplayState,
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
