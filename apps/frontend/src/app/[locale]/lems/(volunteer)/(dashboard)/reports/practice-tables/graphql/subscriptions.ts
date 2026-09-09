import { gql, TypedDocumentNode } from '@apollo/client';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';

interface Team {
  id: string;
  number: number;
  name: string;
  affiliation: string;
}

interface PracticeTableAssignment {
  id: string;
  tableNumber: number;
  startTime: string;
  endTime: string;
  team: Team;
}

interface BlockedTimeSlot {
  start: string;
  end: string;
  reason?: string;
}

interface PracticeTablesConfig {
  divisionId: string;
  tableCount: number;
  slotDurationMinutes: number;
  startTime: string;
  endTime: string;
  blockedTimeSlots: BlockedTimeSlot[];
}

interface AssignmentsSubscriptionData {
  practiceTableAssignmentsUpdated: PracticeTableAssignment[];
}

interface QueryData {
  division: {
    practiceTablesConfig: PracticeTablesConfig | null;
  } | null;
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
      tableNumber
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
  if (!data) return prev;
  return {
    ...prev,
    practiceTableAssignments: data.practiceTableAssignmentsUpdated
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
