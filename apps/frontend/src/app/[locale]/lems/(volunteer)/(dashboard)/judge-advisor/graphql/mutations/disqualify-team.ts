import { gql, TypedDocumentNode } from '@apollo/client';

interface DisqualifyTeamVars {
  teamId: string;
  divisionId: string;
}

interface DisqualifyTeamData {
  disqualifyTeam: {
    teamId: string;
  };
}

export const DISQUALIFY_TEAM: TypedDocumentNode<DisqualifyTeamData, DisqualifyTeamVars> = gql`
  mutation DisqualifyTeam($teamId: String!, $divisionId: String!) {
    disqualifyTeam(teamId: $teamId, divisionId: $divisionId) {
      teamId
    }
  }
`;
