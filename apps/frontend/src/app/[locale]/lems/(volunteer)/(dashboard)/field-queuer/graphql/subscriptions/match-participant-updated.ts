import { gql, TypedDocumentNode } from '@apollo/client';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { QueryData } from '../query';

interface SubscriptionVars {
  divisionId: string;
}

export interface MatchParticipantUpdatedEvent {
  matchId: string;
  teamId: string;
  queued: string | null;
  present: string | null;
  ready: string | null;
}

export interface MatchParticipantUpdatedData {
  matchParticipantUpdated: MatchParticipantUpdatedEvent;
}

export const MATCH_PARTICIPANT_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  MatchParticipantUpdatedData,
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
    updateQuery: (prev: QueryData, subscriptionData: { data?: unknown }) => {
      const data = subscriptionData.data as MatchParticipantUpdatedData | undefined;
      if (!data || !prev.division) return prev;

      const { matchId, teamId, queued } = data.matchParticipantUpdated;

      return {
        ...prev,
        division: {
          ...prev.division,
          field: {
            ...prev.division.field,
            matches: prev.division.field.matches.map(match => {
              if (match.id !== matchId) return match;

              return {
                ...match,
                participants: match.participants.map(participant => {
                  if (participant.team?.id !== teamId) return participant;

                  return {
                    ...participant,
                    queued: queued !== null
                  };
                })
              };
            })
          }
        }
      };
    }
  } as SubscriptionConfig<unknown, QueryData, SubscriptionVars>;
}
