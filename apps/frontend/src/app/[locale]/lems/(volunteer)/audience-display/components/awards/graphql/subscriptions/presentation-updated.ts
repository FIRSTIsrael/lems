import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, Reconciler } from '@lems/shared/utils';
import { AwardsPresentation } from '@lems/database';
import type { SubscriptionConfig } from '../../../../../hooks/use-page-data';
import type { AudienceDisplayData } from '../../../../graphql/types';

interface PresentationUpdatedEvent {
  awardsPresentation: AwardsPresentation;
}

interface PresentationUpdatedSubscriptionData {
  presentationUpdated: PresentationUpdatedEvent;
}

interface SubscriptionVars {
  divisionId: string;
}

export const PRESENTATION_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  PresentationUpdatedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription PresentationUpdated($divisionId: String!) {
    presentationUpdated(divisionId: $divisionId) {
      awardsPresentation {
        slideIndex
        stepIndex
      }
    }
  }
`;

const presentationUpdatedReconciler: Reconciler<
  AudienceDisplayData,
  PresentationUpdatedSubscriptionData
> = (prev, { data }) => {
  if (!data?.presentationUpdated) return prev;
  const event = data.presentationUpdated;
  const { awardsPresentation } = event;

  return merge(prev, {
    division: {
      field: {
        audienceDisplay: {
          awardsPresentation
        }
      }
    }
  });
};

export function createPresentationUpdatedSubscription(
  divisionId: string
): SubscriptionConfig<unknown, AudienceDisplayData, SubscriptionVars> {
  return {
    subscription: PRESENTATION_UPDATED_SUBSCRIPTION,
    subscriptionVariables: {
      divisionId
    },
    updateQuery: presentationUpdatedReconciler as (
      prev: AudienceDisplayData,
      subscriptionData: { data?: unknown }
    ) => AudienceDisplayData
  };
}
