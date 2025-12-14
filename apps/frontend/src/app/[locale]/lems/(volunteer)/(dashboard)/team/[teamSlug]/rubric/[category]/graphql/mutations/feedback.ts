import { gql, TypedDocumentNode } from '@apollo/client';

type FeedbackMutationResult = {
  updateRubricFeedback: {
    rubricId: string;
    feedback: { greatJob: string; thinkAbout: string };
    version: number;
  };
};

type FeedbackMutationVariables = {
  divisionId: string;
  rubricId: string;
  greatJob: string;
  thinkAbout: string;
};

export const UPDATE_RUBRIC_FEEDBACK_MUTATION: TypedDocumentNode<
  FeedbackMutationResult,
  FeedbackMutationVariables
> = gql`
  mutation UpdateRubricFeedback(
    $divisionId: String!
    $rubricId: String!
    $greatJob: String!
    $thinkAbout: String!
  ) {
    updateRubricFeedback(
      divisionId: $divisionId
      rubricId: $rubricId
      greatJob: $greatJob
      thinkAbout: $thinkAbout
    ) {
      rubricId
      feedback {
        greatJob
        thinkAbout
      }
      version
    }
  }
`;
