import { gql, TypedDocumentNode } from '@apollo/client';

type ValueMutationResult = {
  updateRubricValue: {
    rubricId: string;
    fieldId: string;
    value: { value: number; notes?: string };
    version: number;
  };
};

type ValueMutationVariables = {
  divisionId: string;
  rubricId: string;
  fieldId: string;
  value: number;
  notes?: string;
};

export const UPDATE_RUBRIC_VALUE_MUTATION: TypedDocumentNode<
  ValueMutationResult,
  ValueMutationVariables
> = gql`
  mutation UpdateRubricValue(
    $divisionId: String!
    $rubricId: String!
    $fieldId: String!
    $value: Int!
    $notes: String
  ) {
    updateRubricValue(
      divisionId: $divisionId
      rubricId: $rubricId
      fieldId: $fieldId
      value: $value
      notes: $notes
    ) {
      rubricId
      fieldId
      value {
        value
        notes
      }
      version
    }
  }
`;
