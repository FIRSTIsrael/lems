import { gql, TypedDocumentNode } from '@apollo/client';

interface PracticeTablesConfig {
  divisionId: string;
  tableCount: number;
  slotDurationMinutes: number;
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
  blockedTimeSlots: Array<{
    start: string; // ISO 8601 datetime
    end: string; // ISO 8601 datetime
    reason?: string;
  }>;
}

interface PracticeTablesConfigData {
  division: {
    id: string;
    practiceTables: {
      config: PracticeTablesConfig | null;
    };
  } | null;
}

interface PracticeTablesConfigVars {
  divisionId: string;
}

interface Team {
  id: string;
  number: number;
  name: string;
  affiliation?: string;
}

interface PracticeTableAssignment {
  id: string;
  divisionId: string;
  team: Team;
  tableIndex: number;
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
}

interface PracticeTableAssignmentsData {
  division: {
    id: string;
    practiceTables: {
      schedule: PracticeTableAssignment[];
    };
  } | null;
}

interface PracticeTableAssignmentsVars {
  divisionId: string;
}

interface UpdateAssignmentData {
  updatePracticeTableAssignment: PracticeTableAssignment;
}

interface UpdateAssignmentVars {
  input: {
    divisionId: string;
    teamId: string | null;
    tableIndex: number;
    startTime: string;
  };
}

export const GET_PRACTICE_TABLES_CONFIG: TypedDocumentNode<
  PracticeTablesConfigData,
  PracticeTablesConfigVars
> = gql`
  query GetPracticeTablesConfig($divisionId: String!) {
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
      }
    }
  }
`;

export const GET_PRACTICE_TABLE_ASSIGNMENTS: TypedDocumentNode<
  PracticeTableAssignmentsData,
  PracticeTableAssignmentsVars
> = gql`
  query GetPracticeTableAssignments($divisionId: String!) {
    division(id: $divisionId) {
      id
      practiceTables {
        schedule {
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
    }
  }
`;

export const UPDATE_PRACTICE_TABLE_ASSIGNMENT: TypedDocumentNode<
  UpdateAssignmentData,
  UpdateAssignmentVars
> = gql`
  mutation UpdatePracticeTableAssignment($input: UpdatePracticeTableSlotInput!) {
    updatePracticeTableAssignment(input: $input) {
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
