import { WithId } from 'mongodb';
import { JudgingCategory, TicketType } from './constants';
import { RobotGameMatch, RobotGameMatchParticipant } from './schemas/robot-game-match';
import { Rubric } from './schemas/rubric';
import { Ticket } from './schemas/ticket';
import { Team } from './schemas/team';
import { Scoresheet } from './schemas/scoresheet';
import { EventState, PresentationState } from './schemas/event-state';
import { JudgingSession } from './schemas/judging-session';
import { CoreValuesForm } from './schemas/core-values-form';
import { AudienceDisplayState } from './constants';

export type WSRoomName = 'judging' | 'field' | 'pit-admin' | 'audience-display';

interface EventsMap {
  [event: string]: any;
}

type EventNames<Map extends EventsMap> = keyof Map & (string | symbol);

export interface WSServerEmittedEvents {
  judgingSessionStarted: (session: JudgingSession, eventState: EventState) => void;

  judgingSessionCompleted: (session: JudgingSession) => void;

  judgingSessionAborted: (session: JudgingSession) => void;

  judgingSessionUpdated: (session: JudgingSession) => void;

  rubricUpdated: (rubric: Rubric<JudgingCategory>) => void;

  rubricStatusChanged: (rubric: Rubric<JudgingCategory>) => void;

  cvFormCreated: (cvForm: WithId<CoreValuesForm>) => void;

  cvFormUpdated: (cvForm: WithId<CoreValuesForm>) => void;

  teamRegistered: (team: WithId<Team>) => void;

  ticketCreated: (ticket: WithId<Ticket>) => void;

  ticketUpdated: (ticket: WithId<Ticket>) => void;

  matchLoaded: (match: RobotGameMatch, eventState: EventState) => void;

  matchStarted: (match: RobotGameMatch, eventState: EventState) => void;

  matchEndgame: (match: RobotGameMatch) => void;

  matchCompleted: (match: RobotGameMatch, eventState: EventState) => void;

  matchAborted: (match: RobotGameMatch, eventState: EventState) => void;

  matchUpdated: (match: RobotGameMatch) => void;

  scoresheetUpdated: (scoresheet: Scoresheet) => void;

  scoresheetStatusChanged: (scoresheet: Scoresheet) => void;

  audienceDisplayStateUpdated: (eventState: EventState) => void;

  audienceDisplayMessageUpdated: (eventState: EventState) => void;

  presentationUpdated: (eventState: EventState) => void;
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

  updateJudgingSessionTeam: (
    eventId: string,
    sessionId: string,
    teamId: string | null,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  createCvForm: (
    eventId: string,
    content: CoreValuesForm,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  updateCvForm: (
    eventId: string,
    cvFormId: string,
    content: Partial<CoreValuesForm>,
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

  updateMatchTeams: (
    eventId: string,
    matchId: string,
    newTeams: Array<Partial<RobotGameMatchParticipant>>,
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

  updateAudienceDisplayMessage: (
    eventId: string,
    newDisplayState: AudienceDisplayState,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  updatePresentation: (
    eventId: string,
    presentationId: string,
    newPresentationState: Partial<PresentationState>,
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
  name: EventNames<WSServerEmittedEvents> | EventNames<WSClientEmittedEvents>;
  handler: (...args: any[]) => void | Promise<void>;
}
