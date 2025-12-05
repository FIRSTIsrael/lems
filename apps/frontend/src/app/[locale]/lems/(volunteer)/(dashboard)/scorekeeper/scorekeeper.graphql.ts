import { gql, TypedDocumentNode } from '@apollo/client';

export type MatchStage = 'PRACTICE' | 'RANKING' | 'TEST';
export type MatchStatus = 'not-started' | 'in-progress' | 'completed';

export interface MatchParticipant {
  team: {
    id: string;
    name: string;
    number: number;
  } | null;
  table: {
    id: string;
    name: string;
  };
}

export interface Match {
  id: string;
  slug: string;
  stage: MatchStage;
  round: number;
  number: number;
  scheduledTime: string;
  status: MatchStatus;
  participants: MatchParticipant[];
}

export interface ScorekeeperData {
  division: {
    id: string;
    field: {
      matches: Match[];
      currentStage: MatchStage;
      loadedMatch: string | null;
      activeMatch: string | null;
      matchLength: number;
    };
  };
}

export interface ScorekeeperVars {
  divisionId: string;
}

export const GET_SCOREKEEPER_DATA: TypedDocumentNode<ScorekeeperData, ScorekeeperVars> = gql`
  query GetScorekeeperData($divisionId: String!) {
    division(id: $divisionId) {
      id
      field {
        matches {
          id
          slug
          stage
          round
          number
          scheduledTime
          status
          participants {
            team {
              id
              name
              number
            }
            table {
              id
              name
            }
          }
        }
        currentStage
        loadedMatch
        activeMatch
        matchLength
      }
    }
  }
`;
