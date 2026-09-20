import { gql, TypedDocumentNode } from '@apollo/client';

interface Team {
  id: string;
  number: number;
  name: string;
  affiliation: string;
}

interface PracticeTableAssignment {
  id: string;
  tableIndex: number;
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
  team: Team;
}

interface BlockedTimeSlot {
  start: string; // ISO 8601 datetime
  end: string; // ISO 8601 datetime
  reason?: string;
}

interface PracticeTablesConfig {
  divisionId: string;
  tableCount: number;
  slotDurationMinutes: number;
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
  blockedTimeSlots: BlockedTimeSlot[];
}

interface QueryData {
  division: {
    id: string;
    practiceTables: {
      config: PracticeTablesConfig | null;
      schedule: PracticeTableAssignment[];
    };
  } | null;
}

interface QueryVars {
  divisionId: string;
}

export const GET_PRACTICE_TABLES_REPORT: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetPracticeTablesReport($divisionId: String!) {
    division(id: $divisionId) {
      id
      practiceTables {
        config {
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
        schedule {
          id
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
    }
  }
`;
