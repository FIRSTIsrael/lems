import { gql, TypedDocumentNode } from '@apollo/client';

export interface RubricData {
  awards?: string[];
  fields: Record<string, number>;
  feedback?: {
    greatJob: string;
    thinkAbout: string;
  };
}

export interface RubricInfo {
  id: string;
  category: string;
  status: string;
  data: RubricData | null;
}

export interface TeamInfo {
  id: string;
  number: number;
  name: string;
  slug: string;
  divisionId: string;
}

export interface DivisionInfo {
  id: string;
  name: string;
  teams: TeamInfo[];
}

export interface GetTeamInfoData {
  event: {
    id: string;
    name: string;
    divisions: DivisionInfo[];
  };
}

export interface GetTeamInfoVariables {
  eventSlug: string;
  teamSlug: string;
}

export interface GetRubricsData {
  division: {
    id: string;
    name: string;
    judging: {
      awards: Array<{
        id: string;
        name: string;
      }>;
      rubrics: RubricInfo[];
    };
  };
}

export interface GetRubricsVariables {
  divisionId: string;
  teamId: string;
}

export const GET_TEAM_INFO_QUERY: TypedDocumentNode<GetTeamInfoData, GetTeamInfoVariables> = gql`
  query GetTeamInfo($eventSlug: String!, $teamSlug: String!) {
    event(slug: $eventSlug) {
      id
      name
      divisions {
        id
        name
        teams(slugs: [$teamSlug]) {
          id
          number
          name
          slug
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
