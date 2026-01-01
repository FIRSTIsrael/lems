import { gql, type TypedDocumentNode } from '@apollo/client';

type ResetMutationResult = {
  resetScoresheet: {
    scoresheetId: string;
    status: string;
  };
};

type ResetMutationVariables = {
  divisionId: string;
  scoresheetId: string;
};

export const RESET_SCORESHEET_MUTATION: TypedDocumentNode<
  ResetMutationResult,
  ResetMutationVariables
> = gql`
  mutation ResetScoresheet($divisionId: String!, $scoresheetId: String!) {
    resetScoresheet(divisionId: $divisionId, scoresheetId: $scoresheetId) {
      scoresheetId
      status
    }
  }
`;
