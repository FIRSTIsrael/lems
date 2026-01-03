import { gql, type TypedDocumentNode } from '@apollo/client';

interface UpdateDeliberationPicklistVariables {
  divisionId: string;
  category: string;
  picklist: string[];
}

interface UpdateDeliberationPicklistData {
  updateDeliberationPicklist: {
    deliberationId: string;
    picklist: string[];
  };
}

export const UPDATE_DELIBERATION_PICKLIST_MUTATION: TypedDocumentNode<
  UpdateDeliberationPicklistData,
  UpdateDeliberationPicklistVariables
> = gql`
  mutation UpdateDeliberationPicklist(
    $divisionId: String!
    $category: JudgingCategory!
    $picklist: [String!]!
  ) {
    updateDeliberationPicklist(divisionId: $divisionId, category: $category, picklist: $picklist) {
      deliberationId
      picklist
    }
  }
`;
