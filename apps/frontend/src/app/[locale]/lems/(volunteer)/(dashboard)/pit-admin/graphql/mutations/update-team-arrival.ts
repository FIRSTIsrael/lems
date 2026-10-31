import { gql, TypedDocumentNode, ApolloCache } from '@apollo/client';
import type { TeamArrivalEvent } from '../types';

interface UpdateTeamArrivalMutationData {
  updateTeamArrival: TeamArrivalEvent;
}

interface UpdateTeamArrivalMutationVars {
  teamId: string;
  divisionId: string;
  arrived: boolean;
}

export const UPDATE_TEAM_ARRIVAL_MUTATION: TypedDocumentNode<
  UpdateTeamArrivalMutationData,
  UpdateTeamArrivalMutationVars
> = gql`
  mutation UpdateTeamArrival($teamId: String!, $divisionId: String!, $arrived: Boolean!) {
    updateTeamArrival(teamId: $teamId, divisionId: $divisionId, arrived: $arrived) {
      teamId
      arrived
    }
  }
`;

export function createTeamArrivalCacheUpdate(teamId: string, arrived: boolean) {
  return (cache: ApolloCache) => {
    cache.modify({
      id: cache.identify({ __typename: 'Team', id: teamId }),
      fields: {
        arrived() {
          return arrived;
        }
      }
    });
  };
}
