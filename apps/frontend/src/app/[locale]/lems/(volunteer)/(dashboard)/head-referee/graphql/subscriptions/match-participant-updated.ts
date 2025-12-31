import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, updateById } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { HeadRefereeData } from '../types';

export interface MatchParticipantUpdatedData {
  matchParticipantUpdated: {
    participantId: string;
    matchId: string;
    queued: boolean;
    present: boolean;
    ready: boolean;
  };
}

export interface SubscriptionVars {
  divisionId: string;
}

export const MATCH_PARTICIPANT_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  MatchParticipantUpdatedData,
  SubscriptionVars
> = gql`
  subscription MatchParticipantUpdated($divisionId: String!) {
    matchParticipantUpdated(divisionId: $divisionId) {
      participantId
      matchId
      queued
      present
      ready
    }
  }
`;

/**
 * Creates a subscription configuration for match participant updates.
 * Updates participant status (queued, present, ready) in real-time.
 *
 * @param divisionId - The division ID to subscribe to
 * @returns Subscription configuration for use with usePageData hook
 */
export function createMatchParticipantUpdatedSubscription(divisionId: string) {
  return {
    subscription: MATCH_PARTICIPANT_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: HeadRefereeData, { data }: { data?: unknown }) => {
      if (!prev.division?.field?.matches || !data) return prev;

      const participantData = (data as MatchParticipantUpdatedData).matchParticipantUpdated;

      return merge(prev, {
        division: {
          field: {
            matches: updateById(prev.division.field.matches, participantData.matchId, match => ({
              ...match,
              participants: match.participants.map(p =>
                p.id === participantData.participantId
                  ? {
                      ...p,
                      queued: participantData.queued,
                      present: participantData.present,
                      ready: participantData.ready
                    }
                  : p
              )
            }))
          }
        }
      });
    }
  } as SubscriptionConfig<unknown, HeadRefereeData, SubscriptionVars>;
}
