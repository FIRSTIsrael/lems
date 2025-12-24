import { gql, type TypedDocumentNode } from '@apollo/client';

type StatusMutationResult = {
  updateScoresheetStatus: {
    scoresheetId: string;
    status: string;
  };
};

type StatusMutationVariables = {
  divisionId: string;
  scoresheetId: string;
  status: string;
};

export const UPDATE_SCORESHEET_STATUS_MUTATION: TypedDocumentNode<
  StatusMutationResult,
  StatusMutationVariables
> = gql`
  mutation UpdateScoresheetStatus(
    $divisionId: String!
    $scoresheetId: String!
    $status: ScoresheetStatus!
  ) {
    updateScoresheetStatus(divisionId: $divisionId, scoresheetId: $scoresheetId, status: $status) {
      scoresheetId
      status
    }
  }
`;
