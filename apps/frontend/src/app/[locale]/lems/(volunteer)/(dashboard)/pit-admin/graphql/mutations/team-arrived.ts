import { gql, TypedDocumentNode, ApolloCache } from '@apollo/client';
import { merge, updateById } from '@lems/shared/utils';
import type { TeamEvent, Team } from '../types';

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
      version
    }
  }
`;

export function createTeamArrivedCacheUpdate(teamId: string) {
  return (cache: ApolloCache) => {
    cache.modify({
      fields: {
        division(existingDivision = {}) {
          const division = existingDivision as { teams?: Team[] };
          if (!division.teams) {
            return existingDivision;
          }
          return merge(existingDivision, {
            teams: updateById(division.teams, teamId, team => merge(team, { arrived: true }))
          });
        }
      }
    });
  };
}
