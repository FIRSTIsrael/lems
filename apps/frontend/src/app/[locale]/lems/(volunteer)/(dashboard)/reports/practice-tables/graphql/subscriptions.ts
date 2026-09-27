import { gql, TypedDocumentNode } from '@apollo/client';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type {
  PracticeTablesConfig,
  PracticeTableAssignment
} from '../../../practice-tables-manager/graphql/types';

interface AssignmentsSubscriptionData {
  practiceTableAssignmentsUpdated: PracticeTableAssignment[];
}

interface QueryData {
  division: {
    id: string;
    practiceTables: {
      divisionId: string;
      config: PracticeTablesConfig | null;
      schedule: PracticeTableAssignment[];
    };
  } | null;
}

interface SubscriptionVars {
  divisionId: string;
}

export const PRACTICE_TABLE_ASSIGNMENTS_SUBSCRIPTION: TypedDocumentNode<
  AssignmentsSubscriptionData,
  SubscriptionVars
> = gql`
  subscription PracticeTableAssignmentsUpdated($divisionId: String!) {
    practiceTableAssignmentsUpdated(divisionId: $divisionId) {
      id
      divisionId
      tableIndex
      startTime
      endTime
      team {
        id
        number
        name
        affiliation
      }
    }
  }
`;

const assignmentsReconciler = (
  prev: QueryData,
  { data }: { data?: AssignmentsSubscriptionData }
): QueryData => {
  if (!data || !prev.division) return prev;
  return {
    division: {
      ...prev.division,
      practiceTables: {
        divisionId: prev.division.practiceTables.divisionId,
        config: prev.division.practiceTables.config,
        schedule: data.practiceTableAssignmentsUpdated
      }
    }
  };
};

export function createPracticeTableAssignmentsSubscription(
  divisionId: string
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  return {
    subscription: PRACTICE_TABLE_ASSIGNMENTS_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: assignmentsReconciler
  } as SubscriptionConfig<unknown, QueryData, SubscriptionVars>;
}
