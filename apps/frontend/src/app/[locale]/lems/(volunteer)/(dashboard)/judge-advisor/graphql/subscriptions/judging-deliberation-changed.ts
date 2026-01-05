import { gql, TypedDocumentNode } from '@apollo/client';

interface JudgingDeliberationChangedData {
  judgingDeliberationChanged: {
    id: string;
    category: string;
    status: string;
    startTime?: string;
    picklist: string[];
  };
}

interface JudgingDeliberationChangedVars {
  divisionId: string;
}

export const JUDGING_DELIBERATION_CHANGED_SUBSCRIPTION: TypedDocumentNode<
  JudgingDeliberationChangedData,
  JudgingDeliberationChangedVars
> = gql`
  subscription JudgingDeliberationChanged($divisionId: String!) {
    judgingDeliberationChanged(divisionId: $divisionId) {
      id
      category
      status
      startTime
      picklist
    }
  }
`;

export function createJudgingDeliberationChangedSubscription(divisionId: string) {
  return {
    subscription: JUDGING_DELIBERATION_CHANGED_SUBSCRIPTION,
    variables: { divisionId }
  };
}
