import { gql, TypedDocumentNode } from '@apollo/client';
import type {
  GetTeamInfoData,
  GetTeamInfoVariables,
  GetRubricsData,
  GetRubricsVariables
} from './types';

export const GET_TEAM_INFO_QUERY: TypedDocumentNode<GetTeamInfoData, GetTeamInfoVariables> = gql`
  query GetTeamInfo($eventSlug: String!, $teamSlug: String!) {
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

export const GET_RUBRICS_QUERY: TypedDocumentNode<GetRubricsData, GetRubricsVariables> = gql`
  query GetRubrics($divisionId: String!, $teamId: String!) {
    division(id: $divisionId) {
      id
      name
      judging {
        awards(allowNominations: true) {
          id
          name
        }
        rubrics(teamIds: [$teamId]) {
          id
          category
          status
          data {
            awards
            fields
            feedback {
              greatJob
              thinkAbout
            }
          }
        }
      }
    }
  }
`;
