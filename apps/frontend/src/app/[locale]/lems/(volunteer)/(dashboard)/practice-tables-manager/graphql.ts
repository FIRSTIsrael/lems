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
