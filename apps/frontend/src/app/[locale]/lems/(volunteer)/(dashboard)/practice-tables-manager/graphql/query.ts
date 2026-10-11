import { gql, TypedDocumentNode } from '@apollo/client';
import type {
  PracticeTablesConfigData,
  PracticeTablesConfigVars,
  PracticeTableAssignmentsData,
  PracticeTableAssignmentsVars
} from './types';

export const GET_PRACTICE_TABLES_CONFIG: TypedDocumentNode<
  PracticeTablesConfigData,
  PracticeTablesConfigVars
> = gql`
  query GetPracticeTablesConfig($divisionId: String!) {
    division(id: $divisionId) {
      id
      practiceTables {
        divisionId
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
        divisionId
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
