import { gql, TypedDocumentNode } from '@apollo/client';

interface AdvanceFinalDeliberationStageVariables {
  divisionId: string;
}

interface AdvanceFinalDeliberationStageData {
  advanceFinalDeliberationStage: {
    stage: string;
  };
}

export const ADVANCE_FINAL_DELIBERATION_STAGE_MUTATION: TypedDocumentNode<
  AdvanceFinalDeliberationStageData,
  AdvanceFinalDeliberationStageVariables
> = gql`
  mutation AdvanceFinalDeliberationStage($divisionId: String!) {
    advanceFinalDeliberationStage(divisionId: $divisionId) {
      stage
    }
  }
`;
