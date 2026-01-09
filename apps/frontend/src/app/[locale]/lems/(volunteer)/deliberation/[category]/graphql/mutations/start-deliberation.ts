import { gql, TypedDocumentNode } from '@apollo/client';

interface StartDeliberationVariables {
  divisionId: string;
  category: string;
}

interface StartDeliberationData {
  startDeliberation: {
    deliberationId: string;
    status: string;
    startTime: string;
  };
}

export const START_DELIBERATION_MUTATION: TypedDocumentNode<
  StartDeliberationData,
  StartDeliberationVariables
> = gql`
  mutation StartDeliberation($divisionId: String!, $category: JudgingCategory!) {
    startDeliberation(divisionId: $divisionId, category: $category) {
      deliberationId
      status
      startTime
    }
  }
`;
