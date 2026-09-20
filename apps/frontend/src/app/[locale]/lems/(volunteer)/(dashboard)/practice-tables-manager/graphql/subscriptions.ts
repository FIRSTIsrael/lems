import { gql, TypedDocumentNode } from '@apollo/client';
import type { SubscriptionConfig } from '../../../hooks/use-page-data';

interface PracticeTableAssignment {
  id: string;
  divisionId: string;
  team: {
    id: string;
    number: number;
    name: string;
    affiliation?: string;
  };
  tableIndex: number;
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
}

interface AssignmentsSubscriptionData {
  practiceTableAssignmentsUpdated: PracticeTableAssignment[];
}

interface AssignmentsQueryData {
  division: {
    id: string;
    practiceTables: {
      divisionId: string;
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
  prev: AssignmentsQueryData,
  { data }: { data?: AssignmentsSubscriptionData }
): AssignmentsQueryData => {
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
): SubscriptionConfig<unknown, AssignmentsQueryData, SubscriptionVars> {
  return {
    subscription: PRACTICE_TABLE_ASSIGNMENTS_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: assignmentsReconciler
  } as SubscriptionConfig<unknown, AssignmentsQueryData, SubscriptionVars>;
}
