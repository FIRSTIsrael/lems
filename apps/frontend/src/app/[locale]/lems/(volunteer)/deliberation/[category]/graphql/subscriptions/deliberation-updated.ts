import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge, type Reconciler } from '@lems/shared/utils';
import type { CategoryDeliberationData } from '../types';

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
  CategoryDeliberationData,
  { deliberationUpdated: DeliberationUpdatedEvent }
> = (prev, { data }) => {
  if (!data?.deliberationUpdated) return prev;

  const event = data.deliberationUpdated;
  const { deliberationId } = event;

  const currentDeliberation = prev.division.judging.deliberation;
  if (!currentDeliberation || currentDeliberation.id !== deliberationId) {
    return prev;
  }

  let updates: Partial<typeof currentDeliberation> = {};

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
        deliberation: updates
      }
    }
  });
};

export function createDeliberationUpdatedSubscription(divisionId: string) {
  return {
    subscription: DELIBERATION_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: deliberationUpdatedReconciler as (
      prev: CategoryDeliberationData,
      subscriptionData: { data?: unknown }
    ) => CategoryDeliberationData
  };
}
