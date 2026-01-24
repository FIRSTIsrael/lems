import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { QueryData } from '../types';

export interface ScoresheetMissionClauseUpdated {
  __typename: 'ScoresheetMissionClauseUpdated';
  scoresheetId: string;
  missionId: string;
  clauseIndex: number;
  clauseValue: unknown;
  score: number;
}

export interface ScoresheetStatusUpdated {
  __typename: 'ScoresheetStatusUpdated';
  scoresheetId: string;
  status: string;
  escalated: boolean;
}

export interface ScoresheetGPUpdated {
  __typename: 'ScoresheetGPUpdated';
  scoresheetId: string;
  gpValue: number | null;
  notes?: string;
}

export interface ScoresheetEscalatedUpdated {
  __typename: 'ScoresheetEscalatedUpdated';
  scoresheetId: string;
  escalated: boolean;
}

export interface ScoresheetSignatureUpdated {
  __typename: 'ScoresheetSignatureUpdated';
  scoresheetId: string;
  signature: string | null;
  status: string;
}

export interface ScoresheetResetEvent {
  __typename: 'ScoresheetResetEvent';
  scoresheetId: string;
  status: string;
}

export type ScoresheetUpdatedEvent =
  | ScoresheetMissionClauseUpdated
  | ScoresheetStatusUpdated
  | ScoresheetGPUpdated
  | ScoresheetEscalatedUpdated
  | ScoresheetSignatureUpdated
  | ScoresheetResetEvent;

export interface ScoresheetUpdatedSubscriptionData {
  scoresheetUpdated: ScoresheetUpdatedEvent;
}

interface SubscriptionVars {
  divisionId: string;
}

export const SCORESHEET_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  ScoresheetUpdatedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription ScoresheetUpdated($divisionId: String!) {
    scoresheetUpdated(divisionId: $divisionId) {
      __typename
      ... on ScoresheetMissionClauseUpdated {
        scoresheetId
        missionId
        clauseIndex
        clauseValue
        score
      }
      ... on ScoresheetStatusUpdated {
        scoresheetId
        status
        escalated
      }
      ... on ScoresheetGPUpdated {
        scoresheetId
        gpValue
        notes
      }
      ... on ScoresheetEscalatedUpdated {
        scoresheetId
        escalated
      }
      ... on ScoresheetSignatureUpdated {
        scoresheetId
        signature
        status
      }
      ... on ScoresheetResetEvent {
        scoresheetId
        status
      }
    }
  }
`;

export function createScoresheetUpdatedSubscription(divisionId: string) {
  return {
    subscription: SCORESHEET_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: QueryData, { data }: { data?: unknown }) => {
      if (!prev.division || !data) return prev;

      const event = (data as ScoresheetUpdatedSubscriptionData).scoresheetUpdated;
      const { scoresheetId } = event;

      return merge(prev, {
        division: {
          id: prev.division.id,
          teams: prev.division.teams.map(team => {
            const scoresheet = team.scoresheets.find(s => s.id === scoresheetId);
            if (!scoresheet) return team;

            // Handle mission clause updates - update score
            if (event.__typename === 'ScoresheetMissionClauseUpdated') {
              return merge(team, {
                scoresheets: team.scoresheets.map(s =>
                  s.id === scoresheetId
                    ? merge(s, {
                        data: merge(s.data || { score: 0 }, {
                          score: event.score
                        })
                      })
                    : s
                )
              });
            }

            // Handle status updates
            if (
              event.__typename === 'ScoresheetStatusUpdated' ||
              event.__typename === 'ScoresheetSignatureUpdated' ||
              event.__typename === 'ScoresheetResetEvent'
            ) {
              return merge(team, {
                scoresheets: team.scoresheets.map(s =>
                  s.id === scoresheetId
                    ? merge(s, {
                        status: event.status
                      })
                    : s
                )
              });
            }

            return team;
          })
        }
      });
    }
  };
}
