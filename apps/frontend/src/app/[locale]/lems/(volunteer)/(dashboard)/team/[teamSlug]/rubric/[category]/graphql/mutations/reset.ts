import { gql, TypedDocumentNode } from '@apollo/client';

type ResetRubricMutationResult = {
  resetRubric: {
    rubricId: string;
    data: Record<string, unknown>;
    version: number;
  };
};

type ResetRubricMutationVariables = {
  divisionId: string;
  rubricId: string;
  data: Record<string, unknown>;
};

export const RESET_RUBRIC_MUTATION: TypedDocumentNode<
  ResetRubricMutationResult,
  ResetRubricMutationVariables
> = gql`
  mutation ResetRubric($divisionId: String!, $rubricId: String!, $data: JSON!) {
    resetRubric(divisionId: $divisionId, rubricId: $rubricId, data: $data) {
      rubricId
      data
      version
    }
  }
`;
