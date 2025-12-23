import { gql, TypedDocumentNode } from '@apollo/client';

type AwardsMutationResult = {
  updateRubricAwards: {
    rubricId: string;
    awards: Record<string, boolean>;
  };
};

type AwardsMutationVariables = {
  divisionId: string;
  rubricId: string;
  awards: Record<string, boolean>;
};

export const UPDATE_RUBRIC_AWARDS_MUTATION: TypedDocumentNode<
  AwardsMutationResult,
  AwardsMutationVariables
> = gql`
  mutation UpdateRubricAwards($divisionId: String!, $rubricId: String!, $awards: JSON!) {
    updateRubricAwards(divisionId: $divisionId, rubricId: $rubricId, awards: $awards) {
      rubricId
      awards
    }
  }
`;
