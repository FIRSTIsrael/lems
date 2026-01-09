import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge, type Reconciler, underscoresToHyphens } from '@lems/shared/utils';
import { rubrics } from '@lems/shared/rubrics';
import { JudgingCategory } from '@lems/types/judging';
import type { FinalDeliberationData } from '../types';

type RubricValueUpdatedEvent = {
  __typename: 'RubricValueUpdated';
  rubricId: string;
  fieldId: string;
  value: { value: number; notes?: string };
};

type RubricFeedbackUpdatedEvent = {
  __typename: 'RubricFeedbackUpdated';
  rubricId: string;
  feedback: { greatJob: string; thinkAbout: string };
};

type RubricStatusUpdatedEvent = {
  __typename: 'RubricStatusUpdated';
  rubricId: string;
  status: string;
};

type RubricAwardsUpdatedEvent = {
  __typename: 'RubricAwardsUpdated';
  rubricId: string;
  awards: Record<string, boolean>;
};

type RubricResetEvent = {
  __typename: 'RubricReset';
  rubricId: string;
  reset: boolean;
};

type RubricUpdatedEvent =
  | RubricValueUpdatedEvent
  | RubricFeedbackUpdatedEvent
  | RubricStatusUpdatedEvent
  | RubricAwardsUpdatedEvent
  | RubricResetEvent;

type SubscriptionResult = {
  rubricUpdated: RubricUpdatedEvent;
};

type SubscriptionVariables = {
  divisionId: string;
};

export const RUBRIC_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  SubscriptionResult,
  SubscriptionVariables
> = gql`
  subscription RubricUpdated($divisionId: String!) {
    rubricUpdated(divisionId: $divisionId) {
      __typename
      ... on RubricValueUpdated {
        rubricId
        fieldId
        value {
          value
          notes
        }
      }
      ... on RubricFeedbackUpdated {
        rubricId
        feedback {
          greatJob
          thinkAbout
        }
      }
      ... on RubricStatusUpdated {
        rubricId
        status
      }
      ... on RubricAwardsUpdated {
        rubricId
        awards
      }
      ... on RubricReset {
        rubricId
        reset
      }
    }
  }
`;

const getEmptyRubric = (category: JudgingCategory) => {
  const schema = rubrics[category];

  const awards: { [awardId: string]: boolean } = {};

  const fields: { [fieldId: string]: { value: number | null; notes?: string } } = {};
  schema.sections.forEach(section => {
    section.fields.forEach(field => {
      fields[field.id] = { value: null };
    });
  });

  const feedback = {
    greatJob: '',
    thinkAbout: ''
  };

  return { awards, fields, feedback };
};

const rubricUpdatedReconciler: Reconciler<FinalDeliberationData, SubscriptionResult> = (
  prev,
  { data }
) => {
  if (!data?.rubricUpdated) {
    return prev;
  }

  const event = data.rubricUpdated;
  const { rubricId } = event;

  const updatedTeams = prev.division.teams.map(team => {
    const rubricEntry = Object.entries(team.rubrics).find(([, r]) => r?.id === rubricId);
    if (!rubricEntry) return team;

    const [rubricType, rubric] = rubricEntry;
    if (!rubric) return team;

    const category = underscoresToHyphens(rubric.category) as JudgingCategory;

    let updatedRubric = { ...rubric };

    if (event.__typename === 'RubricValueUpdated') {
      updatedRubric = merge(rubric, {
        data: merge(rubric.data || getEmptyRubric(category), {
          fields: {
            ...(rubric.data?.fields || {}),
            [event.fieldId]: event.value
          }
        })
      });
    } else if (event.__typename === 'RubricFeedbackUpdated') {
      updatedRubric = merge(rubric, {
        data: merge(rubric.data || getEmptyRubric(category), {
          feedback: event.feedback
        })
      });
    } else if (event.__typename === 'RubricStatusUpdated') {
      updatedRubric = merge(rubric, {
        status: event.status
      });
    } else if (event.__typename === 'RubricAwardsUpdated') {
      updatedRubric = merge(rubric, {
        data: merge(rubric.data || getEmptyRubric(category), {
          awards: event.awards
        })
      });
    } else if (event.__typename === 'RubricReset') {
      if (!event.reset) return team;
      updatedRubric = merge(rubric, {
        data: null
      });
    }

    return {
      ...team,
      rubrics: {
        ...team.rubrics,
        [rubricType]: updatedRubric
      }
    };
  });

  return merge(prev, {
    division: {
      teams: updatedTeams
    }
  });
};

export function createRubricUpdatedSubscription(divisionId: string) {
  return {
    subscription: RUBRIC_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: rubricUpdatedReconciler as (
      prev: FinalDeliberationData,
      subscriptionData: { data?: unknown }
    ) => FinalDeliberationData
  };
}
