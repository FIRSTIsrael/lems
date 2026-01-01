import { gql, type TypedDocumentNode } from '@apollo/client';

type EscalatedMutationResult = {
  updateScoresheetEscalated: {
    scoresheetId: string;
    escalated: boolean;
  };
};

type EscalatedMutationVariables = {
  divisionId: string;
  scoresheetId: string;
  escalated: boolean;
};

export const UPDATE_SCORESHEET_ESCALATED_MUTATION: TypedDocumentNode<
  EscalatedMutationResult,
  EscalatedMutationVariables
> = gql`
  mutation UpdateScoresheetEscalated(
    $divisionId: String!
    $scoresheetId: String!
    $escalated: Boolean!
  ) {
    updateScoresheetEscalated(
      divisionId: $divisionId
      scoresheetId: $scoresheetId
      escalated: $escalated
    ) {
      scoresheetId
      escalated
    }
  }
`;
