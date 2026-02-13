import { gql, type TypedDocumentNode } from '@apollo/client';
import type {
  GetScoresheetsData,
  GetScoresheetsVariables,
  GetTeamInfoData,
  GetTeamInfoVariables
} from './types';

export const GET_TEAM_INFO_QUERY: TypedDocumentNode<GetTeamInfoData, GetTeamInfoVariables> = gql`
  query GetTeamInfoForScoresheetsExport($eventSlug: String!, $teamSlug: String!) {
    event(slug: $eventSlug) {
      id
      name
      seasonName
      divisions {
        id
        name
        teams(slugs: [$teamSlug]) {
          id
          number
          name
          slug
          logoUrl
        }
      }
    }
  }
`;

export const GET_SCORESHEETS_QUERY: TypedDocumentNode<GetScoresheetsData, GetScoresheetsVariables> =
  gql`
    query GetScoresheetsForExport($divisionId: String!, $teamId: String!) {
      division(id: $divisionId) {
        id
        name
        teams(ids: [$teamId]) {
          id
          number
          name
          scoresheets(stage: RANKING) {
            id
            slug
            stage
            round
            status
            escalated
            data {
              missions
              score
            }
          }
        }
      }
    }
  `;
