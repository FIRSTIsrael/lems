import { gql, TypedDocumentNode } from '@apollo/client';

interface CompleteFinalDeliberationVariables {
  divisionId: string;
}

interface CompleteFinalDeliberationData {
  completeFinalDeliberation: {
    status: string;
  };
}

export const COMPLETE_FINAL_DELIBERATION_MUTATION: TypedDocumentNode<
  CompleteFinalDeliberationData,
  CompleteFinalDeliberationVariables
> = gql`
  mutation CompleteFinalDeliberation($divisionId: String!) {
    completeFinalDeliberation(divisionId: $divisionId) {
      status
    }
  }
`;
