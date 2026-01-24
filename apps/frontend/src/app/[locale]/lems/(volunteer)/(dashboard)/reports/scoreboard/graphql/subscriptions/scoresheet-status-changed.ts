import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { QueryData } from '../types';

export interface ScoresheetStatusChangedEvent {
  scoresheetId: string;
  status: string;
}

export interface ScoresheetStatusChangedSubscriptionData {
  scoresheetStatusChanged: ScoresheetStatusChangedEvent;
}

interface SubscriptionVars {
  divisionId: string;
}

export const SCORESHEET_STATUS_CHANGED_SUBSCRIPTION: TypedDocumentNode<
  ScoresheetStatusChangedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription ScoresheetStatusChanged($divisionId: String!) {
    scoresheetStatusChanged(divisionId: $divisionId) {
      scoresheetId
      status
    }
  }
`;

export function createScoresheetStatusChangedSubscription(divisionId: string) {
  return {
    subscription: SCORESHEET_STATUS_CHANGED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: QueryData, { data }: { data?: unknown }) => {
      if (!prev.division || !data) return prev;

      const { scoresheetId, status } = (data as ScoresheetStatusChangedSubscriptionData)
        .scoresheetStatusChanged;

      return merge(prev, {
        division: {
          id: prev.division.id,
          teams: prev.division.teams.map(team =>
            merge(team, {
              scoresheets: team.scoresheets.map(scoresheet =>
                scoresheet.id === scoresheetId ? merge(scoresheet, { status }) : scoresheet
              )
            })
          )
        }
      });
    }
  };
}
