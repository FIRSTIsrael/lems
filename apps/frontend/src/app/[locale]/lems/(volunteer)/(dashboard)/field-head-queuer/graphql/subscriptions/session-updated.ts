import { gql } from '@apollo/client';

export const SESSION_UPDATED_SUBSCRIPTION = gql`
  subscription SessionUpdated($divisionId: String!) {
    sessionUpdated(divisionId: $divisionId) {
      sessionId
    }
  }
`;

export function createSessionUpdatedSubscription(divisionId: string) {
  return {
    subscription: SESSION_UPDATED_SUBSCRIPTION,
    variables: { divisionId },
    updateQuery: (prev: any) => prev
  };
}
