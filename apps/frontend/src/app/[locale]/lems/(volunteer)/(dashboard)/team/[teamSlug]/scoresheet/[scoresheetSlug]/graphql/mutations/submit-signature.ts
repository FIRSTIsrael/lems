import { gql, type TypedDocumentNode } from '@apollo/client';

type SubmitSignatureMutationResult = {
  submitScoresheetWithSignature: {
    scoresheetId: string;
    signature: string;
    status: string;
    version: number;
  };
};

type SubmitSignatureMutationVariables = {
  divisionId: string;
  scoresheetId: string;
  signature: string;
};

export const SUBMIT_SCORESHEET_WITH_SIGNATURE_MUTATION: TypedDocumentNode<
  SubmitSignatureMutationResult,
  SubmitSignatureMutationVariables
> = gql`
  mutation SubmitScoresheetWithSignature(
    $divisionId: String!
    $scoresheetId: String!
    $signature: String!
  ) {
    submitScoresheetWithSignature(
      divisionId: $divisionId
      scoresheetId: $scoresheetId
      signature: $signature
    ) {
      scoresheetId
      signature
      status
      version
    }
  }
`;
