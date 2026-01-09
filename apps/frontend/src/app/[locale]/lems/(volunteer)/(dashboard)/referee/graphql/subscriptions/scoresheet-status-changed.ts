import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { RefereeData, RefereeMatch } from '../types';

interface ScoresheetStatusChangedEvent {
  scoresheetId: string;
  status: string;
  escalated: boolean;
}

interface SubscriptionData {
  scoresheetStatusChanged: ScoresheetStatusChangedEvent;
}

interface SubscriptionVars {
  divisionId: string;
}

export const SCORESHEET_STATUS_CHANGED_SUBSCRIPTION: TypedDocumentNode<
  SubscriptionData,
  SubscriptionVars
> = gql`
  subscription ScoresheetStatusChanged($divisionId: String!) {
    scoresheetStatusChanged(divisionId: $divisionId) {
      scoresheetId
      status
      escalated
    }
  }
`;

export function createScoresheetStatusChangedSubscription(divisionId: string) {
  return {
    subscription: SCORESHEET_STATUS_CHANGED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: RefereeData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;

      const event = (data as SubscriptionData).scoresheetStatusChanged;
      const { scoresheetId, status, escalated } = event;

      return merge(prev, {
        division: {
          field: {
            matches: prev.division.field.matches.map((match: RefereeMatch) =>
              merge(match, {
                participants: match.participants.map(participant =>
                  participant.scoresheet?.id === scoresheetId
                    ? merge(participant, {
                        scoresheet: merge(participant.scoresheet, {
                          status,
                          escalated
                        })
                      })
                    : participant
                )
              })
            )
          }
        }
      });
    }
  };
}
