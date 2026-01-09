import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import { RubricStatus } from '@lems/database';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { SubscriptionVars, QueryData } from '../types';

interface RubricStatusChangedEvent {
  rubricId: string;
  status: RubricStatus;
}

interface RubricStatusChangedSubscriptionData {
  rubricStatusChanged: RubricStatusChangedEvent;
}

export const RUBRIC_STATUS_CHANGED_SUBSCRIPTION: TypedDocumentNode<
  RubricStatusChangedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription RubricStatusChanged($divisionId: String!) {
    rubricStatusChanged(divisionId: $divisionId) {
      rubricId
      status
    }
  }
`;

function updateQueryWithCallback<TSubscriptionData>(
  subscription: TypedDocumentNode<TSubscriptionData, SubscriptionVars>,
  divisionId: string,
  updateQuery: (prev: QueryData, subscriptionData: { data?: unknown }) => QueryData,
  onData?: (data: TSubscriptionData) => void
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  const baseConfig: SubscriptionConfig<unknown, QueryData, SubscriptionVars> = {
    subscription,
    subscriptionVariables: { divisionId },
    updateQuery
  };

  if (onData) {
    const originalUpdateQuery = baseConfig.updateQuery;
    baseConfig.updateQuery = (prev: QueryData, subscriptionData: { data?: unknown }) => {
      if (subscriptionData.data) {
        onData(subscriptionData.data as TSubscriptionData);
      }
      return originalUpdateQuery(prev, subscriptionData);
    };
  }

  return baseConfig;
}

export function createRubricStatusChangedSubscription(
  divisionId: string,
  onRubricStatusChanged?: (event: RubricStatusChangedEvent) => void
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  const updateQuery = (prev: QueryData, { data }: { data?: unknown }) => {
    if (!prev.division?.judging.sessions || !data) return prev;

    const { rubricId, status } = (data as RubricStatusChangedSubscriptionData).rubricStatusChanged;

    return merge(prev, {
      division: {
        id: prev.division.id,
        judging: {
          sessions: prev.division.judging.sessions.map(session =>
            merge(session, {
              rubrics: Object.entries(session.rubrics).reduce(
                (acc, [key, rubric]) => {
                  if (rubric?.id === rubricId) {
                    acc[key] = merge(rubric, { status });
                  } else {
                    acc[key] = rubric;
                  }
                  return acc;
                },
                {} as typeof session.rubrics
              )
            })
          ),
          sessionLength: prev.division.judging.sessionLength
        }
      }
    });
  };

  return updateQueryWithCallback(
    RUBRIC_STATUS_CHANGED_SUBSCRIPTION,
    divisionId,
    updateQuery,
    onRubricStatusChanged ? data => onRubricStatusChanged(data.rubricStatusChanged) : undefined
  );
}
