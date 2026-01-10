export interface TeamWinner {
  id: string;
  name: string;
  number: number;
  affiliation: {
    id: string;
    name: string;
    city: string;
  } | null;
}

export interface PersonalWinner {
  id: string;
  name: string;
  team: {
    id: string;
    number: number;
    name: string;
  };
}

export interface Award {
  id: string;
  name: string;
  index: number;
  place: number;
  type: 'PERSONAL' | 'TEAM';
  isOptional: boolean;
  winner?: TeamWinner | PersonalWinner | null;
}

export interface AwardsData {
  division: {
    id: string;
    field: {
      judging: {
        awards: Award[];
      } | null;
    };
  };
}

export interface AwardsVars {
  divisionId: string;
}

export function parseAwardsData(data: AwardsData) {
  return data.division.field.judging?.awards ?? [];
}
