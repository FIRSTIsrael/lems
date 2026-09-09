import { gql, TypedDocumentNode } from '@apollo/client';

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

interface QueryData {
  division: {
    id: string;
    practiceTablesConfig: PracticeTablesConfig | null;
  } | null;
  practiceTableAssignments: PracticeTableAssignment[];
}

interface QueryVars {
  divisionId: string;
}

export const GET_PRACTICE_TABLES_REPORT: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetPracticeTablesReport($divisionId: String!) {
    division(id: $divisionId) {
      id
      practiceTablesConfig {
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
    practiceTableAssignments(divisionId: $divisionId) {
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
