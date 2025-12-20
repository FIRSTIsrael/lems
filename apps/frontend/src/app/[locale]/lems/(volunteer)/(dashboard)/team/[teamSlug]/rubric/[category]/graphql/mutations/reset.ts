import { gql, TypedDocumentNode } from '@apollo/client';

type ResetRubricMutationResult = {
  resetRubric: {
    rubricId: string;
    reset: boolean;
    version: number;
  };
};

type ResetRubricMutationVariables = {
  divisionId: string;
  rubricId: string;
};

export const RESET_RUBRIC_MUTATION: TypedDocumentNode<
  ResetRubricMutationResult,
  ResetRubricMutationVariables
> = gql`
  mutation ResetRubric($divisionId: String!, $rubricId: String!) {
    resetRubric(divisionId: $divisionId, rubricId: $rubricId) {
      rubricId
      reset
      version
    }
  }
`;
