import { ObjectId } from 'mongodb';
import { AwardNames, Status } from '../constants';

export interface PortalEvent {
  id: string;
  name: string;
  date: Date;
  location: string;
  color: string;
  divisions?: PortalDivision[];
  isDivision?: boolean;
  subtitle?: string;
}

export interface PortalEventStatus {
  isLive: boolean;
  isCompleted: boolean;
  field: {
    stage: 'practice' | 'ranking';
    round: number;
    match: {
      number: number;
      time: Date;
    };
  };
  judging: {
    session: {
      number: number;
      time: Date;
    };
  };
}

export interface PortalDivision {
  id: string;
  name: string;
  color: string;
}

export interface PortalTeam {
  id: string;
  name: string;
  number: number;
  affiliation: {
    name: string;
    city: string;
  };
}

export interface PortalAward {
  name: AwardNames;
  place: number;
  winner?: PortalTeam | string;
}

export interface PortalScore {
  scores: number[];
  maxScore: number;
  team: PortalTeam;
}

interface BaseActivity {
  time: Date;
}

interface MatchActivity extends BaseActivity {
  type: 'match';
  status: Status;
  table: string;
  stage: string;
  round: number;
  number: number;
}

interface SessionActivity extends BaseActivity {
  type: 'session';
  status: Status;
  room: string;
  number: number;
}

interface GeneralActivity extends BaseActivity {
  type: 'general';
  name: string;
}

export type PortalActivity<T extends 'match' | 'session' | 'general'> = T extends 'match'
  ? MatchActivity
  : T extends 'session'
    ? SessionActivity
    : GeneralActivity;

export interface PortalSchedule {
  columns: { id: string; name: string }[];
  rows: Record<
    string,
    {
      number: number;
      data: ((PortalTeam & { column: string }) | null)[];
    }
  >;
}

export interface PortalJudgingSchedule extends PortalSchedule {
  type: 'judging';
}

export interface PortalFieldSchedule {
  type: 'field';
  rounds: {
    stage: 'practice' | 'ranking';
    number: number;
    schedule: PortalSchedule;
  }[];
}
