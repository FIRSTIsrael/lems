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
  awardsPresentation: AwardsPresentation;
}

export const UPDATE_PRESENTATION_MUTATION: TypedDocumentNode<
  UpdatePresentationMutationData,
  UpdatePresentationMutationVars
> = gql`
  mutation UpdatePresentation($divisionId: String!, $awardsPresentation: AwardsPresentation!) {
    updatePresentation(divisionId: $divisionId, awardsPresentation: $awardsPresentation) {
      awardsPresentation {
        slideId
        slideIndex
        stepIndex
      }
    }
  }
`;
