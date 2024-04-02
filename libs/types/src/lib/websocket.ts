import { WithId } from 'mongodb';
import { JudgingCategory, TicketType } from './constants';
import {
  RobotGameMatch,
  RobotGameMatchBrief,
  RobotGameMatchParticipant
} from './schemas/robot-game-match';
import { Rubric } from './schemas/rubric';
import { Ticket } from './schemas/ticket';
import { Team } from './schemas/team';
import { Scoresheet } from './schemas/scoresheet';
import { EventState, PresentationState } from './schemas/event-state';
import { JudgingSession } from './schemas/judging-session';
import { CoreValuesForm } from './schemas/core-values-form';
import { AudienceDisplayState } from './schemas/event-state';
import { JudgingRoom } from './schemas/judging-room';

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

  leadJudgeCalled: (room: JudgingRoom) => void;

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

  audienceDisplayUpdated: (eventState: EventState) => void;

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

  updateJudgingSession: (
    eventId: string,
    sessionId: string,
    data: Partial<Pick<JudgingSession, 'called' | 'queued'>>,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  callLeadJudge: (
    eventId: string,
    roomName: string,
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
    teamId: string | null,
    content: string,
    type: TicketType,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  updateTicket: (
    eventId: string,
    teamId: string | null,
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

  updateMatchBrief: (
    eventId: string,
    matchId: string,
    newBrief: Partial<Pick<RobotGameMatchBrief, 'called'>>,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  updateMatchTeams: (
    eventId: string,
    matchId: string,
    newTeams: Array<Partial<RobotGameMatchParticipant>>,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  updateMatchParticipant: (
    eventId: string,
    matchId: string,
    data: { teamId: string } & Partial<
      Pick<RobotGameMatchParticipant, 'present' | 'ready' | 'queued'>
    >,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  updateScoresheet: (
    eventId: string,
    teamId: string,
    scoresheetId: string,
    scoresheetData: Partial<Scoresheet>,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  updateAudienceDisplay: (
    eventId: string,
    newDisplayState: Partial<AudienceDisplayState>,
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
