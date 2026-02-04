import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { HeadRefereeData } from '../types';

export interface MatchParticipantUpdatedEvent {
  matchId: string;
  teamId: string;
  queued: string | null;
  present: string | null;
  ready: string | null;
}

export interface MatchParticipantUpdatedSubscriptionData {
  matchParticipantUpdated: MatchParticipantUpdatedEvent;
}

interface SubscriptionVars {
  divisionId: string;
}

export const MATCH_PARTICIPANT_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  MatchParticipantUpdatedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription MatchParticipantUpdated($divisionId: String!) {
    matchParticipantUpdated(divisionId: $divisionId) {
      matchId
      teamId
      queued
      present
      ready
    }
  }
`;

export function createMatchParticipantUpdatedSubscription(divisionId: string) {
  return {
    subscription: MATCH_PARTICIPANT_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: HeadRefereeData, { data }: { data?: unknown }) => {
      if (!prev.division?.field?.matches || !data) return prev;

      const participantData = (data as MatchParticipantUpdatedSubscriptionData)
        .matchParticipantUpdated;

      const matches = prev.division.field.matches.map(match => {
        if (match.id !== participantData.matchId) return match;

        return {
          ...match,
          participants: match.participants.map(p =>
            p.team?.id === participantData.teamId
              ? {
                  ...p,
                  queued: participantData.queued !== null,
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
