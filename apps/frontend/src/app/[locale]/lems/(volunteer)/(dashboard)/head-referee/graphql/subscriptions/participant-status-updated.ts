import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { HeadRefereeData } from '../types';

export interface ParticipantStatusUpdatedData {
  participantStatusUpdated: {
    participantId: string;
    present: string | null;
    ready: string | null;
  };
}

export interface SubscriptionVars {
  divisionId: string;
}

export const PARTICIPANT_STATUS_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  ParticipantStatusUpdatedData,
  SubscriptionVars
> = gql`
  subscription ParticipantStatusUpdated($divisionId: String!) {
    participantStatusUpdated(divisionId: $divisionId) {
      participantId
      present
      ready
    }
  }
`;

/**
 * Creates a subscription configuration for participant status updates.
 * Updates participant status (present, ready) in real-time.
 *
 * @param divisionId - The division ID to subscribe to
 * @returns Subscription configuration for use with usePageData hook
 */
export function createParticipantStatusUpdatedSubscription(divisionId: string) {
  return {
    subscription: PARTICIPANT_STATUS_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: HeadRefereeData, { data }: { data?: unknown }) => {
      if (!prev.division?.field?.matches || !data) return prev;

      const participantData = (data as ParticipantStatusUpdatedData).participantStatusUpdated;

      // Find the match containing the participant and update it
      const matches = prev.division.field.matches.map(match => {
        const hasParticipant = match.participants.some(p => p.id === participantData.participantId);
        
        if (!hasParticipant) {
          return match;
        }

        return {
          ...match,
          participants: match.participants.map(p =>
            p.id === participantData.participantId
              ? {
                  ...p,
                  present: participantData.present !== null,
                  ready: participantData.ready !== null
                }
              : p
          )
        };
      });

      return merge(prev, {
        division: {
          field: {
            matches
          }
        }
      });
    }
  } as SubscriptionConfig<unknown, HeadRefereeData, SubscriptionVars>;
}
