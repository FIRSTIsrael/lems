import { gql, TypedDocumentNode, ApolloCache } from '@apollo/client';
import type { TeamEvent } from '../types';

interface TeamArrivedMutationData {
  teamArrived: TeamEvent;
}

interface TeamArrivedMutationVars {
  teamId: string;
  divisionId: string;
}

export const TEAM_ARRIVED_MUTATION: TypedDocumentNode<
  TeamArrivedMutationData,
  TeamArrivedMutationVars
> = gql`
  mutation TeamArrived($teamId: String!, $divisionId: String!) {
    teamArrived(teamId: $teamId, divisionId: $divisionId) {
      teamId
    }
  }
`;

export function createTeamArrivedCacheUpdate(teamId: string) {
  return (cache: ApolloCache) => {
    cache.modify({
      id: cache.identify({ __typename: 'Team', id: teamId }),
      fields: {
        arrived() {
          return true;
        }
      }
    });
  };
}
