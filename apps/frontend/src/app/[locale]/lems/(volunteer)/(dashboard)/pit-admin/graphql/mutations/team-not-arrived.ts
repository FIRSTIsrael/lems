import { gql, TypedDocumentNode, ApolloCache } from '@apollo/client';
import type { TeamEvent } from '../types';

interface TeamNotArrivedMutationData {
  teamNotArrived: TeamEvent;
}

interface TeamNotArrivedMutationVars {
  teamId: string;
  divisionId: string;
}

export const TEAM_NOT_ARRIVED_MUTATION: TypedDocumentNode<
  TeamNotArrivedMutationData,
  TeamNotArrivedMutationVars
> = gql`
  mutation TeamNotArrived($teamId: String!, $divisionId: String!) {
    teamNotArrived(teamId: $teamId, divisionId: $divisionId) {
      teamId
    }
  }
`;

export function createTeamNotArrivedCacheUpdate(teamId: string) {
  return (cache: ApolloCache) => {
    cache.modify({
      id: cache.identify({ __typename: 'Team', id: teamId }),
      fields: {
        arrived() {
          return false;
        }
      }
    });
  };
}
