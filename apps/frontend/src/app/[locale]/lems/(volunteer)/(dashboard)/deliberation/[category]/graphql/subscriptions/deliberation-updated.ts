import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge, type Reconciler } from '@lems/shared/utils';
import type { CategoryDeliberationData, DeliberationStatus } from '../types';

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
