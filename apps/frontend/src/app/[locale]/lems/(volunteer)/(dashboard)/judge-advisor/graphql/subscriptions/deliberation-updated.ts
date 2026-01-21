import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge, type Reconciler } from '@lems/shared/utils';
import type { QueryData } from '../types';

type DeliberationUpdatedEvent =
  | {
      __typename: 'DeliberationPicklistUpdated';
      deliberationId: string;
      picklist: string[];
    }
  | {
      __typename: 'DeliberationStarted';
      deliberationId: string;
      startTime: string;
    }
  | {
      __typename: 'DeliberationCompleted';
      deliberationId: string;
      completed: boolean;
    };

export const DELIBERATION_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  {
    deliberationUpdated: DeliberationUpdatedEvent;
  },
  {
    divisionId: string;
  }
> = gql`
  subscription DeliberationUpdated($divisionId: String!) {
    deliberationUpdated(divisionId: $divisionId) {
      __typename
      ... on DeliberationPicklistUpdated {
        deliberationId
        picklist
      }
      ... on DeliberationStarted {
        deliberationId
        startTime
      }
      ... on DeliberationCompleted {
        deliberationId
        completed
      }
    }
  }
`;

const deliberationUpdatedReconciler: Reconciler<
  QueryData,
  { deliberationUpdated: DeliberationUpdatedEvent }
> = (prev, { data }) => {
  if (!data?.deliberationUpdated) return prev;

  const event = data.deliberationUpdated;
  const { deliberationId } = event;

  if (!prev.division?.judging) return prev;

  // Find which category has the deliberation with this ID
  const categoryKey = (['innovation_project', 'robot_design', 'core_values'] as const).find(
    category => prev.division?.judging[category]?.id === deliberationId
  );

  if (!categoryKey) {
    return prev;
  }

  let updates: Record<string, unknown> = {};

  switch (event.__typename) {
    case 'DeliberationPicklistUpdated':
      updates = { picklist: event.picklist };
      break;
    case 'DeliberationStarted':
      updates = { startTime: event.startTime, status: 'in-progress' };
      break;
    case 'DeliberationCompleted':
      updates = { status: 'completed' };
      break;
  }

  return merge(prev, {
    division: {
      judging: {
        [categoryKey]: updates
      }
    }
  });
};

export function createDeliberationUpdatedSubscription(divisionId: string) {
  return {
    subscription: DELIBERATION_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: deliberationUpdatedReconciler as (
      prev: QueryData,
      subscriptionData: { data?: unknown }
    ) => QueryData
  };
}
