import { gql, TypedDocumentNode } from '@apollo/client';
import type { SubscriptionConfig } from '../../../hooks/use-page-data';
import type {
  AssignmentsSubscriptionData,
  PracticeTableAssignmentsData,
  SubscriptionVars
} from './types';

export const PRACTICE_TABLE_ASSIGNMENTS_SUBSCRIPTION: TypedDocumentNode<
  AssignmentsSubscriptionData,
  SubscriptionVars
> = gql`
  subscription PracticeTableAssignmentsUpdated($divisionId: String!) {
    practiceTableAssignmentsUpdated(divisionId: $divisionId) {
      id
      divisionId
      team {
        id
        number
        name
        affiliation
      }
      tableIndex
      startTime
      endTime
    }
  }
`;

const assignmentsReconciler = (
  prev: PracticeTableAssignmentsData,
  { data }: { data?: AssignmentsSubscriptionData }
): PracticeTableAssignmentsData => {
  if (!data || !prev.division) return prev;
  return {
    division: {
      ...prev.division,
      practiceTables: {
        divisionId: prev.division.practiceTables.divisionId,
        schedule: data.practiceTableAssignmentsUpdated
      }
    }
  };
};

export function createPracticeTableAssignmentsSubscription(
  divisionId: string
): SubscriptionConfig<unknown, PracticeTableAssignmentsData, SubscriptionVars> {
  return {
    subscription: PRACTICE_TABLE_ASSIGNMENTS_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: assignmentsReconciler
  } as SubscriptionConfig<unknown, PracticeTableAssignmentsData, SubscriptionVars>;
}
