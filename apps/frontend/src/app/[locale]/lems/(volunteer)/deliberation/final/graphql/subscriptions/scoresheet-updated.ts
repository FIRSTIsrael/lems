import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge, type Reconciler } from '@lems/shared/utils';
import type { FinalDeliberationData } from '../types';

type ScoresheetUpdatedEvent =
  | {
      __typename: 'ScoresheetMissionClauseUpdated';
      scoresheetId: string;
      missionId: string;
      clauseIndex: number;
      clauseValue: unknown;
      score: number;
    }
  | {
      __typename: 'ScoresheetStatusUpdated';
      scoresheetId: string;
      status: string;
    }
  | {
      __typename: 'ScoresheetGPUpdated';
      scoresheetId: string;
      gpValue: number | null;
      notes?: string;
    }
  | {
      __typename: 'ScoresheetEscalatedUpdated';
      scoresheetId: string;
      escalated: boolean;
    }
  | {
      __typename: 'ScoresheetSignatureUpdated';
      scoresheetId: string;
      signature: string | null;
      status: string;
    };

export const SCORESHEET_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  {
    scoresheetUpdated: ScoresheetUpdatedEvent;
  },
  {
    divisionId: string;
  }
> = gql`
  subscription ScoresheetUpdated($divisionId: String!) {
    scoresheetUpdated(divisionId: $divisionId) {
      __typename
      ... on ScoresheetMissionClauseUpdated {
        scoresheetId
        missionId
        clauseIndex
        clauseValue
        score
      }
      ... on ScoresheetStatusUpdated {
        scoresheetId
        status
      }
      ... on ScoresheetGPUpdated {
        scoresheetId
        gpValue
        notes
      }
      ... on ScoresheetEscalatedUpdated {
        scoresheetId
        escalated
      }
      ... on ScoresheetSignatureUpdated {
        scoresheetId
        signature
        status
      }
    }
  }
`;

const scoresheetUpdatedReconciler: Reconciler<
  FinalDeliberationData,
  { scoresheetUpdated: ScoresheetUpdatedEvent }
> = (prev, { data }) => {
  if (!data?.scoresheetUpdated) return prev;

  const event = data.scoresheetUpdated;
  const { scoresheetId } = event;

  const updatedTeams = prev.division.teams.map(team => {
    const scoresheetIndex = team.scoresheets.findIndex(s => s.id === scoresheetId);

    if (scoresheetIndex === -1) return team;

    const scoresheet = team.scoresheets[scoresheetIndex];
    let updates: Partial<typeof scoresheet> = {};

    switch (event.__typename) {
      case 'ScoresheetMissionClauseUpdated':
        // Mission clause updates are typically handled by the backend/frontend scoring logic
        // Just ensure the score is updated
        updates = {
          data: {
            ...scoresheet.data,
            score: event.score
          }
        };
        break;
      case 'ScoresheetStatusUpdated':
        // Note: Status updates might need to be handled differently
        break;
      case 'ScoresheetGPUpdated':
        if (!scoresheet.data) break;
        updates = {
          data: {
            ...scoresheet.data,
            gp: {
              value: event.gpValue as 2 | 3 | 4 | null,
              notes: event.notes
            }
          }
        };
        break;
      case 'ScoresheetEscalatedUpdated':
        // Escalation flag updates
        break;
      case 'ScoresheetSignatureUpdated':
        // Signature updates
        break;
    }

    return {
      ...team,
      scoresheets: [
        ...team.scoresheets.slice(0, scoresheetIndex),
        {
          ...scoresheet,
          ...updates
        },
        ...team.scoresheets.slice(scoresheetIndex + 1)
      ]
    };
  });

  return merge(prev, {
    division: {
      teams: updatedTeams
    }
  });
};

export function createScoresheetUpdatedSubscription(divisionId: string) {
  return {
    subscription: SCORESHEET_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: scoresheetUpdatedReconciler as (
      prev: FinalDeliberationData,
      subscriptionData: { data?: unknown }
    ) => FinalDeliberationData
  };
}
