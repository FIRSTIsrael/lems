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
  tableNumber: number;
  startTime: string;
  endTime: string;
}

interface AssignmentsSubscriptionData {
  practiceTableAssignmentsUpdated: PracticeTableAssignment[];
}

interface AssignmentsQueryData {
  practiceTableAssignments: PracticeTableAssignment[];
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
      tableNumber
      startTime
      endTime
    }
  }
`;

const assignmentsReconciler = (
  _prev: AssignmentsQueryData,
  { data }: { data?: AssignmentsSubscriptionData }
): AssignmentsQueryData => {
  if (!data) return _prev;
  return {
    practiceTableAssignments: data.practiceTableAssignmentsUpdated
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

export const PRACTICE_TABLES_CONFIG_SUBSCRIPTION = gql`
  subscription PracticeTablesConfigUpdated($divisionId: String!) {
    practiceTablesConfigUpdated(divisionId: $divisionId) {
      divisionId
      tableCount
      slotDurationMinutes
      startTime
      endTime
      blockedTimeSlots {
        start
        end
        reason
      }
    }
  }
`;
