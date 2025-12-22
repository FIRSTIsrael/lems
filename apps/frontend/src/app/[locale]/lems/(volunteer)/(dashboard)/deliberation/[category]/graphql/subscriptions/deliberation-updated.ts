import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge, type Reconciler } from '@lems/shared/utils';
import type { CategoryDeliberationData, DeliberationStatus } from '../types';

type DeliberationPicklistUpdatedEvent = {
  __typename: 'DeliberationPicklistUpdated';
  deliberationId: string;
  picklist: string[];
  version: number;
};

type DeliberationStartedEvent = {
  __typename: 'DeliberationStarted';
  deliberationId: string;
  startTime: string;
  version: number;
};

type DeliberationUpdatedEvent = DeliberationPicklistUpdatedEvent | DeliberationStartedEvent;

type SubscriptionResult = {
  deliberationUpdated: DeliberationUpdatedEvent;
};

type SubscriptionVariables = {
  divisionId: string;
  lastSeenVersion?: number;
};

export const DELIBERATION_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  SubscriptionResult,
  SubscriptionVariables
> = gql`
  subscription DeliberationUpdated($divisionId: String!, $lastSeenVersion: Int) {
    deliberationUpdated(divisionId: $divisionId, lastSeenVersion: $lastSeenVersion) {
      __typename
      ... on DeliberationPicklistUpdated {
        deliberationId
        picklist
        version
      }
      ... on DeliberationStarted {
        deliberationId
        startTime
        version
      }
    }
  }
`;

const deliberationUpdatedReconciler: Reconciler<CategoryDeliberationData, SubscriptionResult> = (
  prev,
  { data }
) => {
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
      updates = { startTime: event.startTime, status: 'IN_PROGRESS' as DeliberationStatus };
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
