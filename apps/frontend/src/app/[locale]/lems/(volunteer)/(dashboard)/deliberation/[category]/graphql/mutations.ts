import { gql, type TypedDocumentNode } from '@apollo/client';

type StartDeliberationResult = {
  startDeliberation: {
    deliberationId: string;
    status: string;
    startTime: string;
    version: number;
  };
};

type StartDeliberationVars = {
  divisionId: string;
  category: string;
};

export const START_DELIBERATION_MUTATION: TypedDocumentNode<
  StartDeliberationResult,
  StartDeliberationVars
> = gql`
  mutation StartDeliberation($divisionId: String!, $category: JudgingCategory!) {
    startDeliberation(divisionId: $divisionId, category: $category) {
      deliberationId
      status
      startTime
      version
    }
  }
`;

type UpdateDeliberationPicklistResult = {
  updateDeliberationPicklist: {
    deliberationId: string;
    picklist: string[];
    version: number;
  };
};

type UpdateDeliberationPicklistVars = {
  divisionId: string;
  category: string;
  picklist: string[];
};

export const UPDATE_DELIBERATION_PICKLIST_MUTATION: TypedDocumentNode<
  UpdateDeliberationPicklistResult,
  UpdateDeliberationPicklistVars
> = gql`
  mutation UpdateDeliberationPicklist(
    $divisionId: String!
    $category: JudgingCategory!
    $picklist: [String!]!
  ) {
    updateDeliberationPicklist(divisionId: $divisionId, category: $category, picklist: $picklist) {
      deliberationId
      picklist
      version
    }
  }
`;
