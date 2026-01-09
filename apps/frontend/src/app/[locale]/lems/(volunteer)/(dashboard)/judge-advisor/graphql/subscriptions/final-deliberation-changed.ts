import { gql, TypedDocumentNode } from '@apollo/client';

interface FinalDeliberationChangedData {
  finalDeliberationChanged: {
    divisionId: string;
    stage: string;
    status: string;
    startTime?: string;
    completionTime?: string;
    champions?: Record<string, string>;
    innovationProject: string[];
    robotDesign: string[];
    coreValues: string[];
    optionalAwards?: Record<string, string[]>;
  };
}

interface FinalDeliberationChangedVars {
  divisionId: string;
}

export const FINAL_DELIBERATION_CHANGED_SUBSCRIPTION: TypedDocumentNode<
  FinalDeliberationChangedData,
  FinalDeliberationChangedVars
> = gql`
  subscription FinalDeliberationChanged($divisionId: String!) {
    finalDeliberationChanged(divisionId: $divisionId) {
      divisionId
      stage
      status
      startTime
      completionTime
      champions
      innovationProject
      robotDesign
      coreValues
      optionalAwards
    }
  }
`;

export function createFinalDeliberationChangedSubscription(divisionId: string) {
  return {
    subscription: FINAL_DELIBERATION_CHANGED_SUBSCRIPTION,
    variables: { divisionId }
  };
}
