import { gql, TypedDocumentNode } from '@apollo/client';
import { FinalDeliberationStage } from '../../types';

interface UpdateManualEligibilityVariables {
  divisionId: string;
  stage: FinalDeliberationStage;
  teamIds: string[];
}

interface UpdateManualEligibilityData {
  updateManualEligibility: {
    stage: string;
    manualEligibility: string[];
  };
}

export const UPDATE_MANUAL_ELIGIBILITY_MUTATION: TypedDocumentNode<
  UpdateManualEligibilityData,
  UpdateManualEligibilityVariables
> = gql`
  mutation UpdateManualEligibility($divisionId: String!, $stage: String!, $teamIds: [String!]!) {
    updateManualEligibility(divisionId: $divisionId, stage: $stage, teamIds: $teamIds) {
      stage
      manualEligibility
    }
  }
`;
