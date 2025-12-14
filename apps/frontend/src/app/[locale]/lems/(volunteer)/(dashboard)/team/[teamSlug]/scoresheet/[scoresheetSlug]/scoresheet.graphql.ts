import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge, updateById, type Reconciler } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../../hooks/use-page-data';
import { getEmptyScoresheet } from './scoresheet-utils';

export interface ScoresheetData {
  missions: Record<string, Record<number, boolean | string | number | null>>;
  signature?: string;
  gp: {
    value: number | null;
    notes?: string;
  };
  score: number;
}

export interface ScoresheetItem {
  id: string;
  team: {
    id: string;
  };
  divisionId: string;
  slug: string;
  stage: string;
  round: number;
  status: string;
  escalated?: boolean;
  data: ScoresheetData;
}

type QueryResult = {
  division: {
    id: string;
    field: {
      scoresheets: ScoresheetItem[];
    };
  };
};

type QueryVariables = {
  divisionId: string;
  teamId: string;
  slug: string;
};

type MissionClauseMutationResult = {
  updateScoresheetMissionClause: {
    scoresheetId: string;
    missionId: string;
    clauseIndex: number;
    clauseValue: boolean | string | number | null;
    version: number;
  };
};

type StatusMutationResult = {
  updateScoresheetStatus: {
    scoresheetId: string;
    status: string;
    version: number;
  };
};

type GPMutationResult = {
  updateScoresheetGP: {
    scoresheetId: string;
    value: number | null;
    notes?: string;
    version: number;
  };
};

type EscalatedMutationResult = {
  updateScoresheetEscalated: {
    scoresheetId: string;
    escalated: boolean;
    version: number;
  };
};

type MissionClauseMutationVariables = {
  divisionId: string;
  scoresheetId: string;
  missionId: string;
  clauseIndex: number;
  value: boolean | string | number | null;
};

type StatusMutationVariables = {
  divisionId: string;
  scoresheetId: string;
  status: string;
};

type GPMutationVariables = {
  divisionId: string;
  scoresheetId: string;
  value: number | null;
  notes?: string;
};

type EscalatedMutationVariables = {
  divisionId: string;
  scoresheetId: string;
  escalated: boolean;
};

type ScoresheetMissionClauseUpdatedEvent = {
  __typename: 'ScoresheetMissionClauseUpdated';
  scoresheetId: string;
  missionId: string;
  clauseIndex: number;
  clauseValue: boolean | string | number | null;
  version: number;
};

type ScoresheetStatusUpdatedEvent = {
  __typename: 'ScoresheetStatusUpdated';
  scoresheetId: string;
  status: string;
  version: number;
};

type ScoresheetGPUpdatedEvent = {
  __typename: 'ScoresheetGPUpdated';
  scoresheetId: string;
  gpValue: number | null;
  notes?: string;
  version: number;
};

type ScoresheetEscalatedUpdatedEvent = {
  __typename: 'ScoresheetEscalatedUpdated';
  scoresheetId: string;
  escalated: boolean;
  version: number;
};

type ScoresheetUpdatedEvent =
  | ScoresheetMissionClauseUpdatedEvent
  | ScoresheetStatusUpdatedEvent
  | ScoresheetGPUpdatedEvent
  | ScoresheetEscalatedUpdatedEvent;

type SubscriptionResult = {
  scoresheetUpdated: ScoresheetUpdatedEvent;
};

type SubscriptionVariables = {
  divisionId: string;
  lastSeenVersion?: number;
};

export const GET_SCORESHEET_QUERY: TypedDocumentNode<QueryResult, QueryVariables> = gql`
  query GetScoresheet($divisionId: String!, $teamId: String!, $slug: String!) {
    division(id: $divisionId) {
      id
      field {
        scoresheets(teamIds: [$teamId], slug: $slug) {
          id
          team {
            id
          }
          divisionId
          slug
          stage
          round
          status
          escalated
          data {
            missions
            signature
            gp {
              value
              notes
            }
            score
          }
        }
      }
    }
  }
`;

/**
 * Subscription to listen for scoresheet updates in real-time
 * Handles mission clause updates, status changes, GP updates, and escalated flag changes
 */
export const SCORESHEET_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  SubscriptionResult,
  SubscriptionVariables
> = gql`
  subscription ScoresheetUpdated($divisionId: String!, $lastSeenVersion: Int) {
    scoresheetUpdated(divisionId: $divisionId, lastSeenVersion: $lastSeenVersion) {
      ... on ScoresheetMissionClauseUpdated {
        scoresheetId
        missionId
        clauseIndex
        clauseValue
        version
      }
      ... on ScoresheetStatusUpdated {
        scoresheetId
        status
        version
      }
      ... on ScoresheetGPUpdated {
        scoresheetId
        gpValue
        notes
        version
      }
      ... on ScoresheetEscalatedUpdated {
        scoresheetId
        escalated
        version
      }
    }
  }
`;

/**
 * Mutation to update a mission clause value in a scoresheet
 */
export const UPDATE_SCORESHEET_MISSION_CLAUSE_MUTATION: TypedDocumentNode<
  MissionClauseMutationResult,
  MissionClauseMutationVariables
> = gql`
  mutation UpdateScoresheetMissionClause(
    $divisionId: String!
    $scoresheetId: String!
    $missionId: String!
    $clauseIndex: Int!
    $value: JSON!
  ) {
    updateScoresheetMissionClause(
      divisionId: $divisionId
      scoresheetId: $scoresheetId
      missionId: $missionId
      clauseIndex: $clauseIndex
      value: $value
    ) {
      scoresheetId
      missionId
      clauseIndex
      clauseValue
      version
    }
  }
`;

/**
 * Mutation to update the status of a scoresheet
 */
export const UPDATE_SCORESHEET_STATUS_MUTATION: TypedDocumentNode<
  StatusMutationResult,
  StatusMutationVariables
> = gql`
  mutation UpdateScoresheetStatus(
    $divisionId: String!
    $scoresheetId: String!
    $status: ScoresheetStatus!
  ) {
    updateScoresheetStatus(divisionId: $divisionId, scoresheetId: $scoresheetId, status: $status) {
      scoresheetId
      status
      version
    }
  }
`;

/**
 * Mutation to update the Good Practices rating of a scoresheet
 */
export const UPDATE_SCORESHEET_GP_MUTATION: TypedDocumentNode<
  GPMutationResult,
  GPMutationVariables
> = gql`
  mutation UpdateScoresheetGP(
    $divisionId: String!
    $scoresheetId: String!
    $value: JSON
    $notes: String
  ) {
    updateScoresheetGP(
      divisionId: $divisionId
      scoresheetId: $scoresheetId
      value: $value
      notes: $notes
    ) {
      scoresheetId
      value
      notes
      version
    }
  }
`;

/**
 * Mutation to update the escalated flag of a scoresheet
 */
export const UPDATE_SCORESHEET_ESCALATED_MUTATION: TypedDocumentNode<
  EscalatedMutationResult,
  EscalatedMutationVariables
> = gql`
  mutation UpdateScoresheetEscalated(
    $divisionId: String!
    $scoresheetId: String!
    $escalated: Boolean!
  ) {
    updateScoresheetEscalated(
      divisionId: $divisionId
      scoresheetId: $scoresheetId
      escalated: $escalated
    ) {
      scoresheetId
      escalated
      version
    }
  }
`;

/**
 * Parses the query result to extract the first scoresheet.
 * If the scoresheet has no data, creates an empty scoresheet data object.
 */
export function parseScoresheetData(queryData: QueryResult): ScoresheetItem {
  const scoresheet = queryData.division.field.scoresheets[0];

  if (!scoresheet) {
    throw new Error('Scoresheet not found');
  }

  if (!scoresheet.data) {
    return {
      ...scoresheet,
      data: getEmptyScoresheet()
    };
  }

  return scoresheet;
}

/**
 * Reconciler for scoresheet updates.
 * Handles mission clause updates, status changes, GP updates, and escalated flag changes.
 */
const scoresheetUpdatedReconciler: Reconciler<QueryResult, SubscriptionResult> = (
  prev,
  { data }
) => {
  if (!data?.scoresheetUpdated) {
    return prev;
  }

  const event = data.scoresheetUpdated;
  const { scoresheetId } = event;

  return merge(prev, {
    division: {
      field: {
        scoresheets: updateById(prev.division.field.scoresheets, scoresheetId, scoresheet => {
          if (event.__typename === 'ScoresheetMissionClauseUpdated') {
            return merge(scoresheet, {
              data: merge(scoresheet.data || getEmptyScoresheet(), {
                missions: {
                  ...(scoresheet.data?.missions || {}),
                  [event.missionId]: {
                    ...(scoresheet.data?.missions?.[event.missionId] || {}),
                    [event.clauseIndex]: event.clauseValue
                  }
                }
              })
            });
          }

          if (event.__typename === 'ScoresheetStatusUpdated') {
            return merge(scoresheet, {
              status: event.status
            });
          }

          if (event.__typename === 'ScoresheetGPUpdated') {
            return merge(scoresheet, {
              data: merge(scoresheet.data || getEmptyScoresheet(), {
                gp: {
                  value: event.gpValue,
                  notes: event.notes
                }
              })
            });
          }

          if (event.__typename === 'ScoresheetEscalatedUpdated') {
            return merge(scoresheet, {
              escalated: event.escalated
            });
          }

          return scoresheet;
        })
      }
    }
  });
};

/**
 * Creates a subscription configuration for scoresheet updates.
 * Handles mission clause updates, status changes, GP updates, and escalated flag changes.
 *
 * @param divisionId - The division ID to subscribe to
 * @returns Subscription configuration for use with usePageData hook
 */
export function createScoresheetUpdatedSubscription(
  divisionId: string
): SubscriptionConfig<unknown, QueryResult, SubscriptionVariables> {
  return {
    subscription: SCORESHEET_UPDATED_SUBSCRIPTION,
    subscriptionVariables: {
      divisionId
    },
    updateQuery: scoresheetUpdatedReconciler as (
      prev: QueryResult,
      subscriptionData: { data?: unknown }
    ) => QueryResult
  };
}
