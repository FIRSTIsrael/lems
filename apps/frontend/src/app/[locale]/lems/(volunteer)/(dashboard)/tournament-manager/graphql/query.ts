import { gql, TypedDocumentNode } from '@apollo/client';
import type { TournamentManagerData, TournamentManagerVars } from './types';

export const GET_TOURNAMENT_MANAGER_DATA: TypedDocumentNode<
  TournamentManagerData,
  TournamentManagerVars
> = gql`
  query GetTournamentManagerData($divisionId: String!) {
    division(id: $divisionId) {
      id
      name
      teams {
        id
        number
        name
        slug
        affiliation
        city
      }
      tables {
        id
        name
      }
      rooms {
        id
        name
      }
      field {
        divisionId
        matches {
          id
          slug
          stage
          round
          number
          scheduledTime
          status
          participants {
            id
            team {
              id
              number
              name
              slug
              affiliation
              city
            }
            table {
              id
              name
            }
          }
        }
        loadedMatch
        activeMatch
      }
      judging {
        divisionId
        sessionLength
        sessions {
          id
          number
          scheduledTime
          status
          called
          room {
            id
            name
          }
          team {
            id
            number
            name
            slug
            affiliation
            city
          }
        }
      }
    }
  }
`;
