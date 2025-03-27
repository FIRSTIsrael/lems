import { WithId } from 'mongodb';
import { AwardNames, JudgingCategory, TicketType } from './constants';
import {
  RobotGameMatch,
  RobotGameMatchBrief,
  RobotGameMatchParticipant
} from './schemas/robot-game-match';
import { Rubric } from './schemas/rubric';
import { Ticket } from './schemas/ticket';
import { Team } from './schemas/team';
import { Scoresheet } from './schemas/scoresheet';
import { DivisionState, PresentationState } from './schemas/division-state';
import { JudgingSession } from './schemas/judging-session';
import { JudgingDeliberation } from './schemas/deliberation';
import { CoreValuesForm } from './schemas/core-values-form';
import { AudienceDisplayState } from './schemas/division-state';
import { JudgingRoom } from './schemas/judging-room';
import { Award } from './schemas/award';

export type WSRoomName = 'judging' | 'field' | 'pit-admin' | 'audience-display';

interface DivisionsMap {
  [division: string]: any;
}

type DivisionNames<Map extends DivisionsMap> = keyof Map & (string | symbol);

export interface WSServerEmittedEvents {
  judgingSessionStarted: (session: JudgingSession, divisionState: DivisionState) => void;

  judgingSessionCompleted: (session: JudgingSession) => void;

  judgingSessionAborted: (session: JudgingSession) => void;

  judgingSessionFinished: (session: JudgingSession) => void;

  judgingSessionUpdated: (session: JudgingSession) => void;

  judgingDeliberationStarted: (deliberation: JudgingDeliberation) => void;

  judgingDeliberationCompleted: (deliberation: JudgingDeliberation) => void;

  judgingDeliberationUpdated: (deliberation: JudgingDeliberation) => void;

  judgingDeliberationStatusChanged: (deliberation: JudgingDeliberation) => void;

  leadJudgeCalled: (room: JudgingRoom) => void;

  rubricUpdated: (rubric: Rubric<JudgingCategory>) => void;

  rubricStatusChanged: (rubric: Rubric<JudgingCategory>) => void;

  cvFormCreated: (cvForm: WithId<CoreValuesForm>) => void;

  cvFormUpdated: (cvForm: WithId<CoreValuesForm>) => void;

  teamRegistered: (team: WithId<Team>) => void;

  ticketCreated: (ticket: WithId<Ticket>) => void;

  ticketUpdated: (ticket: WithId<Ticket>) => void;

  matchLoaded: (match: RobotGameMatch, divisionState: DivisionState) => void;

  matchStarted: (match: RobotGameMatch, divisionState: DivisionState) => void;

  matchEndgame: (match: RobotGameMatch) => void;

  matchCompleted: (match: RobotGameMatch, divisionState: DivisionState) => void;

  matchAborted: (match: RobotGameMatch, divisionState: DivisionState) => void;

  matchUpdated: (match: RobotGameMatch) => void;

  scoresheetUpdated: (scoresheet: Scoresheet) => void;

  scoresheetEscalated: (scoresheet: Scoresheet) => void;

  audienceDisplayUpdated: (divisionState: DivisionState) => void;

  presentationUpdated: (divisionState: DivisionState) => void;

  awardsUpdated: (awards: Array<WithId<Award>>) => void;
}

export interface WSClientEmittedEvents {
  startJudgingSession: (
    divisionId: string,
    roomId: string,
    sessionId: string,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  abortJudgingSession: (
    divisionId: string,
    roomId: string,
    sessionId: string,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;


  finishJudgingSession: (
    divisionId: string,
    roomId: string,
    sessionId: string,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;


  updateJudgingSessionTeam: (
    divisionId: string,
    sessionId: string,
    teamId: string | null,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  updateJudgingSession: (
    divisionId: string,
    sessionId: string,
    data: Partial<Pick<JudgingSession, 'called' | 'queued'>>,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  startJudgingDeliberation: (
    divisionId: string,
    deliberationId: string,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  updateJudgingDeliberation: (
    divisionId: string,
    deliberationId: string,
    data: Partial<JudgingDeliberation>,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  completeJudgingDeliberation: (
    divisionId: string,
    deliberationId: string,
    data: Partial<JudgingDeliberation>,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  updateAwardWinners: (
    divisionId: string,
    data: { [key in AwardNames]?: Array<WithId<Team> | string> },
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  disqualifyTeam: (
    divisionId: string,
    teamId: string,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  advanceTeams: (
    divisionId: string,
    teams: Array<WithId<Team>>,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  callLeadJudge: (
    divisionId: string,
    roomName: string,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  createCvForm: (
    divisionId: string,
    content: CoreValuesForm,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  updateCvForm: (
    divisionId: string,
    cvFormId: string,
    content: Partial<CoreValuesForm>,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  registerTeam: (
    divisionId: string,
    teamId: string,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  updateRubric: (
    divisionId: string,
    teamId: string,
    rubricId: string,
    rubricData: Partial<Rubric<JudgingCategory>>,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  joinRoom: (
    room: WSRoomName | Array<WSRoomName>,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  pingRooms: (
    callback: (response: { rooms: Array<string>; ok: boolean; error?: string }) => void
  ) => void;

  createTicket: (
    divisionId: string,
    teamId: string | null,
    content: string,
    type: TicketType,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  updateTicket: (
    divisionId: string,
    teamId: string | null,
    ticketId: string,
    ticketData: Partial<Ticket>,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  loadMatch: (
    divisionId: string,
    matchId: string,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  startMatch: (
    divisionId: string,
    matchId: string,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  startTestMatch: (
    divisionId: string,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  abortMatch: (
    divisionId: string,
    matchId: string,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  updateMatchBrief: (
    divisionId: string,
    matchId: string,
    newBrief: Partial<Pick<RobotGameMatchBrief, 'called'>>,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  updateMatchTeams: (
    divisionId: string,
    matchId: string,
    newTeams: Array<Partial<RobotGameMatchParticipant>>,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  switchMatchTeams: (
    divisionId: string,
    fromMatchId: string,
    toMatchId: string,
    participantIndex: number,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  mergeMatches: (
    divisionId: string,
    fromMatchId: string,
    toMatchId: string,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  updateMatchParticipant: (
    divisionId: string,
    matchId: string,
    data: { teamId: string } & Partial<
      Pick<RobotGameMatchParticipant, 'present' | 'ready' | 'queued'>
    >,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  updateScoresheet: (
    divisionId: string,
    teamId: string,
    scoresheetId: string,
    scoresheetData: Partial<Scoresheet>,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  updateAudienceDisplay: (
    divisionId: string,
    newDisplayState: Partial<AudienceDisplayState>,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;

  updatePresentation: (
    divisionId: string,
    presentationId: string,
    newPresentationState: Partial<PresentationState>,
    callback: (response: { ok: boolean; error?: string }) => void
  ) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type
export interface WSInterServerEvents {
  // ...
}

export interface WSSocketData {
  rooms: Array<WSRoomName>;
}

export interface WSEventListener {
  name: DivisionNames<WSServerEmittedEvents> | DivisionNames<WSClientEmittedEvents>;
  handler: (...args: any[]) => void | Promise<void>;
}
