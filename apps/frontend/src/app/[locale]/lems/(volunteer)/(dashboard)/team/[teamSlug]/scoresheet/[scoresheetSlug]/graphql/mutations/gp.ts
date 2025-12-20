import { gql, type TypedDocumentNode } from '@apollo/client';

type GPMutationResult = {
  updateScoresheetGP: {
    scoresheetId: string;
    gpValue: number | null;
    notes?: string;
    version: number;
  };
};

type GPMutationVariables = {
  divisionId: string;
  scoresheetId: string;
  value: number | null;
  notes?: string;
};

export const UPDATE_SCORESHEET_GP_MUTATION: TypedDocumentNode<
  GPMutationResult,
  GPMutationVariables
> = gql`
  mutation UpdateScoresheetGP(
    $divisionId: String!
    $scoresheetId: String!
    $value: Int
    $notes: String
  ) {
    updateScoresheetGP(
      divisionId: $divisionId
      scoresheetId: $scoresheetId
      value: $value
      notes: $notes
    ) {
      scoresheetId
      gpValue
      notes
      version
    }
  }
`;
