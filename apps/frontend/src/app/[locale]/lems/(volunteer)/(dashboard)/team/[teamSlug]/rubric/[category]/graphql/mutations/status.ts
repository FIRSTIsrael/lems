import { gql, TypedDocumentNode } from '@apollo/client';
import { RubricStatus } from '@lems/database';

type RubricStatusMutationResult = {
  rubricId: string;
  status: RubricStatus;
};

type RubricStatusMutationVariables = {
  divisionId: string;
  rubricId: string;
  status: RubricStatus;
};

export const UPDATE_RUBRIC_STATUS_MUTATION: TypedDocumentNode<
  RubricStatusMutationResult,
  RubricStatusMutationVariables
> = gql`
  mutation UpdateRubricStatus($divisionId: String!, $rubricId: String!, $status: RubricStatus!) {
    updateRubricStatus(divisionId: $divisionId, rubricId: $rubricId, status: $status) {
      rubricId
      status
    }
  }
`;
