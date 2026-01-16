import { gql, TypedDocumentNode } from '@apollo/client';
import { AwardsPresentation } from '@lems/database';

interface UpdatePresentationEvent {
  awardsPresentation: AwardsPresentation;
}

interface UpdatePresentationMutationData {
  updatePresentation: UpdatePresentationEvent;
}

interface UpdatePresentationMutationVars {
  divisionId: string;
  slideIndex: number;
  stepIndex: number;
}

export const UPDATE_PRESENTATION_MUTATION: TypedDocumentNode<
  UpdatePresentationMutationData,
  UpdatePresentationMutationVars
> = gql`
  mutation UpdatePresentation($divisionId: String!, $slideIndex: Int!, $stepIndex: Int!) {
    updatePresentation(divisionId: $divisionId, slideIndex: $slideIndex, stepIndex: $stepIndex) {
      awardsPresentation {
        slideIndex
        stepIndex
      }
    }
  }
`;

/**
 * Creates an optimistic response for the UPDATE_PRESENTATION_MUTATION
 * This provides immediate UI feedback while waiting for the server response
 */
export function getUpdatePresentationOptimisticResponse(
  variables: UpdatePresentationMutationVars
): UpdatePresentationMutationData {
  return {
    updatePresentation: {
      awardsPresentation: {
        slideIndex: variables.slideIndex,
        stepIndex: variables.stepIndex
      }
    }
  };
}
