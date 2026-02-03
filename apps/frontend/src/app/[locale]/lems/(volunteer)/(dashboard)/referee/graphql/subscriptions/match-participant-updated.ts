import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { RefereeData } from '../types';

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
    updateQuery: (prev: RefereeData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      const event = (data as MatchParticipantUpdatedSubscriptionData).matchParticipantUpdated;
      return merge(prev, {
        division: {
          field: {
            matches: prev.division.field.matches.map(match => {
              if (match.id !== event.matchId) return match;
              return {
                ...match,
                participants: match.participants.map(p =>
                  p.team?.id === event.teamId
                    ? {
                        ...p,
                        queued: event.queued !== null,
                        present: event.present !== null,
                        ready: event.ready !== null
                      }
                    : p
                )
              };
            })
          }
        }
      });
    }
  } as SubscriptionConfig<unknown, RefereeData, SubscriptionVars>;
}
