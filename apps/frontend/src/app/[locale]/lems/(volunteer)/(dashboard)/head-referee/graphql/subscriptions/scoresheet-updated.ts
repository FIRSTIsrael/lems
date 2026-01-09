import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, updateById } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { HeadRefereeData, ScoresheetStatus } from '../types';

export interface ScoresheetUpdatedSubscriptionData {
  scoresheetUpdated:
    | ScoresheetMissionClauseUpdated
    | ScoresheetStatusUpdated
    | ScoresheetGPUpdated
    | ScoresheetEscalatedUpdated
    | ScoresheetSignatureUpdated
    | ScoresheetResetEvent;
}

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

export interface SubscriptionVars {
  divisionId: string;
}

export const SCORESHEET_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  ScoresheetUpdatedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription ScoresheetUpdated($divisionId: String!) {
    scoresheetUpdated(divisionId: $divisionId) {
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

/**
 * Creates a subscription configuration for all scoresheet updates in the head referee view.
 * Handles updates to mission clauses, status, GP rating, escalation, signature, and resets.
 *
 * @param divisionId - The division ID to subscribe to
 * @returns Subscription configuration for use with usePageData hook
 */
export function createScoresheetUpdatedSubscription(divisionId: string) {
  return {
    subscription: SCORESHEET_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: HeadRefereeData, { data }: { data?: unknown }) => {
      if (!prev.division?.field?.scoresheets || !data) return prev;

      const event = (data as ScoresheetUpdatedSubscriptionData).scoresheetUpdated;
      const scoresheetId = event.scoresheetId;

      switch (event.__typename) {
        case 'ScoresheetMissionClauseUpdated': {
          return merge(prev, {
            division: {
              field: {
                scoresheets: updateById(
                  prev.division.field.scoresheets,
                  scoresheetId,
                  scoresheet => ({
                    ...scoresheet,
                    data: scoresheet.data
                      ? {
                          ...scoresheet.data,
                          score: event.score
                        }
                      : { score: event.score, gp: null }
                  })
                )
              }
            }
          });
        }

        case 'ScoresheetStatusUpdated': {
          return merge(prev, {
            division: {
              field: {
                scoresheets: updateById(
                  prev.division.field.scoresheets,
                  scoresheetId,
                  scoresheet => ({
                    ...scoresheet,
                    status: event.status as ScoresheetStatus
                  })
                )
              }
            }
          });
        }

        case 'ScoresheetGPUpdated': {
          return merge(prev, {
            division: {
              field: {
                scoresheets: updateById(
                  prev.division.field.scoresheets,
                  scoresheetId,
                  scoresheet => ({
                    ...scoresheet,
                    data: scoresheet.data
                      ? {
                          ...scoresheet.data,
                          gp: event.gpValue !== null ? { value: event.gpValue as 2 | 3 | 4 } : null
                        }
                      : {
                          score: 0,
                          gp: event.gpValue !== null ? { value: event.gpValue as 2 | 3 | 4 } : null
                        }
                  })
                )
              }
            }
          });
        }

        case 'ScoresheetEscalatedUpdated': {
          return merge(prev, {
            division: {
              field: {
                scoresheets: updateById(
                  prev.division.field.scoresheets,
                  scoresheetId,
                  scoresheet => ({
                    ...scoresheet,
                    escalated: event.escalated
                  })
                )
              }
            }
          });
        }

        case 'ScoresheetSignatureUpdated': {
          return merge(prev, {
            division: {
              field: {
                scoresheets: updateById(
                  prev.division.field.scoresheets,
                  scoresheetId,
                  scoresheet => ({
                    ...scoresheet,
                    status: event.status as ScoresheetStatus
                  })
                )
              }
            }
          });
        }

        case 'ScoresheetResetEvent': {
          return merge(prev, {
            division: {
              field: {
                scoresheets: updateById(
                  prev.division.field.scoresheets,
                  scoresheetId,
                  scoresheet => ({
                    ...scoresheet,
                    status: event.status as ScoresheetStatus,
                    escalated: false,
                    data: null
                  })
                )
              }
            }
          });
        }

        default:
          return prev;
      }
    }
  } as SubscriptionConfig<unknown, HeadRefereeData, SubscriptionVars>;
}
