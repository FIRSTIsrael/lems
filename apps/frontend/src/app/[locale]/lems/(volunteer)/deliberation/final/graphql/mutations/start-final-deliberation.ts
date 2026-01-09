import { gql, TypedDocumentNode } from '@apollo/client';

interface StartFinalDeliberationVariables {
  divisionId: string;
}

interface StartFinalDeliberationData {
  startFinalDeliberation: {
    status: string;
    stage: string;
    startTime: string;
  };
}

export const START_FINAL_DELIBERATION_MUTATION: TypedDocumentNode<
  StartFinalDeliberationData,
  StartFinalDeliberationVariables
> = gql`
  mutation StartFinalDeliberation($divisionId: String!) {
    startFinalDeliberation(divisionId: $divisionId) {
      status
      stage
      startTime
    }
  }
`;
