import { AwardNames } from '../constants';

export interface PortalEvent {
  id: string;
  name: string;
  date: Date;
  location: string;
  color: string;
  divisions?: PortalDivision[];
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
  place?: number;
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
  table: string;
  stage: string;
  round: number;
  number: number;
}

interface SessionActivity extends BaseActivity {
  type: 'session';
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
