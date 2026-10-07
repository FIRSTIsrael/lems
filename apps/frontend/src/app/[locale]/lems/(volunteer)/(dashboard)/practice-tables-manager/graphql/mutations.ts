import { gql, TypedDocumentNode } from '@apollo/client';
import type { UpdateAssignmentData, UpdateAssignmentVars } from './types';

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
