import { gql, TypedDocumentNode } from '@apollo/client';

interface UpdateFinalDeliberationAwardsVariables {
  divisionId: string;
  awards: string;
}

interface UpdateFinalDeliberationAwardsData {
  updateFinalDeliberationAwards: {
    awards: string;
  };
}

export const UPDATE_FINAL_DELIBERATION_AWARDS_MUTATION: TypedDocumentNode<
  UpdateFinalDeliberationAwardsData,
  UpdateFinalDeliberationAwardsVariables
> = gql`
  mutation UpdateFinalDeliberationAwards($divisionId: String!, $awards: String!) {
    updateFinalDeliberationAwards(divisionId: $divisionId, awards: $awards) {
      awards
    }
  }
`;
