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
  slideId?: string;
}

export const UPDATE_PRESENTATION_MUTATION: TypedDocumentNode<
  UpdatePresentationMutationData,
  UpdatePresentationMutationVars
> = gql`
  mutation UpdatePresentation(
    $divisionId: String!
    $slideIndex: Int!
    $stepIndex: Int!
    $slideId: String
  ) {
    updatePresentation(
      divisionId: $divisionId
      slideIndex: $slideIndex
      stepIndex: $stepIndex
      slideId: $slideId
    ) {
      awardsPresentation {
        slideId
        slideIndex
        stepIndex
      }
    }
  }
`;
