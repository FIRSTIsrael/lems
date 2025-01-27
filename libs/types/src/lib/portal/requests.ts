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
