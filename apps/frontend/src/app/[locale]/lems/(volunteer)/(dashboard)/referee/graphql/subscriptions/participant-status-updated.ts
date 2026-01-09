import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { ParticipantStatusUpdatedEvent, RefereeData } from '../types';

interface ParticipantStatusUpdatedSubscriptionData {
  participantStatusUpdated: ParticipantStatusUpdatedEvent;
}

interface SubscriptionVars {
  divisionId: string;
}

export const PARTICIPANT_STATUS_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  ParticipantStatusUpdatedSubscriptionData,
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

export function createParticipantStatusUpdatedSubscription(divisionId: string) {
  return {
    subscription: PARTICIPANT_STATUS_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: RefereeData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      const event = (data as ParticipantStatusUpdatedSubscriptionData).participantStatusUpdated;
      return merge(prev, {
        division: {
          field: {
            matches: prev.division.field.matches.map(_match => ({
              ..._match,
              participants: _match.participants.map(p =>
                p.id === event.participantId
                  ? {
                      ...p,
                      present: !!event.present,
                      ready: !!event.ready
                    }
                  : p
              )
            }))
          }
        }
      });
    }
  } as SubscriptionConfig<unknown, RefereeData, SubscriptionVars>;
}
