import { gql, TypedDocumentNode } from '@apollo/client';

interface CompleteDeliberationVariables {
  divisionId: string;
  category: string;
}

interface CompleteDeliberationData {
  completeDeliberation: {
    deliberationId: string;
    completed: boolean;
  };
}

export const COMPLETE_DELIBERATION_MUTATION: TypedDocumentNode<
  CompleteDeliberationData,
  CompleteDeliberationVariables
> = gql`
  mutation CompleteDeliberation($divisionId: String!, $category: JudgingCategory!) {
    completeDeliberation(divisionId: $divisionId, category: $category) {
      deliberationId
      completed
    }
  }
`;
