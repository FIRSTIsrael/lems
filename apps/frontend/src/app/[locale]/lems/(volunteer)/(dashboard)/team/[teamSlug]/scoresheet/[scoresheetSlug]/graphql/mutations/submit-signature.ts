import { gql, type TypedDocumentNode } from '@apollo/client';

type SubmitSignatureMutationResult = {
  updateScoresheetSignature: {
    scoresheetId: string;
    signature: string;
    status: string;
  };
};

type SubmitSignatureMutationVariables = {
  divisionId: string;
  scoresheetId: string;
  signature: string;
};

export const SUBMIT_SCORESHEET_MUTATION: TypedDocumentNode<
  SubmitSignatureMutationResult,
  SubmitSignatureMutationVariables
> = gql`
  mutation SubmitScoresheet($divisionId: String!, $scoresheetId: String!, $signature: String!) {
    updateScoresheetSignature(
      divisionId: $divisionId
      scoresheetId: $scoresheetId
      signature: $signature
    ) {
      scoresheetId
      signature
      status
    }
  }
`;
