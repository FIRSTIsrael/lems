import { gql, type TypedDocumentNode } from '@apollo/client';

export const START_DELIBERATION_MUTATION: TypedDocumentNode<
  {
    startDeliberation: {
      deliberationId: string;
      status: string;
      startTime: string;
    };
  },
  {
    divisionId: string;
    category: string;
  }
> = gql`
  mutation StartDeliberation($divisionId: String!, $category: JudgingCategory!) {
    startDeliberation(divisionId: $divisionId, category: $category) {
      deliberationId
      status
      startTime
    }
  }
`;

export const UPDATE_DELIBERATION_PICKLIST_MUTATION: TypedDocumentNode<
  {
    updateDeliberationPicklist: {
      deliberationId: string;
      picklist: string[];
    };
  },
  {
    divisionId: string;
    category: string;
    picklist: string[];
  }
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
