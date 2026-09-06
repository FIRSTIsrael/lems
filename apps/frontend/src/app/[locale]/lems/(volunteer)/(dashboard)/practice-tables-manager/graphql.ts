import { gql, TypedDocumentNode } from '@apollo/client';

interface PracticeTablesConfig {
  divisionId: string;
  tableCount: number;
  slotDurationMinutes: number;
  startTime: string;
  endTime: string;
  blockedTimeSlots: Array<{
    start: string;
    end: string;
    reason?: string;
  }>;
}

interface PracticeTablesConfigData {
  practiceTablesConfig: PracticeTablesConfig | null;
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
  tableNumber: number;
  startTime: string;
  endTime: string;
}

interface PracticeTableAssignmentsData {
  practiceTableAssignments: PracticeTableAssignment[];
}

interface PracticeTableAssignmentsVars {
  divisionId: string;
}

interface CreateAssignmentData {
  createPracticeTableAssignment: PracticeTableAssignment;
}

interface CreateAssignmentVars {
  input: {
    divisionId: string;
    teamId: string;
    tableNumber: number;
    startTime: string;
    endTime: string;
  };
}

interface DeleteAssignmentData {
  deletePracticeTableAssignment: boolean;
}

interface DeleteAssignmentVars {
  assignmentId: string;
}

export const GET_PRACTICE_TABLES_CONFIG: TypedDocumentNode<
  PracticeTablesConfigData,
  PracticeTablesConfigVars
> = gql`
  query GetPracticeTablesConfig($divisionId: String!) {
    practiceTablesConfig(divisionId: $divisionId) {
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

export const GET_PRACTICE_TABLE_ASSIGNMENTS: TypedDocumentNode<
  PracticeTableAssignmentsData,
  PracticeTableAssignmentsVars
> = gql`
  query GetPracticeTableAssignments($divisionId: String!) {
    practiceTableAssignments(divisionId: $divisionId) {
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

export const CREATE_PRACTICE_TABLE_ASSIGNMENT: TypedDocumentNode<
  CreateAssignmentData,
  CreateAssignmentVars
> = gql`
  mutation CreatePracticeTableAssignment($input: CreatePracticeTableAssignmentInput!) {
    createPracticeTableAssignment(input: $input) {
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

export const DELETE_PRACTICE_TABLE_ASSIGNMENT: TypedDocumentNode<
  DeleteAssignmentData,
  DeleteAssignmentVars
> = gql`
  mutation DeletePracticeTableAssignment($assignmentId: String!) {
    deletePracticeTableAssignment(assignmentId: $assignmentId)
  }
`;
