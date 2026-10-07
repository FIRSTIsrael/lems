import { gql, TypedDocumentNode } from '@apollo/client';
import type {
  PracticeTablesConfig,
  PracticeTableAssignment
} from '../../../practice-tables-manager/graphql/types';

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

interface QueryVars {
  divisionId: string;
}

export const GET_PRACTICE_TABLES_REPORT: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetPracticeTablesReport($divisionId: String!) {
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
        schedule {
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
    }
  }
`;
